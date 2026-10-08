const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const userRepository = require("../repository/user.repository");
const cartRepository = require("../repository/cart.repository");
const { createHash, isValidPassword } = require("../utils/password.utils");

// Clave secreta para firmar/verificar JWT. Puede venir de .env.
const secretKey = process.env.JWT_SECRET || "s3cr3t_c0derhouse_key";

// Estrategia de REGISTRO: crea un usuario si no existe, asociandole un carrito vacio.
passport.use(
    "register",
    new LocalStrategy(
        {
            usernameField: "email",
            passReqToCallback: true
        },
        async (req, email, password, done) => {
            try {
                const { first_name, last_name, age, role } = req.body;

                if (!first_name || !last_name || !age) {
                    return done(null, false, { message: "Faltan campos obligatorios" });
                }

                const exists = await userRepository.getByEmail(email);
                if (exists) {
                    return done(null, false, { message: "El email ya esta registrado" });
                }

                // Cada usuario nuevo recibe su propio carrito vacio.
                const cart = await cartRepository.create();

                const user = await userRepository.create({
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password),
                    cart: cart._id,
                    role: role || "user"
                });

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

// Estrategia de LOGIN: valida email y password contra la base de datos.
passport.use(
    "login",
    new LocalStrategy(
        {
            usernameField: "email"
        },
        async (email, password, done) => {
            try {
                const user = await userRepository.getByEmail(email);
                if (!user) {
                    return done(null, false, { message: "Credenciales invalidas" });
                }
                if (!isValidPassword(password, user.password)) {
                    return done(null, false, { message: "Credenciales invalidas" });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

// Extractor de JWT: primero desde la cookie "token", luego desde el header Authorization.
const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies["token"];
    }
    return token;
};

// Estrategia "current": valida el token y carga el usuario real desde la base.
// Devuelve el usuario (no solo el payload) para poder aplicar autorizacion por rol.
passport.use(
    "current",
    new JwtStrategy(
        {
            secretOrKey: secretKey,
            jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeaderAsBearerToken()])
        },
        async (payload, done) => {
            try {
                if (!payload || !payload.id) {
                    return done(null, false, { message: "Token invalido" });
                }

                const user = await userRepository.getById(payload.id);
                if (!user) {
                    return done(null, false, { message: "Usuario no encontrado" });
                }

                // Devolvemos el usuario completo (sin password) para autorizacion por rol.
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

module.exports = passport;
