import Validator from 'better-validator';

import authToken from '../helpers/auth-token.mjs';

let data = [
    {
        id: 1,
        threadId: 1,
        userId: 1,
        content: 'Bienvenue dans le groupe.',
        createdAt: new Date().toISOString()
    }
];

const Messages = class Messages {
    constructor(app) {
        this.app = app;
        this.run();
    }

    validateMessage(req) {
        const validator = new Validator();
        validator(req.body.threadId)
            .required()
            .isNumber();
        validator(req.body.userId)
            .required()
            .isNumber();
        validator(req.body.content)
            .required()
            .isString()
        return validator.run();
    }

    getAll() {
        this.app.get('/messages', authToken, (req, res) => {
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
        this.app.get('/messages/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const message = data.find(
                    message => message.id === id
                );
                if (!message) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Message not found'
                    });
                }
                res.status(200).json(message);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    create() {
        this.app.post('/messages', authToken, async (req, res) => {
            try {
                const errors = await this.validateMessage(req);
                if (errors.length > 0) {
                    return res.status(400).json({
                        code: 400,
                        message: 'Validation failed',
                        errors
                    });
                }
                const message = {
                    id: data.length + 1,
                    threadId: req.body.threadId,
                    userId: req.body.userId,
                    content: req.body.content,
                    createdAt: new Date().toISOString()
                };
                data.push(message);
                res.status(201).json(message);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    update() {
        this.app.put('/messages/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const message = data.find(
                    message => message.id === id
                );
                if (!message) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Message not found'
                    });
                }
                message.content = req.body.content ?? message.content;
                res.status(200).json(message);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    delete() {
        this.app.delete('/messages/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const index = data.findIndex(
                    message => message.id === id
                );
                if (index === -1) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Message not found'
                    });
                }
                const deletedMessage = data.splice(index, 1);
                res.status(200).json(deletedMessage[0]);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    getMessagesByThread() {
        this.app.get('/threads/:id/messages', authToken, (req, res) => {
            try {
                const threadId = parseInt(req.params.id);
                const messages = data.filter(
                    message => message.threadId === threadId
                );
                res.status(200).json(messages);
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
        this.getMessagesByThread();
    }
};

export default Messages;