import { Application, json, Request, Response } from "express";
import { connectDB } from "./db";
import { globalErrorHandler, notFoundHandler } from "./common";
import cors from 'cors'

import * as dotenv from 'dotenv'
dotenv.config()
export const bootstrap = async (app: Application) => {    
    // CORS configuration for cookie-based authentication
    app.use(cors({}))

    app.use(json())

    
    await connectDB()

    app.get('/' , (req:Request , res:Response)=>{
        res.send('KidDrive APIs')
    })
    app.use(notFoundHandler)
    app.use(globalErrorHandler)
}

//class
//payment
//subscriptions