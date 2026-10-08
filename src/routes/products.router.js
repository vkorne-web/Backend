const { Router } = require('express');
const passport = require('passport');
const ProductManager = require('../managers/ProductManager');
const { authorization } = require('../middlewares/auth.middleware');

const router = Router();
const productManager = new ProductManager();

// Middlewares de autenticacion + autorizacion reutilizables.
const adminOnly = [
    passport.authenticate('current', { session: false, failWithError: true }),
    authorization('admin')
];

// GET /api/products - Listar productos con paginacion, filtros y ordenamiento
// Query params: limit (10), page (1), sort (asc/desc por precio), query (categoria o disponibilidad)
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        const result = await productManager.getProducts({ limit, page, sort, query });

        // Construimos los links de paginacion conservando los mismos filtros/orden
        const buildLink = (targetPage) => {
            const params = new URLSearchParams();
            params.set('limit', limit);
            params.set('page', targetPage);
            if (sort) params.set('sort', sort);
            if (query) params.set('query', query);
            return `/api/products?${params.toString()}`;
        };

        res.json({
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
            nextLink: result.hasNextPage ? buildLink(result.nextPage) : null
        });
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Error al obtener los productos' });
    }
});

// GET /api/products/:pid - Obtener producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.getProductById(pid);
        res.json(product);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// POST /api/products - Agregar nuevo producto (SOLO ADMIN)
router.post('/', adminOnly, async (req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;
        const newProduct = await productManager.addProduct({
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        });
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/products/:pid - Actualizar producto (SOLO ADMIN)
router.put('/:pid', adminOnly, async (req, res) => {
    try {
        const { pid } = req.params;
        const updatedProduct = await productManager.updateProduct(pid, req.body);
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/products/:pid - Eliminar producto (SOLO ADMIN)
router.delete('/:pid', adminOnly, async (req, res) => {
    try {
        const { pid } = req.params;
        const deletedProduct = await productManager.deleteProduct(pid);
        res.json({ message: 'Producto eliminado correctamente', product: deletedProduct });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

module.exports = router;
