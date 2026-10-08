const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { engine } = require("express-handlebars");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("dotenv").config();

const connectDB = require("./config/db");
require("./config/passport.config"); // carga las estrategias de passport
const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");
const sessionsRouter = require("./routes/sessions.router");
const usersRouter = require("./routes/users.router");
const ticketsRouter = require("./routes/tickets.router");
const viewsRouter = require("./routes/views/index.router");
const ProductManager = require("./managers/ProductManager");

const app = express();
const PORT = process.env.PORT || 8080;

// Conexion a MongoDB Atlas
connectDB();

const productManager = new ProductManager();

// Configurar Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "./views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.static(path.resolve(__dirname, "./public")));

// Rutas de API
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/users", usersRouter);
app.use("/api/tickets", ticketsRouter);

// Rutas de vistas
app.use("/", viewsRouter);

// Manejo de errores de autenticacion (passport con failWithError)
app.use((err, req, res, next) => {
    if (err.name === "AuthenticationError") {
        const status = err.status || 401;
        return res.status(status).json({ status: "error", error: err.message || "No autorizado" });
    }
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return res.status(401).json({ status: "error", error: "Token invalido o expirado" });
    }
    console.error("Error no controlado:", err.message);
    res.status(500).json({ status: "error", error: err.message || "Error interno del servidor" });
});

// Crear servidor HTTP para Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer);

// Configurar Socket.io
io.on("connection", async (socket) => {
    console.log("Cliente conectado:", socket.id);

    const { docs: products } = await productManager.getProducts({ limit: 100 });
    socket.emit("updateProducts", products);

    socket.on("addProduct", async (productData) => {
        try {
            const newProduct = await productManager.addProduct(productData);
            const { docs: updatedProducts } = await productManager.getProducts({ limit: 100 });
            io.emit("updateProducts", updatedProducts);
            console.log("Producto agregado:", newProduct.title);
        } catch (error) {
            socket.emit("error", error.message);
        }
    });

    socket.on("deleteProduct", async (id) => {
        try {
            const deleted = await productManager.deleteProduct(id);
            const { docs: updatedProducts } = await productManager.getProducts({ limit: 100 });
            io.emit("updateProducts", updatedProducts);
            console.log("Producto eliminado ID:", id);
        } catch (error) {
            socket.emit("error", error.message);
        }
    });

    socket.on("disconnect", () => {
        console.log("Cliente desconectado:", socket.id);
    });
});

httpServer.listen(PORT, () => {
    console.log("Servidor corriendo en el puerto", PORT);
    console.log("http://localhost:" + PORT);
});
