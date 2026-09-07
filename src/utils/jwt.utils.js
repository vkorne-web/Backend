const jwt = require("jsonwebtoken");

// Clave secreta para firmar/verificar JWT. Puede venir de .env.
const secretKey = process.env.JWT_SECRET || "s3cr3t_c0derhouse_key";

// Firmamos el token con datos minimos del usuario.
const generateToken = (user) => {
    const payload = {
        id: user._id.toString(),
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
    };
    return jwt.sign(payload, secretKey, { expiresIn: "24h" });
};

// Verificamos y devolvemos el payload decodificado.
const verifyToken = (token) => {
    return jwt.verify(token, secretKey);
};

module.exports = { generateToken, verifyToken };
