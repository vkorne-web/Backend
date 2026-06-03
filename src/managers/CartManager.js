const fs = require('fs');
const path = require('path');

class CartManager {
    constructor() {
        this.path = path.resolve(__dirname, '../../data/carts.json');
        this.init();
    }

    async init() {
        try {
            if (!fs.existsSync(this.path)) {
                await fs.promises.writeFile(this.path, JSON.stringify([], null, 2));
            }
        } catch (error) {
            console.error('Error inicializando CartManager:', error);
        }
    }

    async getCarts() {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async getCartById(id) {
        const carts = await this.getCarts();
        const cart = carts.find(c => c.id === id);
        if (!cart) {
            throw new Error(`Carrito con id ${id} no encontrado`);
        }
        return cart;
    }

    async createCart() {
        const carts = await this.getCarts();

        let newId;
        if (carts.length === 0) {
            newId = 1;
        } else {
            newId = carts[carts.length - 1].id + 1;
        }

        const newCart = {
            id: newId,
            products: []
        };

        carts.push(newCart);
        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        return newCart;
    }

    async addProductToCart(cid, pid) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(c => c.id === cid);

        if (cartIndex === -1) {
            throw new Error(`Carrito con id ${cid} no encontrado`);
        }

        const productIndex = carts[cartIndex].products.findIndex(p => p.product === pid);

        if (productIndex === -1) {
            // Si el producto no existe en el carrito, lo agregamos
            carts[cartIndex].products.push({
                product: pid,
                quantity: 1
            });
        } else {
            // Si ya existe, incrementamos la cantidad
            carts[cartIndex].products[productIndex].quantity++;
        }

        await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        return carts[cartIndex];
    }
}

module.exports = CartManager;
