import express, { Application } from 'express';
import { bootstrap } from '../src/app.controller';
import * as dotenv from 'dotenv';
dotenv.config();
const app: Application = express();

// Initialize the application (middleware, DB, routes)
const initializeApp = async () => {
    await bootstrap(app);
};

// Start the initialization
initializeApp();
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
export default app;
