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

// Initialize before handling requests
initializeApp().catch(console.error);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

export default app;
