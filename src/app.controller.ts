import * as dotenv from 'dotenv'
dotenv.config()
import { Application, json, Request, Response } from "express";
import { connectDB } from "./db";
import { globalErrorHandler, notFoundHandler } from "./common";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import driverRoutes from "./modules/driver/driver.routes";
import parentRoutes from "./modules/parent/parent.routes";
import { subscriptionRoutes } from "./modules/subscription";
import { tripRoutes } from "./modules/trip";

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
    app.use('/user', userRoutes)
    app.use('/parent', parentRoutes)
     app.use('/driver', driverRoutes)
    app.use('/subscription', subscriptionRoutes)
    app.use('/trip', tripRoutes)
    app.use(notFoundHandler)
    app.use(globalErrorHandler)
}

//class
//payment
//subscriptions