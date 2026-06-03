const fs = require('fs');
const path = require('path');

class ProductManager {
    constructor() {
        this.path = path.resolve(__dirname, '../../data/products.json');
        this.init();
    }

    async init() {
        try {
            if (!fs.existsSync(this.path)) {
                await fs.promises.writeFile(this.path, JSON.stringify([], null, 2));
            }
        } catch (error) {
            console.error('Error inicializando ProductManager:', error);
        }
    }

    async getProducts() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async getProductById(id) {
        const products = await this.getProducts();
        const product = products.find(p => p.id === id);
        if (!product) {
            throw new Error(`Producto con id ${id} no encontrado`);
        }
        return product;
    }

    async addProduct({ title, description, code, price, status = true, stock, category, thumbnails = [] }) {
        // Validar campos obligatorios
        if (!title || !description || !code || !price || !stock || !category) {
            throw new Error('Todos los campos son obligatorios excepto thumbnails y status');
        }

        const products = await this.getProducts();

        // Validar que el código no se repita
        const existingCode = products.find(p => p.code === code);
        if (existingCode) {
            throw new Error(`El código "${code}" ya existe para otro producto`);
        }

        // Generar ID autoincremental
        let newId;
        if (products.length === 0) {
            newId = 1;
        } else {
            newId = products[products.length - 1].id + 1;
        }

        const newProduct = {
            id: newId,
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        };

        products.push(newProduct);
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        return newProduct;
    }

    async updateProduct(id, updatedFields) {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            throw new Error(`Producto con id ${id} no encontrado`);
        }

        // No permitir actualizar ni eliminar el id
        const { id: _, ...fieldsToUpdate } = updatedFields;

        products[index] = { ...products[index], ...fieldsToUpdate };
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        return products[index];
    }

    async deleteProduct(id) {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            throw new Error(`Producto con id ${id} no encontrado`);
        }

        const deletedProduct = products.splice(index, 1)[0];
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        return deletedProduct;
    }
}

module.exports = ProductManager;
