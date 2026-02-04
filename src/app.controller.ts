import { Application, json, Request, Response } from "express";
import { connectDB } from "./db";
import { globalErrorHandler, notFoundHandler } from "./common";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import cors from 'cors'

import * as dotenv from 'dotenv'
dotenv.config()
export const bootstrap = async (app: Application) => {
    // CORS configuration for cookie-based authentication
    app.use(cors({}))

    app.use(json())


    await connectDB()

    app.get('/', (req: Request, res: Response) => {
        res.send('KidDrive APIs')
    })
    app.use('/auth', authRoutes)
    app.use('/user', userRoutes)
    app.use(notFoundHandler)
    app.use(globalErrorHandler)
}

//class
//payment
//subscriptions