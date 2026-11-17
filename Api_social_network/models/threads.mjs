import Validator from 'better-validator';

import authToken from '../helpers/auth-token.mjs';

let data = [
    {
        id: 1,
        groupId: 1,
        eventId: null
    },
    {
        id: 2,
        groupId: null,
        eventId: 1
    }
];

const Threads = class Threads {
    constructor(app) {
        this.app = app;
        this.run();
    }
    validateThread(req) {
        const validator = new Validator();
        return validator.run();
    }

    getAll() {
        this.app.get('/threads', authToken, (req, res) => {
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
        this.app.get('/threads/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const thread = data.find(
                    thread => thread.id === id
                );
                if (!thread) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Thread not found'
                    });
                }
                res.status(200).json(thread);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    create() {
        this.app.post('/threads', authToken, async (req, res) => {
            try {
                const errors = await this.validateThread(req);
                if (errors.length > 0) {
                    return res.status(400).json({
                        code: 400,
                        message: 'Validation failed',
                        errors
                    });
                }
                const { groupId, eventId } = req.body;
                if (
                    groupId &&
                    eventId
                ) {
                    return res.status(400).json({
                        code: 400,
                        message: 'A thread cannot belong to both a group and an event'
                    });
                }
                if (
                    !groupId &&
                    !eventId
                ) {
                    return res.status(400).json({
                        code: 400,
                        message: 'A groupId or eventId is required'
                    });
                }
                const thread = {
                    id: data.length + 1,
                    groupId:
                        groupId ?? null,
                    eventId:
                        eventId ?? null
                };
                data.push(thread);
                res.status(201).json(thread);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    update() {
        this.app.put('/threads/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const thread = data.find(
                    thread => thread.id === id
                );
                if (!thread) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Thread not found'
                    });
                }
                const groupId =
                    req.body.groupId ?? thread.groupId;
                const eventId =
                    req.body.eventId ?? thread.eventId;
                if (
                    groupId &&
                    eventId
                ) {
                    return res.status(400).json({
                        code: 400,
                        message: 'A thread cannot belong to both a group and an event'
                    });
                }
                thread.groupId = groupId;
                thread.eventId = eventId;
                res.status(200).json(thread);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    delete() {
        this.app.delete('/threads/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const index = data.findIndex(
                    thread => thread.id === id
                );
                if (index === -1) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Thread not found'
                    });
                }
                const deletedThread = data.splice(index, 1);
                res.status(200).json(deletedThread[0]);
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
    }
};

export default Threads;