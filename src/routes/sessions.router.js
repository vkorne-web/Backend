const { Router } = require('express');
const passport = require('passport');
const { generateToken } = require('../utils/jwt.utils');
const authService = require('../services/auth.service');
const UserDTO = require('../dto/user.dto');

const router = Router();

// POST /api/sessions/register - Registra un usuario nuevo (passport "register")
router.post(
    '/register',
    passport.authenticate('register', { session: false, failWithError: true }),
    (req, res) => {
        res.status(201).json({ status: 'success', message: 'Usuario registrado', payload: new UserDTO(req.user) });
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
                payload: new UserDTO(req.user)
            });
        } catch (error) {
            res.status(500).json({ status: 'error', error: 'No se pudo generar el token' });
        }
    }
);

// GET /api/sessions/current - Devuelve SOLO datos no sensibles del usuario (DTO) ligado al JWT
router.get(
    '/current',
    passport.authenticate('current', { session: false, failWithError: true }),
    (req, res) => {
        res.json({ status: 'success', payload: new UserDTO(req.user) });
    }
);

// GET /api/sessions/logout - Limpia la cookie del token
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ status: 'success', message: 'Sesion cerrada' });
});

// POST /api/sessions/forgot-password - Envia un correo con el boton de recuperacion (expira en 1h)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ status: 'error', error: 'El email es obligatorio' });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const result = await authService.requestPasswordReset(email, baseUrl);

        res.json({ status: 'success', ...result });
    } catch (error) {
        res.status(400).json({ status: 'error', error: error.message });
    }
});

// POST /api/sessions/reset-password/:token - Restablece la contrasena (no puede ser igual a la anterior)
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const result = await authService.resetPassword(token, password);

        res.json({ status: 'success', ...result });
    } catch (error) {
        res.status(400).json({ status: 'error', error: error.message });
    }
});

module.exports = router;
