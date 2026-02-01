import express, { Application } from 'express';
import { bootstrap } from '../src/app.controller';

const app: Application = express();

// Bootstrap the application (middleware, DB, routes)
bootstrap(app).then(() => {
    const port: number = Number(process.env['PORT']) || 3000;

    if (process.env['NODE_ENV'] !== 'production') {
        app.listen(port, () => {
            console.log(`Server is running on port ${port} `);
        });
    }
}).catch((err) => {
    console.error('Failed to bootstrap application:', err);
});

export default app;
