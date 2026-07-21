// Maneja quitar un producto y vaciar el carrito en la vista /carts/:cid.

// Quitar un producto puntual
document.querySelectorAll(".btn-remove").forEach((btn) => {
    btn.addEventListener("click", async () => {
        const cartId = btn.dataset.cart;
        const productId = btn.dataset.product;
        try {
            const res = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("No se pudo quitar el producto");
            location.reload();
        } catch (error) {
            alert(error.message);
        }
    });
});

// Vaciar todo el carrito
document.querySelectorAll(".btn-clear").forEach((btn) => {
    btn.addEventListener("click", async () => {
        const cartId = btn.dataset.cart;
        try {
            const res = await fetch(`/api/carts/${cartId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("No se pudo vaciar el carrito");
            location.reload();
        } catch (error) {
            alert(error.message);
        }
    });
});
