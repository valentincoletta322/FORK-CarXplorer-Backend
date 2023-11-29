import express from "express";
import userController from "../controllers/user.controller";
import authController from "../controllers/auth.controller";
import { verificarClave } from "../verification";

export const userRouter = express.Router()

userRouter
    .get('/', verificarClave, userController.placeholder)
    .get('/all', verificarClave, userController.getAllUsers)
    .get('/single/:username', verificarClave, userController.getUser)
    .get('/byToken', verificarClave, userController.getUserByReqToken)
    .get('/search', verificarClave, userController.searchUsers)

    .post('/', verificarClave, userController.postUser)
    .post('/login', authController.loginUser)
    .post('/register', authController.registerUser)

    .patch('/:username', verificarClave, userController.patchUser)
    
    .delete('/:username', verificarClave, userController.deleteUser)
    .patch('/verify/:username', authController.verifyUser)
