const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Token autentikasi tidak ditemukan'
        });
    }

    const token = header.split(' ')[1];

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(403).json({
            success: false,
            message: 'Token tidak valid atau sudah kedaluwarsa'
        });
    }
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Anda tidak memiliki hak akses'
            });
        }

        next();
    };
}

module.exports = {
    authenticateToken,
    authorize
};
