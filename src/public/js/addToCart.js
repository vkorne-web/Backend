// Maneja el boton "Agregar al carrito" en el listado y el detalle.
document.querySelectorAll(".btn-add").forEach((btn) => {
    btn.addEventListener("click", async () => {
        const cartId = btn.dataset.cart;
        const productId = btn.dataset.product;

        try {
            const res = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("No se pudo agregar el producto");

            btn.textContent = "Agregado!";
            setTimeout(() => (btn.textContent = "Agregar al carrito"), 1200);
        } catch (error) {
            alert(error.message);
        }
    });
});
