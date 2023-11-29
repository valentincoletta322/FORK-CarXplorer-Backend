import { Request, Response } from "express";
import { listingModel } from "../models/listing.model";
import { checkListingData, checkUserPermission, getUserByToken, userIsVerified } from "../verification";
import { userIsSeller } from "../verification";
import { Console } from "node:console";
import { _URL_IMG, eliminarArchivo } from "../index";
import { queryModel } from "../models/query.model";
import { userModel } from "../models/user.model";

/* Terminado: Get all listings, get single listing, post listing, patch listing, delete listing, search listing
    Pendiente: patch listing (con permisos), delete listing (con permisos)
*/

export default {
    placeholder: (req: Request, res: Response) => {
        return res.status(200).send('Response from listing.controller.')
    },

    getAllListings: async (req: Request, res: Response) => {
        try {
            const itemsPerPage = 6;
            const page = parseInt(req.params.page) || 0;
            const listings = await listingModel.find().skip(itemsPerPage * page).limit(itemsPerPage);

            if (!listings) {
                res.status(404).send('No listings found.');
            }
            return res.status(200).json({listings: listings, URL_IMG: _URL_IMG});
        
        } catch (error) {
            console.error("Error finding listings.");
            return res.status(500).send("An error ocurred while finding listings.");
        }
    },

    getSingleListing: async (req: Request, res: Response) => {
        try {
            const listing = await listingModel.findOne({ listingNumber: req.params.listingNumber });

            if (!listing) {
                return res.status(404).send('Listing not found.');
            }
            return res.status(200).send({listing: listing, URL_IMG: _URL_IMG});
        
        } catch (error) {
            console.error("Error finding listing.");
            return res.status(500).send("An error ocurred while finding listing.");
        }
    },

    postListing: async (req: Request, res: Response) => {
        try {

            const user = await getUserByToken(req.headers.authorization);

            if(!await userIsSeller(user)){
                return res.status(401).send('Unauthorized: User is not a seller.');
            }

            if(!await userIsVerified(user)){
                return res.status(401).send('Unauthorized: User is not verified.');
            }

            const listingError = await checkListingData(req.body.title, req.body.description, req.body.price, req.body.currency, req.body.state, req.body.listingPhoto);

            if (listingError !== true) {
                console.log(req.body.title)
                return res.status(400).send(listingError);
            }

            req.body.author = user
            
            const generateNumber = await listingModel.findOne({}).sort({listingNumber:-1}).limit(1);
            if (!generateNumber){
                req.body.listingNumber = 1;
            }
            else {  
                req.body.listingNumber = generateNumber.listingNumber+1;
            }
            req.body.listingPhoto = 'listingPhoto/' + req.body.listingPhoto;
            const newListing = await listingModel.create(req.body);
            return res.status(201).send(newListing);

        } catch (error) {
            console.error("Error creating listing.");
            console.log(error);
            return res.status(500).send("An error ocurred while creating the listing.");
        }

    },

    patchListing: async (req: Request, res: Response) => {

        try {
            const existingListing = await listingModel.findOne({
                listingNumber: req.params.listingNumber
            });
            console.log(req.params.listingNumber)
            if (!existingListing) {
                return res.status(404).send('Listing not found.');
            }

            if (!checkUserPermission(existingListing.author, req.headers.authorization)) {
                return res.status(403).send('Access denied.');
            }

            const patchedListing = await listingModel.findOneAndUpdate(
                {
                    listingNumber:req.params.listingNumber
                },
                {
                    title: req.body.title,
                    description: req.body.description,
                    price: req.body.price,
                    state: req.body.state
                }
            );

            return res.status(200).send(patchedListing);
        
        } catch (error) {
            console.error("Error updating the listing.");
            return res.status(500).send("An error ocurred while updating the listing. Please change values.");
        }

    },

    deleteListing: async (req: Request, res: Response) => {
        try {
            const deletedListing = await listingModel.findOneAndDelete(
                {
                    listingNumber: req.params.listingNumber
                }
            );

            if (!deletedListing) {
                return res.status(404).send('Listing not found.');
            }
            

            if (!checkUserPermission(deletedListing.author, req.headers.authorization)) {
                return res.status(403).send('Access denied.');
            }

            const deleteComments = await queryModel.deleteMany(
                {
                    listingNumber: req.params.listingNumber
                }
            );
            
            eliminarArchivo('src/img/listingPhoto/' + deletedListing.listingPhoto);

            return res.status(200).send(deletedListing);
        
        } catch(error) {
            console.error("Error deleting the listing.");
            return res.status(500).send("An error ocurred while deleting the listing.");
        }
    },

    searchListing: async (req: Request, res: Response) => {
        try {
            const query: any = {};
            const queryParams = req.query;
            
            const itemsPerPage = 6;
            const page = parseInt(req.params.page) || 0;
            console.log(queryParams)
            for (const key in queryParams) {
                if (queryParams.hasOwnProperty(key)) {
                    const value = queryParams[key];
                    
                    if (!isNaN(value as any)) {
                        if ('minprice' in queryParams) {
                            const minPrice = parseFloat(queryParams['minprice'] as string);
                            if (!isNaN(minPrice)) {
                                query['price'] = { $gte: minPrice };
                            }
                        }
    
                        if ('maxprice' in queryParams) {
                            const maxPrice = parseFloat(queryParams['maxprice'] as string);
                            if (!isNaN(maxPrice)) {
                                query['price'] = { ...(query['price'] || {}), $lte: maxPrice };
                            }
                        }
                    } else {
                        if(key == 'author'){
                            query[key] = { $eq: value as string };
                        }
                        else query[key] = { $regex: value as string, $options: 'i' };
                    }
                }
            }
            console.log(query)
            if (query.city){
                const sellers = await userModel.find({ address: query['city'] });
                const sellerUsernames = sellers.map(seller => seller.username);
                query.author = { $in: sellerUsernames };
                delete query.city;
            }
            let lastPage = false;
            const listings = await listingModel.find(query)
            if (listings.length <= (page+1)*itemsPerPage) lastPage = true;
            const pagedListings = await listingModel.find(query).skip(itemsPerPage * page).limit(itemsPerPage);
            if (!listings || listings.length === 0) {
                return res.status(200).send('No listings found for the search criteria.');
            } else {
                return res.status(200).send({ listings: pagedListings, URL_IMG: _URL_IMG, lastPage: lastPage});
            }
        } catch (error) {
            console.error("Error searching listings.");
            return res.status(500).send("An error occurred while searching for listings.");
        }
    }

}
