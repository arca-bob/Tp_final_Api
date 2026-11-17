import jwt from 'jsonwebtoken';
import Validator from 'better-validator';

const Auth = class Auth {
    constructor(app) {
        this.app = app;
        this.run();
    }

    validateAuth(req) {
        const validator = new Validator();
        validator(req.body.name)
            .required()
            .isString()
        validator(req.body.role)
            .required()
            .isString();
        return validator.run();
    }

    getAuth() {
        this.app.post('/auth', async (req, res) => {
            try {
                const errors = await this.validateAuth(req);
                if (errors.length > 0) {
                    return res.status(400).json({
                        code: 400,
                        message: 'Validation failed',
                        errors
                    });
                }
                const { name, role } = req.body;
                const token = jwt.sign({name,role},'EFREI',{expiresIn: '24h'});
                res.status(200).json({
                    code: 200,
                    message: 'Authentication successful',
                    token
                });
            } catch (error) {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    verify() {
        this.app.get('/auth/verify', (req, res) => {
            try {
                const authHeader = req.headers['authorization'];
                if (!authHeader) {
                    return res.status(403).json({
                        code: 403,
                        message: 'Token manquant'
                    });
                }
                const token = authHeader.split(' ')[1];
                jwt.verify(token, 'EFREI', (err, user) => {
                    if (err) {
                        return res.status(401).json({
                            code: 401,
                            message: 'Unauthorized'
                        });
                    }
                    return res.status(200).json({
                        code: 200,
                        message: 'Token valide',
                        user
                    });
                });
            } catch (error) {
                res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error'
                });
            }
        });
    }

    run() {
        this.getAuth();
        this.verify();
    }
};

export default Auth;