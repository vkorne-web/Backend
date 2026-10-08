const CartDAO = require("../dao/mongo/cart.dao");

// Repository de carritos.
class CartRepository {
    constructor() {
        this.dao = new CartDAO();
    }

    async create() {
        return await this.dao.create();
    }

    async getAll() {
        return await this.dao.getAll();
    }

    async getById(id, options) {
        return await this.dao.getById(id, options);
    }

    async getDocumentById(id) {
        return await this.dao.getDocumentById(id);
    }

    async save(cart) {
        return await this.dao.save(cart);
    }

    async updateById(id, update) {
        return await this.dao.updateById(id, update);
    }

    async deleteProductFromCart(cid, pid) {
        return await this.dao.deleteProductFromCart(cid, pid);
    }
}

module.exports = new CartRepository();
