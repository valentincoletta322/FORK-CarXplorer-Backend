import express from "express";
import listingController from "../controllers/query.controller";
import { verificarClave } from "../verification";

export const queryRouter = express.Router()

queryRouter
    .get('/', verificarClave, listingController.placeholder)
    //.get('/all', verificarClave, listingController.getAllQueries)
    .get('/fromListing/:listingNumber', verificarClave, listingController.getAllQueriesFromListing)
    .get('/single/:queryId', verificarClave, listingController.getSingleQuery)
    .post('/answerQuery/:queryId', verificarClave, listingController.answerQuery)
    .post('/', verificarClave, listingController.postQuery)
    .patch('/:queryId', verificarClave, listingController.patchQuery)
    .delete('/:queryId', verificarClave, listingController.deleteQuery)
