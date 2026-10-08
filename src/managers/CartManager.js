const cartRepository = require("../repository/cart.repository");

// Logica de negocio de carritos. Accede a datos a traves del Repository.
class CartManager {
    async getCarts() {
        return await cartRepository.getAll();
    }

    // Trae el carrito con los productos completos mediante populate.
    async getCartById(id) {
        const cart = await cartRepository.getById(id, { populate: true });
        if (!cart) {
            throw new Error(`Carrito con id ${id} no encontrado`);
        }
        return cart;
    }

    async createCart() {
        return await cartRepository.create();
    }

    // Agrega un producto al carrito. Si ya existe, incrementa la cantidad.
    async addProductToCart(cid, pid) {
        const cart = await cartRepository.getDocumentById(cid);
        if (!cart) {
            throw new Error(`Carrito con id ${cid} no encontrado`);
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);

        if (productIndex === -1) {
            cart.products.push({ product: pid, quantity: 1 });
        } else {
            cart.products[productIndex].quantity++;
        }

        return await cartRepository.save(cart);
    }

    // Elimina un producto especifico del carrito.
    async deleteProductFromCart(cid, pid) {
        const cart = await cartRepository.getDocumentById(cid);
        if (!cart) {
            throw new Error(`Carrito con id ${cid} no encontrado`);
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        if (productIndex === -1) {
            throw new Error(`Producto con id ${pid} no encontrado en el carrito`);
        }

        cart.products.splice(productIndex, 1);
        return await cartRepository.save(cart);
    }

    // Reemplaza TODO el arreglo de productos del carrito.
    async updateCartProducts(cid, products) {
        if (!Array.isArray(products)) {
            throw new Error("El body debe contener un arreglo de productos");
        }

        const cart = await cartRepository.updateById(cid, { products });
        if (!cart) {
            throw new Error(`Carrito con id ${cid} no encontrado`);
        }
        return cart;
    }

    // Actualiza SOLO la cantidad de un producto dentro del carrito.
    async updateProductQuantity(cid, pid, quantity) {
        if (quantity == null || isNaN(Number(quantity))) {
            throw new Error("La cantidad (quantity) es obligatoria y debe ser un numero");
        }

        const cart = await cartRepository.getDocumentById(cid);
        if (!cart) {
            throw new Error(`Carrito con id ${cid} no encontrado`);
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        if (productIndex === -1) {
            throw new Error(`Producto con id ${pid} no encontrado en el carrito`);
        }

        cart.products[productIndex].quantity = Number(quantity);
        return await cartRepository.save(cart);
    }

    // Vacia el carrito (elimina todos los productos).
    async clearCart(cid) {
        const cart = await cartRepository.updateById(cid, { products: [] });
        if (!cart) {
            throw new Error(`Carrito con id ${cid} no encontrado`);
        }
        return cart;
    }
}

module.exports = CartManager;
