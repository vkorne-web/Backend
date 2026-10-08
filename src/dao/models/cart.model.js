const mongoose = require("mongoose");

const collection = "carts";

const cartSchema = new mongoose.Schema({
    products: {
        type: [
            {
                // Referencia al modelo "products". Con populate se desglosan los datos completos.
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
