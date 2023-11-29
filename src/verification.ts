import { get } from "http";
import jwt from "jsonwebtoken";
import { userModel } from "./models/user.model";

const claveSecreta = "InBhaalsName"

export function generarClave(username: String): string{
    let sign = {
        "username": username
    }
    let firma = jwt.sign(sign, claveSecreta, {expiresIn: '10h'}); //Probar que pasa si se pone menos tiempo

    return firma;
}

export function verificarClave(req: any, res: any, next: any){
    const clave = req.headers.authorization;
    if (!clave) {
        return res.status(401).send('Unauthorized: No token provided.');
    }

    try {
        jwt.verify(clave, claveSecreta);
        console.log("Successful authentication: " + new Date(Date.now()));
        next();
    }
    catch (err) {
        return res.status(401).send('Unauthorized: Invalid token.');
    }
}

export function getUserByToken(token: any){
    const decoded = jwt.decode(token);
    const parsedDecoded = JSON.parse(JSON.stringify(decoded));
    return parsedDecoded.username;
}

export function checkUserPermission(nameToCheck: any, token: any){
    const user = getUserByToken(token);
    if (nameToCheck != user){
        return false;
    }
    else return true;
}

export async function userIsSeller(username: string){
    try {  
        const user = await userModel.findOne({ username: username });
        return user!.isSeller;
    } catch (error) {
        console.error("Error finding user");
    }
}

export async function userIsVerified(username: string){
    try {
        const user = await userModel.findOne({ username: username });
        return user!.isVerified;
    } catch (error) {
     console.error("Error finding user");   
    }
}

export async function checkRegisterData(password: string, email: string){
    const mailRegex: RegExp = new RegExp("[A-Za-z0-9]+@[a-z]+\.[a-z]{2,3}");

    const passRegex: RegExp = new RegExp("^(?=.*[A-Z])(?=.*[0-9]).{8,}$");

    if(passRegex.test(password) == false){
        return "Password must be at least 8 characters long, contain at least one uppercase letter and one number.";
    }

    if(mailRegex.test(email) == false){
        return "Email must be a valid email address.";
    }

    return true;
}

export async function checkListingData(title: any, description: any, price: any, currency: any, state: any, images: any){
    if(!title){
        return "Title is required.";
    }
    if(!description){
        return "Description is required.";
    }
    if(!price){
        return "Price is required.";
    }
    if(!currency){
        return "Currency is required.";
    }
    if(!state){
        return "State is required.";
    }
    if (price<0){
        return "Price must be a positive number.";
    }
    if (currency!="ARS" && currency!="USD"){
        return "Currency must be ARS or USD.";
    }
    if (state!="Disponible" && state!="Pausada"){
        return "State must be Available or Unavailable.";
    }
    if(!images){
        return "Images are required.";
    }
    else return true;
}