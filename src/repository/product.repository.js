const ProductDAO = require("../dao/mongo/product.dao");

// Repository de productos: capa intermedia entre la logica de negocio y el DAO.
class ProductRepository {
    constructor() {
        this.dao = new ProductDAO();
    }

    async getAll(params) {
        return await this.dao.getAll(params);
    }

    async getById(id) {
        return await this.dao.getById(id);
    }

    async getByCode(code) {
        return await this.dao.getByCode(code);
    }

    async create(productData) {
        return await this.dao.create(productData);
    }

    async update(id, fieldsToUpdate) {
        return await this.dao.update(id, fieldsToUpdate);
    }

    async delete(id) {
        return await this.dao.delete(id);
    }
}

module.exports = new ProductRepository();
