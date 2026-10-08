const cartRepository = require("../repository/cart.repository");
const productRepository = require("../repository/product.repository");
const ticketRepository = require("../repository/ticket.repository");
const { generateTicketCode } = require("../utils/ticket.utils");

// Logica de negocio de compra: verifica stock, genera ticket y deja en el carrito
// solo los productos que NO pudieron comprarse.
class CartService {
    async purchaseCart(cid, purchaserEmail) {
        const cart = await cartRepository.getById(cid, { populate: true });
        if (!cart) {
            throw new Error(`Carrito con id ${cid} no encontrado`);
        }
        if (!cart.products || cart.products.length === 0) {
            throw new Error("El carrito esta vacio");
        }

        const productsNotProcessed = [];
        let totalAmount = 0;
        const processedProductIds = [];

        for (const item of cart.products) {
            const product = item.product;

            // Producto borrado del catalogo: no se puede procesar.
            if (!product) {
                productsNotProcessed.push({ product: null, quantity: item.quantity, reason: "Producto inexistente" });
                continue;
            }

            if (product.stock >= item.quantity) {
                // Hay stock: descontamos y sumamos al total.
                await productRepository.update(product._id, { stock: product.stock - item.quantity });
                totalAmount += product.price * item.quantity;
                processedProductIds.push(product._id.toString());
            } else {
                // Sin stock suficiente: queda pendiente en el carrito.
                productsNotProcessed.push({
                    product: product._id,
                    title: product.title,
                    quantity: item.quantity,
                    availableStock: product.stock,
                    reason: "Stock insuficiente"
                });
            }
        }

        if (processedProductIds.length === 0) {
            throw new Error("No se pudo procesar ningun producto por falta de stock");
        }

        // Generamos el ticket de la compra.
        const ticket = await ticketRepository.create({
            code: generateTicketCode(),
            amount: totalAmount,
            purchaser: purchaserEmail
        });

        // El carrito queda solo con los productos que NO se pudieron comprar.
        const remainingProducts = cart.products
            .filter(item => item.product && !processedProductIds.includes(item.product._id.toString()))
            .map(item => ({ product: item.product._id, quantity: item.quantity }));

        await cartRepository.updateById(cid, { products: remainingProducts });

        return {
            ticket,
            amount: totalAmount,
            productsNotProcessed
        };
    }
}

module.exports = new CartService();
