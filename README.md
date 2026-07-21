# Backend - API de Productos y Carritos (MongoDB) + WebSockets

Servidor Node.js + Express con Handlebars y Socket.io para la gestion de productos y carritos de compra. **Persistencia con MongoDB (Mongoose)**, consultas de productos con paginacion, filtros y ordenamiento, y gestion de carrito con referencias y `populate`.

## Tecnologias

- **Express** - Framework web
- **MongoDB + Mongoose** - Persistencia principal
- **mongoose-paginate-v2** - Paginacion de productos
- **Express-Handlebars** - Motor de plantillas
- **Socket.io** - Comunicacion en tiempo real
- **dotenv** - Variables de entorno

## Instalacion

```bash
npm install
```

## Configuracion

Crear un archivo `.env` en la raiz del proyecto:

```
PORT=8080
MONGO_URL=mongodb+srv://USUARIO:PASSWORD@CLUSTER.mongodb.net/ecommerce?retryWrites=true&w=majority
```

Reemplazar `MONGO_URL` por tu cadena de conexion de MongoDB Atlas.

## Carga de datos de prueba (opcional)

```bash
npm run seed
```

Inserta 24 productos variados (distintas categorias, precios y disponibilidad) para probar paginacion, filtros y ordenamiento.

## Ejecucion

```bash
npm start
```

El servidor se levanta en `http://localhost:8080`.

## Endpoints de API

### Productos (`/api/products`)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/products` | Lista productos con paginacion, filtros y orden |
| GET | `/api/products/:pid` | Obtiene un producto por ID |
| POST | `/api/products` | Crea un nuevo producto |
| PUT | `/api/products/:pid` | Actualiza un producto |
| DELETE | `/api/products/:pid` | Elimina un producto |

#### GET /api/products - Query params

| Param | Default | Descripcion |
|-------|---------|-------------|
| `limit` | 10 | Cantidad de elementos por pagina |
| `page` | 1 | Pagina solicitada |
| `sort` | (ninguno) | `asc` / `desc` -> ordena por precio |
| `query` | (general) | Filtro. `category:Ropa` o `status:true`. Un texto suelto se interpreta como categoria |

Ejemplo: `/api/products?limit=5&page=2&sort=asc&query=category:Hogar`

Respuesta:

```json
{
  "status": "success",
  "payload": [ /* productos */ ],
  "totalPages": 3,
  "prevPage": 1,
  "nextPage": 3,
  "page": 2,
  "hasPrevPage": true,
  "hasNextPage": true,
  "prevLink": "/api/products?limit=5&page=1&sort=asc&query=category:Hogar",
  "nextLink": "/api/products?limit=5&page=3&sort=asc&query=category:Hogar"
}
```

### Carritos (`/api/carts`)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/carts` | Crea un nuevo carrito |
| GET | `/api/carts/:cid` | Lista los productos del carrito (con `populate`) |
| POST | `/api/carts/:cid/products/:pid` | Agrega un producto (incrementa quantity si ya existe) |
| PUT | `/api/carts/:cid` | Reemplaza todos los productos con un arreglo enviado en el body |
| PUT | `/api/carts/:cid/products/:pid` | Actualiza SOLO la cantidad (`quantity` en el body) |
| DELETE | `/api/carts/:cid/products/:pid` | Elimina un producto del carrito |
| DELETE | `/api/carts/:cid` | Vacia el carrito (elimina todos los productos) |

`PUT /api/carts/:cid` espera:

```json
{ "products": [ { "product": "<idProducto>", "quantity": 2 } ] }
```

## Vistas con Handlebars

| Ruta | Vista | Descripcion |
|------|-------|-------------|
| `/` | `home.handlebars` | Listado simple de productos |
| `/products` | `index.handlebars` | Listado con paginacion, filtros y boton "agregar al carrito" |
| `/products/:pid` | `productDetail.handlebars` | Detalle del producto con boton "agregar al carrito" |
| `/carts/:cid` | `cart.handlebars` | Productos de un carrito especifico (solo los suyos) |
| `/realtimeproducts` | `realTimeProducts.handlebars` | Listado en tiempo real via WebSocket |

## Modelos

- **products**: `title, description, code (unico), price, status, stock, category, thumbnails`. Usa el plugin `mongoose-paginate-v2`.
- **carts**: `products: [{ product: ObjectId ref 'products', quantity }]`. El `product` es una **referencia** al modelo de productos; `GET /api/carts/:cid` los trae completos mediante `populate`.

## Estructura del proyecto

```
Backend/
├── src/
│   ├── app.js                    # Servidor Express + Socket.io + conexion Mongo
│   ├── seed.js                   # Carga de productos de prueba
│   ├── config/
│   │   └── db.js                 # Conexion a MongoDB
│   ├── models/
│   │   ├── product.model.js      # Schema de productos (+ paginate)
│   │   └── cart.model.js         # Schema de carritos (ref a products)
│   ├── managers/
│   │   ├── ProductManager.js     # Logica de productos sobre Mongoose
│   │   └── CartManager.js        # Logica de carritos sobre Mongoose
│   ├── routes/
│   │   ├── products.router.js
│   │   ├── carts.router.js
│   │   └── views/
│   │       └── index.router.js
│   ├── views/
│   │   ├── layouts/main.handlebars
│   │   ├── home.handlebars
│   │   ├── index.handlebars
│   │   ├── productDetail.handlebars
│   │   ├── cart.handlebars
│   │   └── realTimeProducts.handlebars
│   └── public/
│       ├── css/styles.css
│       └── js/
│           ├── realtime.js
│           ├── addToCart.js
│           └── cart.js
├── .env
├── .gitignore
└── package.json
```
