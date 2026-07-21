const mongoose = require("mongoose");

// Conexion unica a MongoDB Atlas.
// La URL se toma de la variable de entorno MONGO_URL (ver .env).
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB conectado correctamente");
    } catch (error) {
        console.error("Error al conectar con MongoDB:", error.message);
        process.exit(1); // Si no hay base de datos, no tiene sentido levantar el server
    }
};

module.exports = connectDB;
