import express, { Application, Request, Response } from 'express';
import { bootstrap } from '../src/app.controller';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

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

// Start server for local development
const isMainModule = process.argv[1] && (
    process.argv[1].endsWith('index.ts') ||
    process.argv[1].endsWith('index.js')
);

if (isMainModule) {
    initializeApp().then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT || 3000}`);
        });
    }).catch(err => {
        console.error("Failed to start server:", err);
        process.exit(1);
    });
}
