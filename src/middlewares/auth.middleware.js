// Middleware de autorizacion por roles.
// Se usa DESPUES de passport.authenticate("current"), que deja el usuario en req.user.
//
//   router.post("/", passport.authenticate("current", { session: false }), authorization("admin"), handler)
//
// Recibe uno o varios roles permitidos y rechaza el acceso si el usuario no tiene ninguno.
const authorization = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ status: "error", error: "No autenticado" });
        }
        if (allowedRoles.length === 0) {
            return next();
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: "error",
                error: `Acceso denegado. Se requiere rol: ${allowedRoles.join(", ")}`
            });
        }
        next();
    };
};

module.exports = { authorization };
