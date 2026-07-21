// Script de carga inicial de productos de prueba.
// Uso:  npm run seed
require("dotenv").config();
const connectDB = require("./config/db");
const ProductModel = require("./models/product.model");

const categories = ["Electronica", "Ropa", "Hogar", "Juguetes", "Libros"];

// Generamos productos variados para probar paginacion, filtros y orden por precio.
const products = Array.from({ length: 24 }, (_, i) => {
    const n = i + 1;
    return {
        title: `Producto ${n}`,
        description: `Descripcion del producto ${n}`,
        code: `COD-${String(n).padStart(3, "0")}`,
        price: Math.round((10 + Math.pow(n, 1.6)) * 100) / 100,
        status: n % 5 !== 0, // algunos no disponibles para probar el filtro status
        stock: (n * 3) % 40,
        category: categories[i % categories.length],
        thumbnails: []
    };
});

const seed = async () => {
    await connectDB();
    await ProductModel.deleteMany({});
    await ProductModel.insertMany(products);
    console.log(`Seed completado: ${products.length} productos insertados.`);
    process.exit(0);
};

seed().catch((error) => {
    console.error("Error en el seed:", error);
    process.exit(1);
});
