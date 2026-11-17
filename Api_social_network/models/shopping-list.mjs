import Validator from 'better-validator';

import authToken from '../helpers/auth-token.mjs';

let data = [
    {
        id: 1,
        eventId: 1,
        userId: 1,
        name: 'Pizza',
        quantity: 2,
        arrivalTime: '20:00'
    }
];

const ShoppingList = class ShoppingList {
    constructor(app) {
        this.app = app;
        this.run();
    }

    validateItem(req) {
        const validator = new Validator();
        validator(req.body.eventId)
            .required()
            .isNumber();
        validator(req.body.userId)
            .required()
            .isNumber();
        validator(req.body.name)
            .required()
            .isString()
        validator(req.body.quantity)
            .required()
            .isNumber();
        validator(req.body.arrivalTime)
            .required()
            .isString();
        return validator.run();
    }

    getAll() {
        this.app.get('/shopping-list', authToken, (req, res) => {
            try {
                res.status(200).json(data);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    getShowById() {
        this.app.get('/shopping-list/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const item = data.find(
                    item => item.id === id
                );
                if (!item) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Item not found'
                    });
                }
                res.status(200).json(item);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    create() {
        this.app.post('/shopping-list', authToken, async (req, res) => {
            try {
                const errors = await this.validateItem(req);
                if (errors.length > 0) {
                    return res.status(400).json({
                        code: 400,
                        message: 'Validation failed',
                        errors
                    });
                }
                const existingItem = data.find(
                    item =>
                        item.eventId === req.body.eventId &&
                        item.name.toLowerCase() ===
                        req.body.name.toLowerCase()
                );
                if (existingItem) {
                    return res.status(409).json({
                        code: 409,
                        message: 'This item already exists for this event'
                    });
                }
                const item = {
                    id: data.length + 1,
                    eventId: req.body.eventId,
                    userId: req.body.userId,
                    name: req.body.name,
                    quantity: req.body.quantity,
                    arrivalTime: req.body.arrivalTime
                };
                data.push(item);
                res.status(201).json(item);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    update() {
        this.app.put('/shopping-list/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const item = data.find(
                    item => item.id === id
                );
                if (!item) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Item not found'
                    });
                }
                item.name = req.body.name ?? item.name;
                item.quantity = req.body.quantity ?? item.quantity;
                item.arrivalTime = req.body.arrivalTime ?? item.arrivalTime;
                res.status(200).json(item);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    delete() {
        this.app.delete('/shopping-list/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const index = data.findIndex(
                    item => item.id === id
                );
                if (index === -1) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Item not found'
                    });
                }
                const deletedItem = data.splice(index, 1);
                res.status(200).json(deletedItem[0]);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    getItemsByEvent() {
        this.app.get('/events/:id/shopping-list', authToken, (req, res) => {
            try {
                const eventId = parseInt(req.params.id);
                const items = data.filter(
                    item => item.eventId === eventId
                );
                res.status(200).json(items);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    run() {
        this.getAll();
        this.getShowById();
        this.create();
        this.update();
        this.delete();
        this.getItemsByEvent();
    }
};

export default ShoppingList;