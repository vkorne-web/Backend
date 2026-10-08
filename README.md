# Backend - API de Ecommerce (MongoDB) + WebSockets + Auth JWT + Arquitectura por Capas

Servidor Node.js + Express para la gestion de productos, carritos, usuarios y compras de una tienda. Incluye **persistencia con MongoDB (Mongoose)**, **autenticacion y autorizacion con Passport + JWT**, **patron Repository (DAO/DTO)**, **sistema de recuperacion de contrasena por email** y **logica de compra con generacion de tickets**.

## Tecnologias

- **Express** - Framework web
- **MongoDB + Mongoose** - Persistencia principal
- **mongoose-paginate-v2** - Paginacion de productos
- **Express-Handlebars** - Motor de plantillas
- **Socket.io** - Comunicacion en tiempo real
- **Passport + passport-local / passport-jwt** - Estrategias de autenticacion
- **jsonwebtoken** - Tokens JWT (sesion y recuperacion de contrasena)
- **bcrypt** - Encriptacion de contrasenas
- **nodemailer** - Envio de correos (recuperacion de contrasena)
- **cookie-parser** - Manejo de cookies (guarda el token de sesion)
- **dotenv** - Variables de entorno

## Arquitectura por capas (DAO + Repository + DTO)

La logica de negocio NO accede directamente a la base de datos: lo hace a traves de Repositories, que envuelven DAOs. Los DTO controlan que se expone al cliente.

```
routes / middleware  ->  managers / services (negocio)  ->  repository  ->  dao  ->  dao/models
```

