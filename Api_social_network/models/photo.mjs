import Validator from 'better-validator';

import authToken from '../helpers/auth-token.mjs';

let data = [
    {
        id: 1,
        albumId: 1,
        userId: 1,
        url: 'photo1.jpg',
        description: 'Photo de groupe',
        createdAt: new Date().toISOString()
    }
];

const Photos = class Photos {
    constructor(app) {
        this.app = app;
        this.run();
    }

    validatePhoto(req) {
        const validator = new Validator();
        validator(req.body.albumId)
            .required()
            .isNumber();
        validator(req.body.userId)
            .required()
            .isNumber();
        validator(req.body.url)
            .required()
            .isString();
        validator(req.body.description)
            .required()
            .isString()
        return validator.run();
    }

    getAll() {
        this.app.get('/photos', authToken, (req, res) => {
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
        this.app.get('/photos/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const photo = data.find(
                    photo => photo.id === id
                );
                if (!photo) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Photo not found'
                    });
                }
                res.status(200).json(photo);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    create() {
        this.app.post('/photos', authToken, async (req, res) => {
            try {
                const errors = await this.validatePhoto(req);
                if (errors.length > 0) {
                    return res.status(400).json({
                        code: 400,
                        message: 'Validation failed',
                        errors
                    });
                }
                const photo = {
                    id: data.length + 1,
                    albumId: req.body.albumId,
                    userId: req.body.userId,
                    url: req.body.url,
                    description: req.body.description,
                    createdAt: new Date().toISOString()
                };
                data.push(photo);
                res.status(201).json(photo);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    update() {
        this.app.put('/photos/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const photo = data.find(
                    photo => photo.id === id
                );
                if (!photo) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Photo not found'
                    });
                }
                photo.url = req.body.url ?? photo.url;
                photo.description =req.body.description ?? photo.description;
                res.status(200).json(photo);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    delete() {
        this.app.delete('/photos/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const index = data.findIndex(
                    photo => photo.id === id
                );
                if (index === -1) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Photo not found'
                    });
                }
                const deletedPhoto = data.splice(index, 1);
                res.status(200).json(deletedPhoto[0]);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    getPhotosByAlbum() {
        this.app.get('/albums/:id/photos', authToken, (req, res) => {
            try {
                const albumId = parseInt(req.params.id);
                const photos = data.filter(
                    photo => photo.albumId === albumId
                );
                res.status(200).json(photos);
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
        this.getPhotosByAlbum();
    }
};

export default Photos;