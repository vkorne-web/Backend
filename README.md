# Backend - API de Ecommerce (MongoDB) + WebSockets + Autenticacion JWT

Servidor Node.js + Express con Handlebars y Socket.io para la gestion de productos, carritos y usuarios de una tienda. **Persistencia con MongoDB (Mongoose)**, consultas de productos con paginacion, filtros y ordenamiento, gestion de carrito con referencias y `populate`, y un sistema completo de **registro, login y sesiones protegidas con Passport + JWT**.

## Tecnologias

- **Express** - Framework web
- **MongoDB + Mongoose** - Persistencia principal
- **mongoose-paginate-v2** - Paginacion de productos
- **Express-Handlebars** - Motor de plantillas
- **Socket.io** - Comunicacion en tiempo real
- **Passport + passport-local / passport-jwt** - Estrategias de autenticacion y autorizacion
- **jsonwebtoken** - Generacion y validacion de tokens JWT
- **bcrypt** - Encriptacion de contraseñas
- **cookie-parser** - Manejo de cookies (guarda el token)
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
JWT_SECRET=tu_clave_secreta_para_firmar_tokens
```

- Reemplazar `MONGO_URL` por tu cadena de conexion de MongoDB Atlas.
- `JWT_SECRET` es la clave con la que se firman/verifican los tokens. Debe mantenerse privada y no subirse a GitHub.

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

### Sesiones / Autenticacion (`/api/sessions`)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/sessions/register` | Registra un nuevo usuario (contraseña encriptada con bcrypt y carrito propio) |
| POST | `/api/sessions/login` | Autentica al usuario y devuelve/genera un token JWT (se guarda en cookie `token`) |
| GET | `/api/sessions/current` | (Protegida) Valida el token JWT con la estrategia "current" y devuelve los datos del usuario |
| GET | `/api/sessions/logout` | Cierra la sesion y limpia la cookie del token |

#### POST /api/sessions/register

Body:

```json
{
  "first_name": "Juan",
  "last_name": "Perez",
  "email": "juan@test.com",
  "age": 30,
  "password": "secret123"
}
```

#### POST /api/sessions/login

Body:

```json
{ "email": "juan@test.com", "password": "secret123" }
```

Respuesta: devuelve el `token` JWT y lo deja disponible en la cookie `token` para las rutas protegidas.

#### GET /api/sessions/current

Debe enviarse el JWT (via cookie `token` o header `Authorization: Bearer <token>`). Devuelve los datos del usuario asociados al token:

```json
{
  "status": "success",
  "payload": {
    "id": "...",
    "first_name": "Juan",
    "last_name": "Perez",
    "email": "juan@test.com",
    "role": "user"
  }
}
```

### Usuarios (`/api/users`) - CRUD

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/users` | Lista todos los usuarios (sin contraseña) |
| GET | `/api/users/:uid` | Obtiene un usuario por ID |
| POST | `/api/users` | Crea un usuario (encripta la contraseña y le asigna un carrito) |
| PUT | `/api/users/:uid` | Actualiza un usuario (si se envia `password`, se vuelve a encriptar) |
| DELETE | `/api/users/:uid` | Elimina un usuario |

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
- **carts**: `products: [{ product: ObjectId ref products, quantity }]`. El `product` es una **referencia** al modelo de productos; `GET /api/carts/:cid` los trae completos mediante `populate`.
- **users**: `first_name, last_name, email (unico), age, password (hash bcrypt), cart (ObjectId ref carts), role (default 'user')`.

## Estrategias de Passport

- **register** (`passport-local`): valida campos y crea el usuario encriptando su contraseña y asignandole un carrito.
- **login** (`passport-local`): valida email + contraseña contra la base de datos.
- **current** (`passport-jwt`): verifica el token JWT (cookie `token` o header Bearer) y expone los datos del usuario logueado.

## Estructura del proyecto

```
Backend/
├── src/
│   ├── app.js                    # Servidor Express + Socket.io + Middlewares (cookie, passport)
│   ├── seed.js                   # Carga de productos de prueba
│   ├── config/
│   │   ├── db.js                 # Conexion a MongoDB
│   │   └── passport.config.js    # Estrategias register, login y current (JWT)
│   ├── utils/
│   │   ├── password.utils.js     # Encriptacion/validacion con bcrypt
│   │   └── jwt.utils.js          # Firmar y verificar tokens JWT
│   ├── models/
│   │   ├── product.model.js      # Schema de productos (+ paginate)
│   │   ├── cart.model.js         # Schema de carritos (ref a products)
│   │   └── user.model.js         # Schema de usuarios (ref a carts)
│   ├── managers/
│   │   ├── ProductManager.js     # Logica de productos sobre Mongoose
│   │   ├── CartManager.js        # Logica de carritos sobre Mongoose
│   │   └── UserManager.js        # CRUD de usuarios + hashing
│   ├── routes/
│   │   ├── products.router.js
│   │   ├── carts.router.js
│   │   ├── sessions.router.js    # register / login / current / logout
│   │   ├── users.router.js       # CRUD de usuarios
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
