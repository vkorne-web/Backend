const mongoose = require("mongoose");

const collection = "carts";

const cartSchema = new mongoose.Schema({
    products: {
        type: [
            {
                // Guardamos SOLO el id del producto como referencia al modelo "products".
                // Al hacer populate se desglosan los datos completos del producto.
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products",
                    required: true
                },
                quantity: {
                    type: Number,
                    default: 1
                }
            }
        ],
        default: []
    }
});

const CartModel = mongoose.model(collection, cartSchema);

module.exports = CartModel;
