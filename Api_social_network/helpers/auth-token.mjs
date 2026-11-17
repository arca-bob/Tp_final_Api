import jwt from 'jsonwebtoken';

const authToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({
            code: 403,
            message: 'Token manquant'
        });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({
            code: 403,
            message: 'Format du token invalide'
        });
    }
    jwt.verify(token, 'EFREI', (err, user) => {
        if (err) {
            return res.status(401).json({
                code: 401,
                message: 'Unauthorized'
            });
        }
        req.user = user;
        next();
    });
};

export default authToken;