const ProductModel = require("../models/product.model");

// DAO de productos: encapsula TODO el acceso a la base para productos.
class ProductDAO {
    async getAll({ filter = {}, options = {} } = {}) {
        return await ProductModel.paginate(filter, options);
    }

    async getById(id) {
        return await ProductModel.findById(id).lean();
    }

    async getByCode(code) {
        return await ProductModel.findOne({ code }).lean();
    }

    async create(productData) {
        const newProduct = await ProductModel.create(productData);
        return newProduct.toObject();
    }

    async update(id, fieldsToUpdate) {
        return await ProductModel.findByIdAndUpdate(id, fieldsToUpdate, {
            returnDocument: "after",
            runValidators: true
        }).lean();
    }

    async delete(id) {
        return await ProductModel.findByIdAndDelete(id).lean();
    }
}

module.exports = ProductDAO;
