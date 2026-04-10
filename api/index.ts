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
    await initializeApp();
    return app(req, res);
}
