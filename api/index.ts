import express, { Application, Request, Response } from 'express';
import { bootstrap } from '../src/app.controller';
import * as dotenv from 'dotenv';
dotenv.config();

const app: Application = express();
let isInitialized = false;

async function initializeApp() {
    if (!isInitialized) {
        await bootstrap(app);
        isInitialized = true;
    }
}

export default async function handler(req: Request, res: Response) {
    try {
        await initializeApp();
    } catch (err: any) {
        console.error("Failed to initialize app:", err);
        return res.status(500).json({
            success: false,
            message: "Database connection or initialization failed",
            error: err.message || err.toString()
        });
    }
    return app(req, res);
}
