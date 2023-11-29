import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { userRouter } from "./routes/user.routes";
import { listingRouter } from "./routes/listing.routes";
import queryController from "./controllers/query.controller";
import { queryRouter } from "./routes/query.routes";
import cors from "cors";
import path from "path";
import multer from "multer";
import bodyParser from "body-parser";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const port = 3000;

const _URL_DB = process.env.URL_DB
export const _URL_IMG = process.env.URL_IMG
console.log(process.env.URL_DB)


const app = express();

const storage = multer.diskStorage({
    
    destination: (req, file, cb) => {
      cb(null, process.env.URL_SAVE_IMG + file.fieldname);
    },

    filename: (req, file, cb) => {
        const timestamp = uuidv4();
        const fileExtension = file.originalname.split('.').pop();
        const uniqueFilename = `${timestamp}.${fileExtension}`;
        req.body[file.fieldname] = uniqueFilename
        cb(null, uniqueFilename);
    },

  });
const upload = multer({ storage: storage });

export function eliminarArchivo(ruta: string){
    if (fs.existsSync(ruta)) {
      fs.unlinkSync(ruta);
    }
  }

app
    .use(bodyParser.json())
    .use(express.json())
    .use("/img/", express.static(path.join(__dirname, 'img/')))
    .use(upload.fields([{ name: 'profilePhotos' }, { name: 'listingPhoto' }]))
    .use(cors())
    .use('/users', userRouter)
    .use('/listings', listingRouter)
    .use('/queries', queryRouter)
    .get('/', (req, res) => {
        res.status(200).send('Conection established!')
    })
    .listen(port, () => {
        console.log(`API service on: http://localhost:${port}`)
    })
    mongoose
    .set("strictQuery", false)
    .connect(_URL_DB || "").then(() => {
        console.log(`mongoDB connection initialized.`)
    })
