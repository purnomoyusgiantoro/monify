const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'monify_secret_key_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Middleware autentikasi JWT.
 * Verifikasi token dari header Authorization: Bearer <token>
 * Meng-attach req.user = { id, name, email }
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Akses ditolak. Token tidak ditemukan.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email
        };
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token tidak valid atau sudah kedaluwarsa.'
        });
    }
}

/**
 * Middleware opsional — tidak block jika token tidak ada,
 * tapi tetap attach user jika token valid.
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = {
                id: decoded.id,
                name: decoded.name,
                email: decoded.email
            };
        } catch {
            // Token invalid, lanjutkan tanpa user
        }
    }

    next();
}

/**
 * Generate JWT token.
 */
function generateToken(user) {
    return jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

module.exports = { authMiddleware, optionalAuth, generateToken, JWT_SECRET };
