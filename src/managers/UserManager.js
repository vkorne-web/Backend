const userRepository = require("../repository/user.repository");
const cartRepository = require("../repository/cart.repository");
const { createHash, isValidPassword } = require("../utils/password.utils");
const UserDTO = require("../dto/user.dto");

// Logica de negocio de usuarios. Accede a datos a traves del Repository.
class UserManager {
    // Trae todos los usuarios (sin exponer la password).
    async getUsers() {
        return await userRepository.getAll();
    }

    // Trae un usuario por id (sin password).
    async getUserById(id) {
        const user = await userRepository.getById(id);
        if (!user) {
            throw new Error(`Usuario con id ${id} no encontrado`);
        }
        return user;
    }

    // Busca por email (incluye password para poder comparar en el login).
    async getUserByEmail(email) {
        const user = await userRepository.getByEmail(email);
        if (!user) {
            throw new Error(`No existe un usuario con email ${email}`);
        }
        return user;
    }

    // Crea un nuevo usuario encriptando la password con bcrypt y asignando un carrito.
    async createUser(userData) {
        const { first_name, last_name, email, age, password, role } = userData;

        if (!first_name || !last_name || !email || !age || !password) {
            throw new Error("Faltan campos obligatorios");
        }

        const existing = await userRepository.getByEmail(email);
        if (existing) {
            throw new Error(`Ya existe un usuario con el email ${email}`);
        }

        const cart = await cartRepository.create();

        const newUser = await userRepository.create({
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            cart: cart._id,
            role: role || "user"
        });

        return new UserDTO(newUser);
    }

    // Actualiza un usuario por id.
    async updateUser(id, updates) {
        const user = await userRepository.getById(id);
        if (!user) {
            throw new Error(`Usuario con id ${id} no encontrado`);
        }

        if (updates.email) {
            const existing = await userRepository.getByEmail(updates.email);
            if (existing && existing._id.toString() !== id) {
                throw new Error(`Ya existe un usuario con el email ${updates.email}`);
            }
        }

        if (updates.password) {
            updates.password = createHash(updates.password);
        } else {
            delete updates.password;
        }

        const updated = await userRepository.update(id, updates);
        return new UserDTO(updated);
    }

    // Elimina un usuario por id.
    async deleteUser(id) {
        const deleted = await userRepository.delete(id);
        if (!deleted) {
            throw new Error(`Usuario con id ${id} no encontrado`);
        }
        return deleted;
    }

    // Valida credenciales para el login.
    async validateUser(email, password) {
        const user = await userRepository.getByEmail(email);
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
