import { Request, Response } from "express";
import { userModel } from "../models/user.model";
import { createHash } from "node:crypto";
import { checkRegisterData, generarClave } from "../verification";
import { JsonObject } from "swagger-ui-express";

function sha256(content: string) {
    return createHash('sha256').update(content).digest('hex')
}

export default {
    placeholder: (req: Request, res: Response) => {
        return res.status(200).send('Response from user.controller')
    },

    loginUser: async (req: Request, res: Response) => {
        try {
            const user = await userModel.findOne({ username: req.body.username });

            if (user && user.password == sha256(req.body.password)) {
                let response: JsonObject = JSON.parse(JSON.stringify(user));
                response["token"] = generarClave(user.username);
                return res.status(200).send(response);
            }
            return res.status(401).send('The username or password are incorrect.');

        } catch (error) {
            console.error("Error logging in");
            return res.status(500).send("An internal error ocurred while trying to log in.");
        }
    },

    registerUser: async (req: Request, res: Response) => {
        try {

            const userByEmail = await userModel.findOne({ email: req.body.email });

            if (userByEmail) {
                return res.status(409).send('The email provided is already in use.');
            }

            const userByName = await userModel.findOne({ username: req.body.username });
            
            if (userByName) {
                return res.status(409).send('The username provided is already in use.');
            }
            
            let isValid = await checkRegisterData(req.body.password, req.body.email)

            if(isValid !== true){
                return res.status(400).send(isValid)
            }
            
            if (!req.body.isSeller) {
                req.body.isSeller = false;
            }

            
            if (!req.body.fullName || !req.body.password || !req.body.email || !req.body.username) {
                return res.status(400).send('Missing data in request body.');
            }

            if(typeof(req.body.phone)==="string"){
                return res.status(400).send('Phone number must be a number.');
            }

            req.body.password = sha256(req.body.password);
            const newUser = await userModel.create({
                username: req.body.username,
                fullName: req.body.fullName,
                password: req.body.password,
                email: req.body.email,
                isSeller: req.body.isSeller,
                address: req.body.address,
                phone: req.body.phone,
                isVerified: false
            });

            return res.status(201).send(newUser);

        } catch (error) {
            console.error("Error creating account.");
            console.log(error)
            return res.status(500).send("An error ocurred while creating the account.");
        }
    },

    verifyUser: async (req: Request, res: Response) => {
        if(req.headers.adminkey == process.env.ADMIN_KEY){
            if (!req.params.username) {
                return res.status(400).send('Missing username in request.');
            }
            const userToVerify = await userModel.findOneAndUpdate({ username: req.params.username }, { isVerified: true });
            if (!userToVerify) {
                return res.status(404).send('User not found.');
            }
        return res.status(200).send('User verified.');
        }
        return res.status(401).send('Unauthorized: Invalid admin key.');
    }

}