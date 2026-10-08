const userRepository = require("../repository/user.repository");
const { createHash, isValidPassword } = require("../utils/password.utils");
const { generateResetToken, verifyResetToken } = require("../utils/jwt.utils");
const { sendPasswordResetEmail } = require("../utils/mailing.util");

// Logica de negocio relacionada con autenticacion y recuperacion de contrasena.
class AuthService {
    // Genera el token de recuperacion (expira en 1h) y envia el correo con el boton.
    async requestPasswordReset(email, baseUrl) {
        const user = await userRepository.getByEmail(email);
        if (!user) {
            throw new Error("No existe un usuario con ese email");
        }

        const token = generateResetToken(user);
        const resetUrl = `${baseUrl}/reset-password/${token}`;

        await sendPasswordResetEmail(user.email, resetUrl);

        return { message: "Correo de recuperacion enviado", email: user.email };
    }

    // Restablece la contrasena validando el token y evitando reutilizar la misma.
    async resetPassword(token, newPassword) {
        if (!newPassword) {
            throw new Error("La nueva contrasena es obligatoria");
        }

        let payload;
        try {
            payload = verifyResetToken(token);
        } catch (error) {
            throw new Error("El enlace de recuperacion es invalido o ha expirado");
        }

        const user = await userRepository.getByEmail(payload.email);
        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // Evitar que la nueva contrasena sea igual a la anterior.
        if (isValidPassword(newPassword, user.password)) {
            throw new Error("La nueva contrasena no puede ser igual a la anterior");
        }

        await userRepository.update(user._id, { password: createHash(newPassword) });

        return { message: "Contrasena actualizada correctamente" };
    }
}

module.exports = new AuthService();
