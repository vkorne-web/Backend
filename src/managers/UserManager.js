const UserModel = require("../models/user.model");
const CartManager = require("./CartManager");
const { createHash, isValidPassword } = require("../utils/password.utils");

const cartManager = new CartManager();

class UserManager {
    // Trae todos los usuarios (sin exponer la password).
    async getUsers() {
        return await UserModel.find().select("-password").lean();
    }

    // Trae un usuario por id (sin password).
    async getUserById(id) {
        const user = await UserModel.findById(id).select("-password").lean();
        if (!user) {
            throw new Error(`Usuario con id ${id} no encontrado`);
        }
        return user;
    }

    // Busca por email (incluye password para poder comparar en el login).
    async getUserByEmail(email) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new Error(`No existe un usuario con email ${email}`);
        }
        return user;
    }

    // Crea un nuevo usuario encriptando la password con bcrypt.
    // Ademas le asigna un carrito propio como referencia.
    async createUser(userData) {
        const { first_name, last_name, email, age, password, role } = userData;

        if (!first_name || !last_name || !email || !age || !password) {
            throw new Error("Faltan campos obligatorios");
        }

        const existing = await UserModel.findOne({ email });
        if (existing) {
            throw new Error(`Ya existe un usuario con el email ${email}`);
        }

        const cart = await cartManager.createCart();

        const newUser = await UserModel.create({
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            cart: cart._id,
            role: role || "user"
        });

        // Devolvemos el usuario sin la password para no exponerla.
        const { password: _ignored, ...safeUser } = newUser.toObject();
        return safeUser;
    }

    // Actualiza un usuario por id.
    async updateUser(id, updates) {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new Error(`Usuario con id ${id} no encontrado`);
        }

        if (updates.email) {
            const existing = await UserModel.findOne({ email: updates.email });
            if (existing && existing._id.toString() !== id) {
                throw new Error(`Ya existe un usuario con el email ${updates.email}`);
            }
        }

        if (updates.password) {
            updates.password = createHash(updates.password);
        } else {
            delete updates.password;
        }

        const updated = await UserModel.findByIdAndUpdate(id, updates, { returnDocument: "after" });
        const { password: _ignored, ...safeUser } = updated.toObject();
        return safeUser;
    }

    // Elimina un usuario por id.
    async deleteUser(id) {
        const deleted = await UserModel.findByIdAndDelete(id);
        if (!deleted) {
            throw new Error(`Usuario con id ${id} no encontrado`);
        }
        return deleted;
    }

    // Valida credenciales para el login.
    async validateUser(email, password) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new Error("Credenciales invalidas");
        }
        if (!isValidPassword(password, user.password)) {
            throw new Error("Credenciales invalidas");
        }
        return user;
    }
}

module.exports = UserManager;
