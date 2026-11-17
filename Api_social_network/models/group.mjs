import Validator from 'better-validator';

import authToken from '../helpers/auth-token.mjs';

let data = [
    {
        id: 1,
        name: 'Groupe EFREI',
        description: 'Communauté des étudiants EFREI',
        icon: 'icon.png',
        coverPhoto: 'cover.jpg',
        type: 'public',
        allowMembersPost: true,
        allowMembersCreateEvent: true,
        admins: [1],
        members: [1, 2]
    }
];

const Groups = class Groups {
    constructor(app) {
        this.app = app;
        this.run();
    }

    validateGroup(req) {
        const validator = new Validator();
        validator(req.body.name)
            .required()
            .isString()
        validator(req.body.description)
            .required()
            .isString();
        validator(req.body.icon)
            .required()
            .isString();
        validator(req.body.coverPhoto)
            .required()
            .isString();
        validator(req.body.type)
            .required()
            .isString();
        return validator.run();
    }

    getAll() {
        this.app.get('/groups', authToken, (req, res) => {
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
        this.app.get('/groups/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const group = data.find(
                    group => group.id === id
                );
                if (!group) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Group not found'
                    });
                }
                res.status(200).json(group);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    create() {
        this.app.post('/groups', authToken, async (req, res) => {
            try {
                const errors = await this.validateGroup(req);
                if (errors.length > 0) {
                    return res.status(400).json({
                        code: 400,
                        message: 'Validation failed',
                        errors
                    });
                }
                if (
                    req.body.type !== 'public' &&
                    req.body.type !== 'private' &&
                    req.body.type !== 'secret'
                ) {
                    return res.status(400).json({
                        code: 400,
                        message: 'Type must be public, private or secret'
                    });
                }
                const group = {
                    id: data.length + 1,
                    name: req.body.name,
                    description: req.body.description,
                    icon: req.body.icon,
                    coverPhoto: req.body.coverPhoto,
                    type: req.body.type,
                    allowMembersPost:
                        req.body.allowMembersPost ?? false,
                    allowMembersCreateEvent:
                        req.body.allowMembersCreateEvent ?? false,
                    admins:
                        req.body.admins ?? [],
                    members:
                        req.body.members ?? []
                };
                data.push(group);
                res.status(201).json(group);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    update() {
        this.app.put('/groups/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const group = data.find(
                    group => group.id === id
                );
                if (!group) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Group not found'
                    });
                }
                group.name = req.body.name ?? group.name;
                group.description = req.body.description ?? group.description;
                group.icon = req.body.icon ?? group.icon;
                group.coverPhoto = req.body.coverPhoto ?? group.coverPhoto;
                group.type = req.body.type ?? group.type;
                group.allowMembersPost = req.body.allowMembersPost ?? group.allowMembersPost;
                group.allowMembersCreateEvent = req.body.allowMembersCreateEvent ?? group.allowMembersCreateEvent;
                res.status(200).json(group);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    delete() {
        this.app.delete('/groups/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const index = data.findIndex(
                    group => group.id === id
                );
                if (index === -1) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Group not found'
                    });
                }
                const deletedGroup = data.splice(index, 1);
                res.status(200).json(deletedGroup[0]);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    addMember() {
        this.app.post('/groups/:id/members', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const group = data.find(
                    group => group.id === id
                );
                if (!group) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Group not found'
                    });
                }
                const { userId } = req.body;
                if (group.members.includes(userId)) {
                    return res.status(409).json({
                        code: 409,
                        message: 'Member already exists'
                    });
                }
                group.members.push(userId);
                res.status(200).json(group);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    addAdmin() {
        this.app.post('/groups/:id/admins', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const group = data.find(
                    group => group.id === id
                );
                if (!group) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Group not found'
                    });
                }
                const { userId } = req.body;
                if (group.admins.includes(userId)) {
                    return res.status(409).json({
                        code: 409,
                        message: 'Admin already exists'
                    });
                }
                group.admins.push(userId);
                res.status(200).json(group);
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
        this.addMember();
        this.addAdmin();
    }
};
export default Groups;