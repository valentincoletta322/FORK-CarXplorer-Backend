import { Request, Response } from "express";
import { queryModel } from "../models/query.model";
import { checkUserPermission, getUserByToken } from "../verification";
import { listingModel } from "../models/listing.model";

/*
    Terminado: Get all queries, get single query, post query, answer query, patch query(no permisos), 
    delete query (no permisos)

    Pendiente: patch query (con permisos), delete query (con permisos)
*/


export default {
    placeholder: (req: Request, res: Response) => {
        return res.status(200).send('Response from listing.controller.')
    },

    getAllQueriesFromListing: async (req: Request, res: Response) => {
        try {
            const queries = await queryModel.find({listingNumber: req.params.listingNumber});

            if (!queries || queries.length == 0) {
                return res.status(404).send('No queries found.');
            }

            return res.status(200).send(queries);
        
        } catch (error) {
            console.error("Error finding queries.");
            return res.status(500).send("An error ocurred while finding queries.");
        }
    },

    getSingleQuery: async (req: Request, res: Response) => {
        try{
            const query = await queryModel.findOne({queryId: req.params.queryId});
            
            if (!query) {
                return res.status(404).send('Listing not found.');
            }

            return res.status(200).send(query);

        } catch (error) {
            console.error("Error finding query.");
            return res.status(500).send("An error ocurred while finding query.");
        }
    },

    postQuery: async (req: Request, res: Response) => {
        try {

            const generateNumber = await queryModel.findOne({}).sort({queryId:-1}).limit(1);
            
            if (!generateNumber){
                req.body.queryId = 1;
            }
            else {
                req.body.queryId = generateNumber.queryId+1;
            }

            const newQuery = await queryModel.create({
                queryId: req.body.queryId,
                listingNumber: req.body.listingNumber,
                content: req.body.content,
                datetime: Date.now(),
                wasAnswered: false,
                author: getUserByToken(req.headers.authorization)
            });
            return res.status(201).send(newQuery);

        } catch (error) {
            console.error("Error creating query.");
            console.log(error)
            return res.status(500).send("An error ocurred while creating the query.");
        } 
    },

    answerQuery: async (req: Request, res: Response) => {
        try {
            const queryToAnswer = await queryModel.findOne({queryId: req.params.queryId});
            if (!queryToAnswer) {
                return res.status(404).send('Query not found.');
            }

            const listingRelated = await listingModel.findOne({listingNumber: queryToAnswer.listingNumber});
            if (!listingRelated) {
                return res.status(404).send('Listing not found.');
            }

            if (!checkUserPermission(listingRelated.author, req.headers.authorization)){
                return res.status(401).send('Unauthorized: User is not the listing author.');
            }

            if (queryToAnswer.wasAnswered) {
                return res.status(409).send('Query was already answered.');
            }

            const answeredQuery = await queryModel.findOneAndUpdate(
                {
                    queryId:req.params.queryId
                },
                {
                    answer: req.body.answer,
                    wasAnswered: true
                }
            );
            

            return res.status(200).send(answeredQuery);
        
        } catch (error) {
            console.error("Error answering the query.");
            return res.status(500).send("An error ocurred while answering the query.");
        }
    },

    patchQuery: async (req: Request, res: Response) => {
            
            try {
                const patchedQuery = await queryModel.findOneAndUpdate(
                    {
                        queryId:req.params.queryId
                    },
                    {content: req.body.content}
                );
                
                if (!patchedQuery) {
                    return res.status(404).send('Query not found.');
                }

                if (!checkUserPermission(patchedQuery.author, req.headers.authorization)){
                    return res.status(401).send('Unauthorized: User is not the query author.');    
                }
    
                return res.status(200).send(patchedQuery);
            
            } catch (error) {
                console.error("Error updating the query.");
                return res.status(500).send("An error ocurred while updating the query.");
            }
    },

    deleteQuery: async (req: Request, res: Response) => {
        
        try {
            const deletedQuery = await queryModel.findOneAndDelete(
                {
                    queryId:req.params.queryId
                }
            );
            
            if (!deletedQuery) {
                return res.status(404).send('Query not found.');
            }

            if (!checkUserPermission(deletedQuery.author, req.headers.authorization)){
                return res.status(401).send('Unauthorized: User is not the query author.');
            }

            return res.status(200).send(deletedQuery);
        
        } catch (error) {
            console.error("Error deleting the query.");
            return res.status(500).send("An error ocurred while deleting the query.");
        }

    }

}
