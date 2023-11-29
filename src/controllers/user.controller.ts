import { Request, Response } from "express";
import { userModel } from "../models/user.model";
import { checkUserPermission, getUserByToken } from "../verification";
import { error } from "console";

/*
    Terminado: Get all users, get single user, post user, patch user(no permisos), 
    delete user (no permisos)

    Pendiente: patch user (con permisos), delete user (con permisos)
*/

export default {
    placeholder: (req: Request, res: Response) => {
        return res.status(200)
        .send('Bienvenido '+ getUserByToken(req.headers.authorization) + '!')
    },

    getAllUsers: async (req: Request, res: Response) => {
        try {
            const users = await userModel.find();

            if (!users) {
                return res.status(404).send('No users found.');
            }

            return res.status(200).send(users);
        }
        catch (error) {
            console.error("Error finding users.");
            return res.status(500).send("An error ocurred while finding users.");
        }
    },

    getUser: async (req: Request, res: Response) => {
        try {
            const user = await userModel.findOne({ username: req.params.username });

            if (!user) {
                return res.status(404).send('User not found.');
            }

            return res.status(200).send(user);
        }
        catch (error) {
            console.error("Error finding user.");
            return res.status(500).send("An error ocurred while finding user.");
        }

    },

    getUserByReqToken: async (req: Request, res: Response) => {
        try {
            
            const user = await userModel.findOne({ username: getUserByToken(req.headers.authorization) });

            if (!user) {
                return res.status(404).send('User not found.');
            }

            return res.status(200).send(user);

        } catch (error) {
            console.error("Error finding user.");
            return res.status(500).send("An error ocurred while finding user.");
        }
    },

    postUser: async (req: Request, res: Response) => {
        try {

            const newUser = await userModel.create(req.body);
            return res.status(201).send(newUser);

        } catch (error) {
            console.error("Error creating user.");
            return res.status(500).send("An error ocurred while creating the user.");
        }

    },

    patchUser: async (req: Request, res: Response) => {
            try {
                const userByEmail = await userModel.findOne({ email: req.body.email });

                if (userByEmail) {
                    return res.status(409).send('The email provided is already in use.');
                }    

                const patchedUser = await userModel.findOneAndUpdate(
                    {
                        username: req.params.username
                    },
                    req.body
                );
    
                if (!patchedUser) {
                    return res.status(404).send('User not found.');
                }

                if (!checkUserPermission(patchedUser.username, req.headers.authorization)){
                    return res.status(403).send('Access denied.');
                }
                console.log(patchedUser);
                return res.status(200).send(patchedUser);
    
            } catch (error) {
                console.error("Error updating the user.");
                return res.status(500).send("An error ocurred while updating the user.");
            }    
    },

    deleteUser: async (req: Request, res: Response) => {
        try{
            const deletedUser = await userModel.findOneAndDelete(
                {
                    username: req.params.username
                }
            );

            if (!deletedUser) {
                return res.status(404).send('User not found.');
            }

            if (!checkUserPermission(deletedUser.username, req.headers.authorization)){
                return res.status(403).send('Access denied');
            }

            return res.status(200).send(deletedUser);

        } catch (error) {
            console.error("Error deleting the user.");
            return res.status(500).send("An error ocurred while deleting the user.");
        }
    },

    searchUsers: async (req: Request, res: Response) => {
        try {
            const query: any = {};
            const queryParams = req.query;
    
            for (const key in queryParams) {
                if (queryParams.hasOwnProperty(key)) {
                    query[key] = { $regex: queryParams[key], $options: 'i' };
                }
            }
    
            const users = await userModel.find(query);
    
            if (!users || users.length === 0) {
                return res.status(404).send('No users found for the search criteria.');
            }
            else return res.status(200).send(users);
        } catch (error) {
            console.error("Error searching users.");
            return res.status(500).send("An error occurred while searching for users.");
        }
    },

}
