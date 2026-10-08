const UserDAO = require("../dao/mongo/user.dao");

// Repository de usuarios.
class UserRepository {
    constructor() {
        this.dao = new UserDAO();
    }

    async getAll() {
        return await this.dao.getAll();
    }

    async getById(id) {
        return await this.dao.getById(id);
    }

    async getByEmail(email) {
        return await this.dao.getByEmail(email);
    }

    async create(userData) {
        return await this.dao.create(userData);
    }

    async update(id, fieldsToUpdate) {
        return await this.dao.update(id, fieldsToUpdate);
    }

    async delete(id) {
        return await this.dao.delete(id);
    }
}

module.exports = new UserRepository();
