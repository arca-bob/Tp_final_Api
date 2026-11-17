import Validator from 'better-validator';

import authToken from '../helpers/auth-token.mjs';

let data = [
    {
        id: 1,
        messageId: 1,
        userId: 2,
        content: 'Je serai présent.',
        createdAt: new Date().toISOString()
    }
];

const Comments = class Comments {
    constructor(app) {
        this.app = app;
        this.run();
    }

    validateComment(req) {
        const validator = new Validator();
        validator(req.body.messageId)
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
        this.app.get('/comments', authToken, (req, res) => {
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
        this.app.get('/comments/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const comment = data.find(
                    comment => comment.id === id
                );
                if (!comment) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Comment not found'
                    });
                }
                res.status(200).json(comment);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    create() {
        this.app.post('/comments', authToken, async (req, res) => {
            try {
                const errors = await this.validateComment(req);
                if (errors.length > 0) {
                    return res.status(400).json({
                        code: 400,
                        message: 'Validation failed',
                        errors
                    });
                }
                const comment = {
                    id: data.length + 1,
                    messageId: req.body.messageId,
                    userId: req.body.userId,
                    content: req.body.content,
                    createdAt: new Date().toISOString()
                };
                data.push(comment);
                res.status(201).json(comment);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    update() {
        this.app.put('/comments/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const comment = data.find(
                    comment => comment.id === id
                );
                if (!comment) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Comment not found'
                    });
                }
                comment.content = req.body.content ?? comment.content;
                res.status(200).json(comment);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    delete() {
        this.app.delete('/comments/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const index = data.findIndex(
                    comment => comment.id === id
                );
                if (index === -1) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Comment not found'
                    });
                }
                const deletedComment = data.splice(index, 1);
                res.status(200).json(deletedComment[0]);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    getCommentsByMessage() {
        this.app.get('/messages/:id/comments', authToken, (req, res) => {
            try {
                const messageId = parseInt(req.params.id);
                const comments = data.filter(
                    comment => comment.messageId === messageId
                );
                res.status(200).json(comments);
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
        this.getCommentsByMessage();
    }
};

export default Comments;