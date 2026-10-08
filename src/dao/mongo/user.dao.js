const UserModel = require("../models/user.model");

// DAO de usuarios: encapsula TODO el acceso a la base para usuarios.
class UserDAO {
    async getAll() {
        return await UserModel.find().select("-password").lean();
    }

    async getById(id) {
        return await UserModel.findById(id).select("-password").lean();
    }

    // Incluye password: se usa para login / validaciones de credenciales.
    async getByEmail(email) {
        return await UserModel.findOne({ email });
    }

    async create(userData) {
        const newUser = await UserModel.create(userData);
        return newUser.toObject();
    }

    async update(id, fieldsToUpdate) {
        return await UserModel.findByIdAndUpdate(id, fieldsToUpdate, {
            returnDocument: "after"
        }).lean();
    }

    async delete(id) {
        return await UserModel.findByIdAndDelete(id).lean();
    }
}

module.exports = UserDAO;
