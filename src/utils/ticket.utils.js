const crypto = require("crypto");

// Genera un codigo unico para el ticket.
const generateTicketCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `TICKET-${timestamp}-${random}`;
};

module.exports = { generateTicketCode };