- **dao/models/**: esquemas de Mongoose (`product`, `cart`, `user`, `ticket`).
- **dao/mongo/**: Data Access Objects (acceso a la base por entidad).
- **repository/**: capa intermedia que consume los DAO.
- **dto/**: Data Transfer Objects (ej. `UserDTO`: solo datos no sensibles).
- **managers/ y services/**: logica de negocio (usan los repositories).

## Instalacion

```bash
npm install
```

## Configuracion (.env)

Crear un archivo `.env` en la raiz del proyecto:

```
PORT=8080
MONGO_URL=mongodb+srv://USUARIO:PASSWORD@CLUSTER.mongodb.net/ecommerce?retryWrites=true&w=majority

# Sesion / tokens
JWT_SECRET=tu_clave_secreta_para_tokens_de_sesion
JWT_RESET_SECRET=tu_clave_secreta_para_recuperacion

# Mailing (recuperacion de contrasena)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_correo@gmail.com
MAIL_PASS=tu_app_password
MAIL_FROM="Ecommerce <no-reply@ecommerce.com>"
```

## Carga de datos de prueba

```bash
npm run seed        # 24 productos
npm run seed:users  # usuarios de prueba (admin y user)
```

Usuarios de prueba creados por `seed:users`:

| Email | Password | Rol |
|-------|----------|-----|
| admin@test.com | admin123 | admin |
| user@test.com | user123 | user |

## Ejecucion

```bash
npm start
```

El servidor se levanta en `http://localhost:8080`.

## Roles y autorizacion

| Accion | Rol requerido |
|--------|---------------|
| Ver productos (GET) | Publico |
| Crear / Actualizar / Eliminar productos | **admin** |
| Agregar productos al carrito / Finalizar compra | **user** |
| CRUD de usuarios y ver tickets | **admin** |

La autenticacion se hace con la estrategia **current** (JWT) y la autorizacion con el middleware `authorization('rol')`, que se ejecuta despues de `current`.

## Endpoints de API

### Sesiones / Autenticacion (`/api/sessions`)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/sessions/register` | Registra un usuario (password con bcrypt + carrito propio) |
| POST | `/api/sessions/login` | Autentica y genera el token JWT (cookie `token`) |
| GET | `/api/sessions/current` | (JWT) Devuelve un **DTO** con datos NO sensibles del usuario |
| GET | `/api/sessions/logout` | Limpia la cookie del token |
| POST | `/api/sessions/forgot-password` | Envia un correo con boton para restablecer (expira en 1h) |
| POST | `/api/sessions/reset-password/:token` | Restablece la contrasena (no puede ser igual a la anterior) |

#### POST /api/sessions/forgot-password

```json
{ "email": "user@test.com" }
```

#### POST /api/sessions/reset-password/:token

```json
{ "password": "nuevaClave123" }
```

### Productos (`/api/products`)

| Metodo | Ruta | Rol | Descripcion |
|--------|------|-----|-------------|
| GET | `/api/products` | Publico | Lista con paginacion, filtros y orden |
| GET | `/api/products/:pid` | Publico | Obtiene un producto por ID |
| POST | `/api/products` | admin | Crea un producto |
| PUT | `/api/products/:pid` | admin | Actualiza un producto |
| DELETE | `/api/products/:pid` | admin | Elimina un producto |

Query params de `GET /api/products`: `limit` (10), `page` (1), `sort` (`asc`/`desc`), `query` (`category:Ropa` o `status:true`).

### Carritos (`/api/carts`)

| Metodo | Ruta | Rol | Descripcion |
|--------|------|-----|-------------|
| POST | `/api/carts` | Publico | Crea un carrito |
| GET | `/api/carts/:cid` | Publico | Lista los productos del carrito (populate) |
| POST | `/api/carts/:cid/products/:pid` | user | Agrega un producto al carrito |
| POST | `/api/carts/:cid/purchase` | user | **Finaliza la compra y genera el ticket** |
| PUT | `/api/carts/:cid` | Publico | Reemplaza todos los productos |
| PUT | `/api/carts/:cid/products/:pid` | Publico | Actualiza la cantidad de un producto |
| DELETE | `/api/carts/:cid/products/:pid` | Publico | Elimina un producto del carrito |
| DELETE | `/api/carts/:cid` | Publico | Vacia el carrito |

### Tickets (`/api/tickets`)

| Metodo | Ruta | Rol | Descripcion |
|--------|------|-----|-------------|
| GET | `/api/tickets` | admin | Lista todos los tickets |
| GET | `/api/tickets/:tid` | admin | Obtiene un ticket por ID |

### Usuarios (`/api/users`) - CRUD

| Metodo | Ruta | Rol | Descripcion |
|--------|------|-----|-------------|
| GET | `/api/users` | admin | Lista usuarios (sin password) |
| GET | `/api/users/:uid` | admin | Obtiene un usuario |
| POST | `/api/users` | admin | Crea un usuario |
| PUT | `/api/users/:uid` | admin | Actualiza un usuario |
| DELETE | `/api/users/:uid` | admin | Elimina un usuario |

## Logica de compra y tickets

`POST /api/carts/:cid/purchase`:

1. Verifica el **stock** de cada producto del carrito.
2. Si hay stock: descuenta unidades y suma al total.
3. Si no hay stock: el producto **no** se procesa y queda en el carrito.
4. Si al menos un producto se proceso, genera un **Ticket** con:
   - `code` (unico), `purchase_datetime`, `amount` (total), `purchaser` (email del usuario).
5. El carrito queda solo con los productos no procesados.
6. Devuelve el ticket y la lista de productos no procesados (compra completa o parcial).

## Modelos

- **products**: `title, description, code (unico), price, status, stock, category, thumbnails` (+ paginate).
- **carts**: `products: [{ product: ObjectId ref products, quantity }]`.
- **users**: `first_name, last_name, email (unico), age, password (hash), cart (ref carts), role`.
- **tickets**: `code (unico), purchase_datetime, amount, purchaser`.

## Estructura del proyecto

```
Backend/
├── src/
│   ├── app.js                    # Servidor Express + Socket.io + middlewares
│   ├── seed.js                   # Productos de prueba
│   ├── seedUsers.js              # Usuarios de prueba (admin y user)
│   ├── config/
│   │   ├── db.js
│   │   └── passport.config.js    # Estrategias register, login y current (JWT)
│   ├── dao/
│   │   ├── models/               # Esquemas Mongoose (product, cart, user, ticket)
│   │   └── mongo/                # DAO por entidad
│   ├── repository/               # Repositories (envuelven los DAO)
│   ├── dto/                      # Data Transfer Objects (UserDTO)
│   ├── middlewares/              # authorization(rol)
│   ├── managers/                 # Logica de negocio (usan repositories)
│   ├── services/                 # auth.service, cart.service (compras)
│   ├── routes/                   # Routers de la API
│   ├── utils/                    # password, jwt, mailing, ticket
│   └── ...
```
