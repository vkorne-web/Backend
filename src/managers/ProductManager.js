const ProductModel = require("../models/product.model");

class ProductManager {
    // Devuelve productos con paginacion, filtros y ordenamiento.
    // params: { limit, page, sort, query }
    //   - limit: cantidad de elementos por pagina (default 10)
    //   - page: pagina solicitada (default 1)
    //   - sort: "asc" | "desc" -> ordena por precio (si no viene, no ordena)
    //   - query: filtro. Puede ser "category:valor" o "status:true/false".
    //            Si viene un texto suelto se interpreta como categoria.
    async getProducts({ limit = 10, page = 1, sort, query } = {}) {
        // Armado del filtro a partir del query param
        const filter = {};
        if (query) {
            const [key, rawValue] = query.includes(":") ? query.split(":") : ["category", query];
            const value = rawValue ?? "";
            if (key === "status") {
                filter.status = value === "true";
            } else if (key === "category") {
                filter.category = value;
            }
        }

        // Armado del ordenamiento por precio
        const options = {
            limit: Number(limit),
            page: Number(page),
            lean: true // para que Handlebars pueda renderizar los objetos
        };
        if (sort === "asc") options.sort = { price: 1 };
        if (sort === "desc") options.sort = { price: -1 };

        return await ProductModel.paginate(filter, options);
    }

    async getProductById(id) {
        const product = await ProductModel.findById(id).lean();
        if (!product) {
            throw new Error(`Producto con id ${id} no encontrado`);
        }
        return product;
    }

    async addProduct({ title, description, code, price, status = true, stock, category, thumbnails = [] }) {
        // Validar campos obligatorios
        if (!title || !description || !code || price == null || stock == null || !category) {
            throw new Error("Todos los campos son obligatorios excepto thumbnails y status");
        }

        // Validar que el codigo no se repita
        const existingCode = await ProductModel.findOne({ code });
        if (existingCode) {
            throw new Error(`El codigo "${code}" ya existe para otro producto`);
        }

        const newProduct = await ProductModel.create({
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        });

        return newProduct.toObject();
    }

    async updateProduct(id, updatedFields) {
        // No permitir actualizar el id
        const { _id, id: _ignore, ...fieldsToUpdate } = updatedFields;

        const product = await ProductModel.findByIdAndUpdate(id, fieldsToUpdate, {
            returnDocument: "after",
            runValidators: true
        }).lean();

        if (!product) {
            throw new Error(`Producto con id ${id} no encontrado`);
        }
        return product;
    }

    async deleteProduct(id) {
        const deletedProduct = await ProductModel.findByIdAndDelete(id).lean();
        if (!deletedProduct) {
            throw new Error(`Producto con id ${id} no encontrado`);
        }
        return deletedProduct;
    }
}

module.exports = ProductManager;
