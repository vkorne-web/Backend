const { Router } = require('express');
const passport = require('passport');
const ticketRepository = require('../repository/ticket.repository');
const { authorization } = require('../middlewares/auth.middleware');

const router = Router();

// Consulta de tickets: SOLO ADMIN.
const adminOnly = [
    passport.authenticate('current', { session: false, failWithError: true }),
    authorization('admin')
];

// GET /api/tickets - Listar todos los tickets (ADMIN)
router.get('/', adminOnly, async (req, res) => {
    try {
        const tickets = await ticketRepository.getAll();
        res.json({ status: 'success', payload: tickets });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// GET /api/tickets/:tid - Obtener un ticket por id (ADMIN)
router.get('/:tid', adminOnly, async (req, res) => {
    try {
        const ticket = await ticketRepository.getById(req.params.tid);
        if (!ticket) {
            return res.status(404).json({ status: 'error', error: 'Ticket no encontrado' });
        }
        res.json({ status: 'success', payload: ticket });
    } catch (error) {
        res.status(404).json({ status: 'error', error: error.message });
    }
});

module.exports = router;
