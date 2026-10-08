const { Router } = require('express');
const passport = require('passport');
const UserManager = require('../managers/UserManager');
const { authorization } = require('../middlewares/auth.middleware');

const router = Router();
const userManager = new UserManager();

// CRUD de usuarios: SOLO ADMIN.
const adminOnly = [
    passport.authenticate('current', { session: false, failWithError: true }),
    authorization('admin')
];

// GET /api/users - Listar todos los usuarios (ADMIN)
router.get('/', adminOnly, async (req, res) => {
    try {
        const users = await userManager.getUsers();
        res.json({ status: 'success', payload: users });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// GET /api/users/:uid - Obtener usuario por id (ADMIN)
router.get('/:uid', adminOnly, async (req, res) => {
    try {
        const user = await userManager.getUserById(req.params.uid);
        res.json({ status: 'success', payload: user });
    } catch (error) {
        res.status(404).json({ status: 'error', error: error.message });
    }
});

// POST /api/users - Crear usuario (ADMIN)
router.post('/', adminOnly, async (req, res) => {
    try {
        const user = await userManager.createUser(req.body);
        res.status(201).json({ status: 'success', payload: user });
    } catch (error) {
        res.status(400).json({ status: 'error', error: error.message });
    }
});

// PUT /api/users/:uid - Actualizar usuario (ADMIN)
router.put('/:uid', adminOnly, async (req, res) => {
    try {
        const user = await userManager.updateUser(req.params.uid, req.body);
        res.json({ status: 'success', payload: user });
    } catch (error) {
        res.status(400).json({ status: 'error', error: error.message });
    }
});

// DELETE /api/users/:uid - Eliminar usuario (ADMIN)
router.delete('/:uid', adminOnly, async (req, res) => {
    try {
        const deleted = await userManager.deleteUser(req.params.uid);
        res.json({ status: 'success', message: 'Usuario eliminado', payload: deleted });
    } catch (error) {
        res.status(404).json({ status: 'error', error: error.message });
    }
});

module.exports = router;
