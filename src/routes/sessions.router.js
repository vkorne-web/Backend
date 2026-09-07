const { Router } = require('express');
const passport = require('passport');
const { generateToken } = require('../utils/jwt.utils');

const router = Router();

// Helper para la respuesta safe (sin password) de un documento User.
const safeUser = (user) => {
    const { password, _id, __v, ...rest } = user.toObject ? user.toObject() : user;
    return { id: _id, ...rest };
};

// POST /api/sessions/register - Registra un usuario nuevo (passport "register")
router.post(
    '/register',
    passport.authenticate('register', { session: false, failWithError: true }),
    (req, res) => {
        res.status(201).json({ status: 'success', message: 'Usuario registrado', payload: safeUser(req.user) });
    }
);

// POST /api/sessions/login - Autentica y entrega un token JWT (passport "login")
router.post(
    '/login',
    passport.authenticate('login', { session: false, failWithError: true }),
    (req, res) => {
        try {
            const token = generateToken(req.user);

            // Guardamos el token en una cookie httpOnly para poder leerlo en /current
            res.cookie('token', token, {
                maxAge: 24 * 60 * 60 * 1000, // 24hs
                httpOnly: true
            });

            res.json({
                status: 'success',
                message: 'Login exitoso',
                token,
                payload: safeUser(req.user)
            });
        } catch (error) {
            res.status(500).json({ status: 'error', error: 'No se pudo generar el token' });
        }
    }
);

// GET /api/sessions/current - Devuelve los datos del usuario ligados al JWT (passport "current")
router.get(
    '/current',
    passport.authenticate('current', { session: false, failWithError: true }),
    (req, res) => {
        res.json({ status: 'success', payload: req.user });
    }
);

// GET /api/sessions/logout - Limpia la cookie del token
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ status: 'success', message: 'Sesion cerrada' });
});

module.exports = router;
