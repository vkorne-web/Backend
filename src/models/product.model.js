const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const collection = "products";

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    status: { type: Boolean, default: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    thumbnails: { type: [String], default: [] }
});

// Plugin que agrega el metodo .paginate() con limit/page/sort/etc.
productSchema.plugin(mongoosePaginate);

const ProductModel = mongoose.model(collection, productSchema);

module.exports = ProductModel;
