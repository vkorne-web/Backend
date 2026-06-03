# Backend - API de Productos y Carritos

Servidor Node.js + Express para la gestión de productos y carritos de compra. Persistencia mediante archivos JSON.

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm start
```

El servidor se levanta en `http://localhost:8080`.

## Endpoints

### Productos (`/api/products`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Lista todos los productos |
| GET | `/api/products/:pid` | Obtiene un producto por ID |
| POST | `/api/products` | Crea un nuevo producto (ID autogenerado) |
| PUT | `/api/products/:pid` | Actualiza un producto (no modifica el ID) |
| DELETE | `/api/products/:pid` | Elimina un producto |

#### Ejemplo POST /api/products

```json
{
  "title": "Producto 1",
  "description": "Descripción del producto",
  "code": "ABC123",
  "price": 100,
  "stock": 10,
  "category": "Categoría A"
}
```

Campos opcionales: `status` (default: true), `thumbnails` (array de strings).

### Carritos (`/api/carts`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/carts` | Crea un nuevo carrito (ID autogenerado) |
| GET | `/api/carts/:cid` | Lista los productos del carrito |
| POST | `/api/carts/:cid/product/:pid` | Agrega un producto al carrito (incrementa quantity si ya existe) |

## Estructura del proyecto

```
?? Backend/
+-- ?? data/
¦   +-- products.json
¦   +-- carts.json
+-- ?? src/
¦   +-- app.js
¦   +-- ?? managers/
¦   ¦   +-- ProductManager.js
¦   ¦   +-- CartManager.js
¦   +-- ?? routes/
¦       +-- products.router.js
¦       +-- carts.router.js
+-- .gitignore
+-- package.json
```
