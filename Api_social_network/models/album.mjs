import Validator from 'better-validator';

import authToken from '../helpers/auth-token.mjs';

let data = [
    {
        id: 1,
        eventId: 1,
        title: 'Photos Soirée EFREI',
        createdBy: 1,
        createdAt: new Date().toISOString()
    }
];

const Albums = class Albums {
    constructor(app) {
        this.app = app;
        this.run();
    }

    validateAlbum(req) {
        const validator = new Validator();
        validator(req.body.eventId)
            .required()
            .isNumber();
        validator(req.body.title)
            .required()
            .isString()
        validator(req.body.createdBy)
            .required()
            .isNumber();
        return validator.run();
    }

    getAll() {
        this.app.get('/albums', authToken, (req, res) => {
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
        this.app.get('/albums/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const album = data.find(
                    album => album.id === id
                );
                if (!album) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Album not found'
                    });
                }
                res.status(200).json(album);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    create() {
        this.app.post('/albums', authToken, async (req, res) => {
            try {
                const errors = await this.validateAlbum(req);
                if (errors.length > 0) {
                    return res.status(400).json({
                        code: 400,
                        message: 'Validation failed',
                        errors
                    });
                }
                const album = {
                    id: data.length + 1,
                    eventId: req.body.eventId,
                    title: req.body.title,
                    createdBy: req.body.createdBy,
                    createdAt: new Date().toISOString()
                };
                data.push(album);
                res.status(201).json(album);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    update() {
        this.app.put('/albums/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const album = data.find(
                    album => album.id === id
                );
                if (!album) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Album not found'
                    });
                }
                album.title = req.body.title ?? album.title;
                res.status(200).json(album);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    delete() {
        this.app.delete('/albums/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const index = data.findIndex(
                    album => album.id === id
                );
                if (index === -1) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Album not found'
                    });
                }
                const deletedAlbum = data.splice(index, 1);
                res.status(200).json(deletedAlbum[0]);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    getAlbumsByEvent() {
        this.app.get('/events/:id/albums', authToken, (req, res) => {
            try {
                const eventId = parseInt(req.params.id);
                const albums = data.filter(
                    album => album.eventId === eventId
                );
                res.status(200).json(albums);
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
        this.getAlbumsByEvent();
    }
};

export default Albums;