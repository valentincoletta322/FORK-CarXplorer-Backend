import express from "express";
import listingController from "../controllers/listing.controller";
import { verificarClave } from "../verification";

export const listingRouter = express.Router()

listingRouter
    .get('/', verificarClave, listingController.placeholder)
    .get('/all/page/:page', listingController.getAllListings)
    .get('/single/:listingNumber', listingController.getSingleListing)
    .get('/search/page/:page', listingController.searchListing)
    .post('/', verificarClave, listingController.postListing)
    .patch('/:listingNumber', verificarClave, listingController.patchListing)
    .delete('/:listingNumber', verificarClave, listingController.deleteListing)
