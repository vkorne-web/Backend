const jwt = require("jsonwebtoken");

// Clave secreta para firmar/verificar JWT de sesion. Puede venir de .env.
const secretKey = process.env.JWT_SECRET || "s3cr3t_c0derhouse_key";

// Clave secreta para los tokens de recuperacion de contrasena.
const resetKey = process.env.JWT_RESET_SECRET || "r3s3t_s3cr3t_c0derhouse";

// Firmamos el token de sesion con datos minimos del usuario.
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

// Token de recuperacion de contrasena: expira en 1 hora.
const generateResetToken = (user) => {
    const payload = { id: user._id.toString(), email: user.email };
    return jwt.sign(payload, resetKey, { expiresIn: "1h" });
};

// Verifica el token de recuperacion (lanza error si expiro o es invalido).
const verifyResetToken = (token) => {
    return jwt.verify(token, resetKey);
};

module.exports = { generateToken, verifyToken, generateResetToken, verifyResetToken };
