const CartModel = require("../models/cart.model");

// DAO de carritos: encapsula TODO el acceso a la base para carritos.
class CartDAO {
    async create() {
        const newCart = await CartModel.create({ products: [] });
        return newCart.toObject();
    }

    async getAll() {
        return await CartModel.find().lean();
    }

    async getById(id, { populate = false } = {}) {
        let query = CartModel.findById(id);
        if (populate) {
            query = query.populate("products.product");
        }
        const cart = await query.lean();
        return cart;
    }

    async save(cart) {
        // Persiste un documento de carrito ya modificado en memoria.
        const saved = await cart.save();
        return saved.toObject();
    }

    async updateById(id, update) {
        return await CartModel.findByIdAndUpdate(id, update, {
            returnDocument: "after",
            runValidators: true
        }).lean();
    }

    // Necesario para logica de negocio que modifica el arreglo de productos.
    async getDocumentById(id) {
        return await CartModel.findById(id);
    }

    async deleteProductFromCart(cid, pid) {
        const cart = await CartModel.findById(cid);
        if (!cart) return null;
        const index = cart.products.findIndex(p => p.product.toString() === pid);
        if (index === -1) return cart.toObject();
        cart.products.splice(index, 1);
        const saved = await cart.save();
        return saved.toObject();
    }
}

module.exports = CartDAO;
