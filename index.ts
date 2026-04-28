import express, { Application } from 'express'
import * as dotenv from 'dotenv';
import { bootstrap } from './src/app.controller';
dotenv.config()
const app: Application = express()


const port: number = Number(process.env.PORT);



bootstrap(app)
app.listen(port , ()=>{
  console.log(`Server is running on port ${port}`)
})

export default app
