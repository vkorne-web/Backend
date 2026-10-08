const nodemailer = require("nodemailer");
require("dotenv").config();

// Transporte SMTP configurable por variables de entorno.
// Ejemplo (.env):
//   MAIL_HOST=smtp.gmail.com
//   MAIL_PORT=587
//   MAIL_USER=tu_correo@gmail.com
//   MAIL_PASS=tu_app_password
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.ethereal.email",
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: process.env.MAIL_USER
        ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
        : undefined
});

// Envia el correo de recuperacion con un boton hacia el reset de password.
const sendPasswordResetEmail = async (to, resetUrl) => {
    const mailOptions = {
        from: process.env.MAIL_FROM || '"Ecommerce" <no-reply@ecommerce.com>',
        to,
        subject: "Recuperacion de contrasena",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                <h2>Restablecer contrasena</h2>
                <p>Recibimos una solicitud para restablecer tu contrasena.</p>
                <p>Hace click en el boton para crear una nueva. El enlace expira en 1 hora.</p>
                <p style="text-align: center; margin: 32px 0;">
                    <a href="${resetUrl}"
                       style="background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
                        Restablecer contrasena
                    </a>
                </p>
                <p style="color: #666; font-size: 12px;">Si no solicitaste este cambio, ignora este correo.</p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = { transporter, sendPasswordResetEmail };
