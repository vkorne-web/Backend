const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const { engine } = require("express-handlebars");
require("dotenv").config();

const productsRouter = require("./routes/products.router");
const cartsRouter = require("./routes/carts.router");
const viewsRouter = require("./routes/views/index.router");
const ProductManager = require("./managers/ProductManager");

const app = express();
const PORT = process.env.PORT || 8080;

const productManager = new ProductManager();

// Configurar Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "./views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "./public")));

// Rutas de API
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Rutas de vistas
app.use("/", viewsRouter);

// Crear servidor HTTP para Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer);

// Configurar Socket.io
io.on("connection", async (socket) => {
    console.log("Cliente conectado:", socket.id);

    const products = await productManager.getProducts();
    socket.emit("updateProducts", products);

    socket.on("addProduct", async (productData) => {
        try {
            const newProduct = await productManager.addProduct(productData);
            const updatedProducts = await productManager.getProducts();
            io.emit("updateProducts", updatedProducts);
            console.log("Producto agregado:", newProduct.title);
        } catch (error) {
            socket.emit("error", error.message);
        }
    });

    socket.on("deleteProduct", async (id) => {
        try {
            const deleted = await productManager.deleteProduct(id);
            const updatedProducts = await productManager.getProducts();
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
