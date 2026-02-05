import express, { Application } from 'express';
import { bootstrap } from '../src/app.controller';
import * as dotenv from 'dotenv';
dotenv.config();
const app: Application = express();

// Bootstrap the application (middleware, DB, routes)
bootstrap(app)


app.listen(process.env.PORT || 3000 , ()=>{
    console.log('Server is running on port 3000')
})

export default app;
