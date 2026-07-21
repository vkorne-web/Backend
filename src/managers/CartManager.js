const CartModel = require("../models/cart.model");

class CartManager {
    async getCarts() {
        return await CartModel.find().lean();
    }

    // Trae el carrito con los productos completos mediante populate.
    async getCartById(id) {
        const cart = await CartModel.findById(id).populate("products.product").lean();
        if (!cart) {
            throw new Error(`Carrito con id ${id} no encontrado`);
        }
        return cart;
    }

    async createCart() {
        const newCart = await CartModel.create({ products: [] });
        return newCart.toObject();
    }

    // Agrega un producto al carrito. Si ya existe, incrementa la cantidad.
    async addProductToCart(cid, pid) {
        const cart = await CartModel.findById(cid);
        if (!cart) {
            throw new Error(`Carrito con id ${cid} no encontrado`);
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);

        if (productIndex === -1) {
            cart.products.push({ product: pid, quantity: 1 });
        } else {
            cart.products[productIndex].quantity++;
        }

        await cart.save();
        return cart.toObject();
    }

    // Elimina un producto especifico del carrito.
    async deleteProductFromCart(cid, pid) {
        const cart = await CartModel.findById(cid);
        if (!cart) {
            throw new Error(`Carrito con id ${cid} no encontrado`);
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        if (productIndex === -1) {
            throw new Error(`Producto con id ${pid} no encontrado en el carrito`);
        }

        cart.products.splice(productIndex, 1);
        await cart.save();
        return cart.toObject();
    }

    // Reemplaza TODO el arreglo de productos del carrito.
    // products debe ser un arreglo con la forma [{ product, quantity }, ...]
    async updateCartProducts(cid, products) {
        if (!Array.isArray(products)) {
            throw new Error("El body debe contener un arreglo de productos");
        }

        const cart = await CartModel.findByIdAndUpdate(
            cid,
            { products },
            { returnDocument: "after", runValidators: true }
        );

        if (!cart) {
            throw new Error(`Carrito con id ${cid} no encontrado`);
        }
        return cart.toObject();
    }

    // Actualiza SOLO la cantidad de un producto dentro del carrito.
    async updateProductQuantity(cid, pid, quantity) {
        if (quantity == null || isNaN(Number(quantity))) {
            throw new Error("La cantidad (quantity) es obligatoria y debe ser un numero");
        }

        const cart = await CartModel.findById(cid);
        if (!cart) {
            throw new Error(`Carrito con id ${cid} no encontrado`);
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
        if (productIndex === -1) {
            throw new Error(`Producto con id ${pid} no encontrado en el carrito`);
        }

        cart.products[productIndex].quantity = Number(quantity);
        await cart.save();
        return cart.toObject();
    }

    // Vacia el carrito (elimina todos los productos).
    async clearCart(cid) {
        const cart = await CartModel.findByIdAndUpdate(
            cid,
            { products: [] },
            { returnDocument: "after" }
        );

        if (!cart) {
            throw new Error(`Carrito con id ${cid} no encontrado`);
        }
        return cart.toObject();
    }
}

module.exports = CartManager;
