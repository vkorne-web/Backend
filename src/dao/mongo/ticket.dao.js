const TicketModel = require("../models/ticket.model");

// DAO de tickets: encapsula TODO el acceso a la base para tickets.
class TicketDAO {
    async create(ticketData) {
        const newTicket = await TicketModel.create(ticketData);
        return newTicket.toObject();
    }

    async getById(id) {
        return await TicketModel.findById(id).lean();
    }

    async getAll() {
        return await TicketModel.find().lean();
    }
}

module.exports = TicketDAO;
