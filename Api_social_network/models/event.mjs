import Validator from 'better-validator';

import authToken from '../helpers/auth-token.mjs';

let data = [
    {
        id: 1,
        name: 'Soirée EFREI',
        description: 'Soirée annuelle',
        startDate: '2027-01-15T18:00:00',
        endDate: '2027-01-16T02:00:00',
        location: 'Paris',
        coverPhoto: 'event.jpg',
        visibility: 'public',
        organizers: [1],
        participants: [1, 2]
    }
];

const Events = class Events {
    constructor(app) {
        this.app = app;
        this.run();
    }

    validateEvent(req) {
        const validator = new Validator();
        validator(req.body.name)
            .required()
            .isString()
        validator(req.body.description)
            .required()
            .isString();
        validator(req.body.startDate)
            .required()
            .isString();
        validator(req.body.endDate)
            .required()
            .isString();
        validator(req.body.location)
            .required()
            .isString();
        validator(req.body.coverPhoto)
            .required()
            .isString();
        validator(req.body.visibility)
            .required()
            .isString();
        return validator.run();
    }

    getAll() {
        this.app.get('/events', authToken, (req, res) => {
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
        this.app.get('/events/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const event = data.find(
                    event => event.id === id
                );
                if (!event) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Event not found'
                    });
                }
                res.status(200).json(event);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    create() {
        this.app.post('/events', authToken, async (req, res) => {
            try {
                const errors = await this.validateEvent(req);
                if (errors.length > 0) {
                    return res.status(400).json({
                        code: 400,
                        message: 'Validation failed',
                        errors
                    });
                }
                if (
                    req.body.visibility !== 'public' &&
                    req.body.visibility !== 'private'
                ) {
                    return res.status(400).json({
                        code: 400,
                        message: 'Visibility must be public or private'
                    });
                }
                const event = {
                    id: data.length + 1,
                    name: req.body.name,
                    description: req.body.description,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate,
                    location: req.body.location,
                    coverPhoto: req.body.coverPhoto,
                    visibility: req.body.visibility,
                    organizers: req.body.organizers ?? [],
                    participants: req.body.participants ?? []
                };
                data.push(event);
                res.status(201).json(event);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    update() {
        this.app.put('/events/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const event = data.find(
                    event => event.id === id
                );
                if (!event) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Event not found'
                    });
                }
                event.name = req.body.name ?? event.name;
                event.description = req.body.description ?? event.description;
                event.startDate = req.body.startDate ?? event.startDate;
                event.endDate = req.body.endDate ?? event.endDate;
                event.location = req.body.location ?? event.location;
                event.coverPhoto = req.body.coverPhoto ?? event.coverPhoto;
                event.visibility = req.body.visibility ?? event.visibility;
                res.status(200).json(event);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    delete() {
        this.app.delete('/events/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const index = data.findIndex(
                    event => event.id === id
                );
                if (index === -1) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Event not found'
                    });
                }
                const deletedEvent = data.splice(index, 1);
                res.status(200).json(deletedEvent[0]);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    addParticipant() {
        this.app.post('/events/:id/participants', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const event = data.find(
                    event => event.id === id
                );
                if (!event) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Event not found'
                    });
                }
                const { userId } = req.body;
                if (event.participants.includes(userId)) {
                    return res.status(409).json({
                        code: 409,
                        message: 'Participant already exists'
                    });
                }
                event.participants.push(userId);
                res.status(200).json(event);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    addOrganizer() {
        this.app.post('/events/:id/organizers', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const event = data.find(
                    event => event.id === id
                );
                if (!event) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Event not found'
                    });
                }
                const { userId } = req.body;
                if (event.organizers.includes(userId)) {
                    return res.status(409).json({
                        code: 409,
                        message: 'Organizer already exists'
                    });
                }
                event.organizers.push(userId);
                res.status(200).json(event);
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
        this.addParticipant();
        this.addOrganizer();
    }
};

export default Events;