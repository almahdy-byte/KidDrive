import * as dotenv from 'dotenv'
dotenv.config()
import { Application, json, Request, Response } from "express";
import { connectDB } from "./db";
import { globalErrorHandler, notFoundHandler } from "./common";
import authRoutes from "./modules/auth/auth.routes";
import cors from 'cors'


export const bootstrap = async (app: Application) => {
    // CORS configuration for cookie-based authentication
    app.use(cors({}))

    app.use(json())


    await connectDB()

    app.get('/', (req: Request, res: Response) => {
        res.send('KidDrive APIs')
    })
    app.use('/auth', authRoutes)
    app.use(notFoundHandler)
    app.use(globalErrorHandler)
}

//class
//payment
//subscriptions