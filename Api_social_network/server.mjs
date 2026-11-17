// Dépendances
import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Routes
import routes from './controller/routes.mjs';

const Server = class Server {
    constructor() {
        this.app = express();
    }

    middleware() {
        this.app.use(helmet());
        this.app.use(cors({
            origin: ['http://localhost:5173'],
            methods: ['GET', 'POST', 'PUT', 'DELETE']
        }));
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));
        this.app.use(bodyParser.json());
        const limiter = rateLimit({
            windowMs: 60 * 60 * 1000,
            max: 100,
            message: {
                code: 429,
                message: 'Trop de requêtes'
            }
        });
        this.app.use(limiter);
    }

    routes() {
        new routes.Auth(this.app);
        new routes.Users(this.app);
        new routes.Events(this.app);
        new routes.Groups(this.app);
        new routes.Threads(this.app);
        new routes.Messages(this.app);
        new routes.Comments(this.app);
        new routes.Albums(this.app);
        new routes.Photos(this.app);
        new routes.Polls(this.app);
        new routes.Tickets(this.app);
        new routes.ShoppingList(this.app);
        this.app.use((req, res) => {
            res.status(404).json({
                code: 404,
                message: 'Not Found'
            });
        });
    }

    run() {
        this.middleware();
        this.routes();
        this.app.listen(3000, () => {
            console.log('Server running on port 3000');
        });
    }
};

export default Server;