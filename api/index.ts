import express, { Application } from 'express';
import * as dotenv from 'dotenv';
dotenv.config()
const app: Application = express()


const port: number = Number(process.env['PORT']) || 3000;

app.get('/', (req, res) => {
    res.send('KidDrive Server is running!')
})

if (process.env['NODE_ENV'] !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port} `)
    })
}

export default app