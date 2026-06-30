# Backend - API de Productos y Carritos + WebSockets

Servidor Node.js + Express con Handlebars y Socket.io para la gestion de productos y carritos de compra. Persistencia mediante archivos JSON e interfaz en tiempo real con WebSockets.

## Tecnologias

- **Express** - Framework web
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
```

## Ejecucion

```bash
npm start
```

El servidor se levanta en `http://localhost:8080`.

## Endpoints de API

### Productos (`/api/products`)

| Metodo | Ruta | Descripcion |
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
  "description": "Descripcion del producto",
  "code": "ABC123",
  "price": 100,
  "stock": 10,
  "category": "Categoria A"
}
```

Campos opcionales: `status` (default: true), `thumbnails` (array de strings).

### Carritos (`/api/carts`)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/carts` | Crea un nuevo carrito (ID autogenerado) |
| GET | `/api/carts/:cid` | Lista los productos del carrito |
| POST | `/api/carts/:cid/product/:pid` | Agrega un producto al carrito (incrementa quantity si ya existe) |

## Vistas con Handlebars

| Ruta | Vista | Descripcion |
|------|-------|-------------|
| `/` | `home.handlebars` | Listado de productos renderizado del lado servidor |
| `/realtimeproducts` | `realTimeProducts.handlebars` | Listado en tiempo real con formularios para agregar/eliminar productos via WebSocket |

## Funcionamiento de WebSockets

En la vista `/realtimeproducts`:

- Al **conectarse**, el servidor envia la lista actual de productos
- Al **agregar un producto** mediante el formulario, se emite un evento `addProduct` al servidor, que lo guarda y notifica a todos los clientes conectados
- Al **eliminar un producto** (por formulario o boton en la tarjeta), se emite `deleteProduct` al servidor, que lo elimina y notifica a todos los clientes
- La lista se actualiza automaticamente en todos los navegadores sin necesidad de recargar la pagina

## Estructura del proyecto

```
Backend/
├── data/
│   ├── products.json
│   └── carts.json
├── src/
│   ├── app.js                    # Servidor principal con Express + Socket.io
│   ├── managers/
│   │   ├── ProductManager.js     # CRUD de productos con archivo JSON
│   │   └── CartManager.js        # CRUD de carritos con archivo JSON
│   ├── routes/
│   │   ├── products.router.js    # Rutas de API para productos
│   │   ├── carts.router.js       # Rutas de API para carritos
│   │   └── views/
│   │       └── index.router.js   # Rutas de vistas (home, realtimeproducts)
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.handlebars   # Layout principal
│   │   ├── home.handlebars       # Vista home
│   │   └── realTimeProducts.handlebars  # Vista con WebSocket
│   └── public/
│       ├── css/
│       │   └── styles.css        # Estilos
│       └── js/
│           └── realtime.js       # Cliente Socket.io
├── .env
├── .gitignore
└── package.json
```
