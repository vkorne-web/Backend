const { Router } = require("express");
const path = require("path");
const ProductManager = require(path.resolve(__dirname, "../../managers/ProductManager"));

const router = Router();
const productManager = new ProductManager();

router.get("/", async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render("home", {
            title: "Inicio - Tienda",
            products: products
        });
    } catch (error) {
        res.status(500).send("Error al obtener los productos");
    }
});

router.get("/realtimeproducts", async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render("realTimeProducts", {
            title: "Productos en Tiempo Real - Tienda",
            products: products
        });
    } catch (error) {
        res.status(500).send("Error al obtener los productos");
    }
});

module.exports = router;
