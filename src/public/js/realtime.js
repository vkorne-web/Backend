const socket = io();

const productList = document.getElementById("productList");
const productForm = document.getElementById("productForm");
const deleteForm = document.getElementById("deleteForm");

socket.on("updateProducts", (products) => {
    renderProducts(products);
});

productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const product = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        code: document.getElementById("code").value.trim(),
        price: parseFloat(document.getElementById("price").value),
        stock: parseInt(document.getElementById("stock").value),
        category: document.getElementById("category").value.trim(),
        status: document.getElementById("status").checked
    };

    socket.emit("addProduct", product);
    productForm.reset();
    document.getElementById("status").checked = true;
});

deleteForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = parseInt(document.getElementById("deleteId").value);
    socket.emit("deleteProduct", id);
    deleteForm.reset();
});

productList.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-delete")) {
        const id = parseInt(e.target.dataset.id);
        socket.emit("deleteProduct", id);
    }
});

function renderProducts(products) {
    if (!products || products.length === 0) {
        productList.innerHTML = "<p class=\"empty-message\">No hay productos disponibles.</p>";
        return;
    }

    let html = "";
    products.forEach((p) => {
        const statusText = p.status ? "Disponible" : "No disponible";
        html += "<div class=\"product-card\" data-id=\"" + p.id + "\">" +
            "<h3>" + p.title + "</h3>" +
            "<p class=\"product-category\">Categoria: " + p.category + "</p>" +
            "<p class=\"product-description\">" + p.description + "</p>" +
            "<p class=\"product-code\">Codigo: " + p.code + "</p>" +
            "<p class=\"product-price\">$ " + p.price + "</p>" +
            "<p class=\"product-stock\">Stock: " + p.stock + "</p>" +
            "<p class=\"product-status\">Estado: " + statusText + "</p>" +
            "<button class=\"btn-delete\" data-id=\"" + p.id + "\">Eliminar</button>" +
            "</div>";
    });
    productList.innerHTML = html;
}