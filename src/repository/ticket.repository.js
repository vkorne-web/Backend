const TicketDAO = require("../dao/mongo/ticket.dao");

// Repository de tickets.
class TicketRepository {
    constructor() {
        this.dao = new TicketDAO();
    }

    async create(ticketData) {
        return await this.dao.create(ticketData);
    }

    async getById(id) {
        return await this.dao.getById(id);
    }

    async getAll() {
        return await this.dao.getAll();
    }
}

module.exports = new TicketRepository();
