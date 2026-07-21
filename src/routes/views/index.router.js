const { Router } = require("express");
const ProductManager = require("../../managers/ProductManager");
const CartManager = require("../../managers/CartManager");

const router = Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

// Mantenemos un carrito "por defecto" para la demo de la vista.
// Asi el boton "Agregar al carrito" siempre tiene un cid valido.
let defaultCartId = null;
const getDefaultCartId = async () => {
    if (!defaultCartId) {
        const cart = await cartManager.createCart();
        defaultCartId = cart._id.toString();
    }
    return defaultCartId;
};

// Home: mantiene el listado simple original
router.get("/", async (req, res) => {
    try {
        const { docs: products } = await productManager.getProducts({ limit: 100 });
        res.render("home", {
            title: "Inicio - Tienda",
            products
        });
    } catch (error) {
        res.status(500).send("Error al obtener los productos");
    }
});

// Productos en tiempo real (Socket.io)
router.get("/realtimeproducts", async (req, res) => {
    try {
        const { docs: products } = await productManager.getProducts({ limit: 100 });
        res.render("realTimeProducts", {
            title: "Productos en Tiempo Real - Tienda",
            products
        });
    } catch (error) {
        res.status(500).send("Error al obtener los productos");
    }
});

// Vista de productos con paginacion, filtros y ordenamiento
router.get("/products", async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const result = await productManager.getProducts({ limit, page, sort, query });
        const cartId = await getDefaultCartId();

        // Links de paginacion conservando filtros/orden
        const buildLink = (targetPage) => {
            const params = new URLSearchParams();
            params.set("limit", limit);
            params.set("page", targetPage);
            if (sort) params.set("sort", sort);
            if (query) params.set("query", query);
            return `/products?${params.toString()}`;
        };

        res.render("index", {
            title: "Productos - Tienda",
            products: result.docs,
            cartId,
            page: result.page,
            totalPages: result.totalPages,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
            nextLink: result.hasNextPage ? buildLink(result.nextPage) : null
        });
    } catch (error) {
        res.status(500).send("Error al obtener los productos");
    }
});

// Detalle de un producto
router.get("/products/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.getProductById(pid);
        const cartId = await getDefaultCartId();
        res.render("productDetail", {
            title: `${product.title} - Tienda`,
            product,
            cartId
        });
    } catch (error) {
        res.status(404).send("Producto no encontrado");
    }
});

// Vista de un carrito especifico (solo sus productos, con populate)
router.get("/carts/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getCartById(cid);

        // Preparamos los items para la vista (subtotal por producto)
        const items = cart.products
            .filter(item => item.product) // por si algun producto fue borrado
            .map(item => ({
                ...item.product,
                quantity: item.quantity,
                subtotal: item.product.price * item.quantity
            }));

        const total = items.reduce((acc, item) => acc + item.subtotal, 0);

        res.render("cart", {
            title: "Mi Carrito - Tienda",
            cartId: cid,
            items,
            total,
            isEmpty: items.length === 0
        });
    } catch (error) {
        res.status(404).send("Carrito no encontrado");
    }
});

module.exports = router;
