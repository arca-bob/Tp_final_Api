import Validator from 'better-validator';

import authToken from '../helpers/auth-token.mjs';

let data = [
    {
        id: 1,
        firstname: 'Alice',
        lastname: 'Martin',
        email: 'alice@gmail.com',
        role: 'user'
    },
    {
        id: 2,
        firstname: 'Tom',
        lastname: 'Dupont',
        email: 'tom@gmail.com',
        role: 'admin'
    }
];

const Users = class Users {
    constructor(app) {
        this.app = app;
        this.run();
    }

    validateUser(req) {
        const validator = new Validator();
        validator(req.body.firstname)
            .required()
            .isString()
        validator(req.body.lastname)
            .required()
            .isString()
        validator(req.body.email)
            .required()
            .isString();
        validator(req.body.role)
            .required()
            .isString();
        return validator.run();
    }

    getAll() {
        this.app.get('/users', authToken, (req, res) => {
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
        this.app.get('/users/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const user = data.find(
                    user => user.id === id
                );
                if (!user) {
                    return res.status(404).json({
                        code: 404,
                        message: 'User not found'
                    });
                }
                res.status(200).json(user);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    create() {
        this.app.post('/users', authToken, async (req, res) => {
            try {
                const errors = await this.validateUser(req);
                if (errors.length > 0) {
                    return res.status(400).json({
                        code: 400,
                        message: 'Validation failed',
                        errors
                    });
                }
                const emailExists = data.find(
                    user => user.email === req.body.email
                );
                if (emailExists) {
                    return res.status(409).json({
                        code: 409,
                        message: 'Email already exists'
                    });
                }
                const user = {
                    id: data.length + 1,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    email: req.body.email,
                    role: req.body.role
                };
                data.push(user);
                res.status(201).json(user);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    update() {
        this.app.put('/users/:id', authToken, async (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const user = data.find(
                    user => user.id === id
                );
                if (!user) {
                    return res.status(404).json({
                        code: 404,
                        message: 'User not found'
                    });
                }
                const emailExists = data.find(
                    currentUser =>
                        currentUser.email === req.body.email &&
                        currentUser.id !== id
                );
                if (emailExists) {
                    return res.status(409).json({
                        code: 409,
                        message: 'Email already exists'
                    });
                }
                user.firstname = req.body.firstname ?? user.firstname;
                user.lastname = req.body.lastname ?? user.lastname;
                user.email = req.body.email ?? user.email;
                user.role = req.body.role ?? user.role;
                res.status(200).json(user);
            } catch {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    delete() {
        this.app.delete('/users/:id', authToken, (req, res) => {
            try {
                const id = parseInt(req.params.id);
                const index = data.findIndex(
                    user => user.id === id
                );
                if (index === -1) {
                    return res.status(404).json({
                        code: 404,
                        message: 'User not found'
                    });
                }
                const deletedUser = data.splice(index, 1);
                res.status(200).json(deletedUser[0]);
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

export default Users;