// Script de carga de usuarios de prueba (un admin y un user).
// Uso:  npm run seed:users
require("dotenv").config();
const connectDB = require("./config/db");
const UserModel = require("./models/user.model");
const CartModel = require("./models/cart.model");
const { createHash } = require("./utils/password.utils");

const testUsers = [
    {
        first_name: "Admin",
        last_name: "Principal",
        email: "admin@test.com",
        age: 35,
        password: "admin123",
        role: "admin"
    },
    {
        first_name: "Usuario",
        last_name: "Comun",
        email: "user@test.com",
        age: 28,
        password: "user123",
        role: "user"
    }
];

const seedUsers = async () => {
    await connectDB();

    await UserModel.deleteMany({ email: { $in: testUsers.map(u => u.email) } });

    for (const u of testUsers) {
        const cart = await CartModel.create({ products: [] });
        await UserModel.create({
            first_name: u.first_name,
            last_name: u.last_name,
            email: u.email,
            age: u.age,
            password: createHash(u.password),
            cart: cart._id,
            role: u.role
        });
        console.log(`Usuario creado: ${u.email} (rol: ${u.role}, pass: ${u.password})`);
    }

    console.log("Seed de usuarios completado.");
    process.exit(0);
};

seedUsers().catch((error) => {
    console.error("Error en el seed de usuarios:", error);
    process.exit(1);
});
