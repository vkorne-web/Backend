const { Router } = require('express');
const passport = require('passport');
const CartManager = require('../managers/CartManager');
const cartService = require('../services/cart.service');
const { authorization } = require('../middlewares/auth.middleware');

const router = Router();
const cartManager = new CartManager();

// Middlewares reutilizables.
const authenticated = passport.authenticate('current', { session: false, failWithError: true });
const userOnly = [authenticated, authorization('user')];

// POST /api/carts - Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el carrito' });
    }
});

// GET /api/carts/:cid - Listar productos del carrito (con populate)
router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getCartById(cid);
        res.json(cart.products);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// POST /api/carts/:cid/products/:pid - Agregar producto al carrito (SOLO USUARIO)
router.post('/:cid/products/:pid', userOnly, async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await cartManager.addProductToCart(cid, pid);
        res.json(updatedCart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /api/carts/:cid/purchase - Finalizar la compra y generar el ticket (USUARIO autenticado)
router.post('/:cid/purchase', userOnly, async (req, res) => {
    try {
        const { cid } = req.params;
        const purchaser = req.user.email;

        const result = await cartService.purchaseCart(cid, purchaser);

        res.json({
            status: 'success',
            message: 'Compra finalizada',
            ticket: result.ticket,
            amount: result.amount,
            productsNotProcessed: result.productsNotProcessed
        });
    } catch (error) {
        res.status(400).json({ status: 'error', error: error.message });
    }
});

// DELETE /api/carts/:cid/products/:pid - Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await cartManager.deleteProductFromCart(cid, pid);
        res.json({ message: 'Producto eliminado del carrito', cart: updatedCart });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/carts/:cid - Reemplazar todos los productos del carrito con un arreglo
router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;
        const updatedCart = await cartManager.updateCartProducts(cid, products);
        res.json({ message: 'Carrito actualizado', cart: updatedCart });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/carts/:cid/products/:pid - Actualizar SOLO la cantidad de un producto
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;
        const updatedCart = await cartManager.updateProductQuantity(cid, pid, quantity);
        res.json({ message: 'Cantidad actualizada', cart: updatedCart });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/carts/:cid - Vaciar el carrito (eliminar todos los productos)
router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const updatedCart = await cartManager.clearCart(cid);
        res.json({ message: 'Carrito vaciado', cart: updatedCart });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
