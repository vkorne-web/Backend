const { Router } = require('express');
const UserManager = require('../managers/UserManager');

const router = Router();
const userManager = new UserManager();

// GET /api/users - Listar todos los usuarios
router.get('/', async (req, res) => {
    try {
        const users = await userManager.getUsers();
        res.json({ status: 'success', payload: users });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// GET /api/users/:uid - Obtener usuario por id
router.get('/:uid', async (req, res) => {
    try {
        const user = await userManager.getUserById(req.params.uid);
        res.json({ status: 'success', payload: user });
    } catch (error) {
        res.status(404).json({ status: 'error', error: error.message });
    }
});

// POST /api/users - Crear usuario
router.post('/', async (req, res) => {
    try {
        const user = await userManager.createUser(req.body);
        res.status(201).json({ status: 'success', payload: user });
    } catch (error) {
        res.status(400).json({ status: 'error', error: error.message });
    }
});

// PUT /api/users/:uid - Actualizar usuario
router.put('/:uid', async (req, res) => {
    try {
        const user = await userManager.updateUser(req.params.uid, req.body);
        res.json({ status: 'success', payload: user });
    } catch (error) {
        res.status(400).json({ status: 'error', error: error.message });
    }
});

// DELETE /api/users/:uid - Eliminar usuario
router.delete('/:uid', async (req, res) => {
    try {
        const deleted = await userManager.deleteUser(req.params.uid);
        res.json({ status: 'success', message: 'Usuario eliminado', payload: deleted });
    } catch (error) {
        res.status(404).json({ status: 'error', error: error.message });
    }
});

module.exports = router;
