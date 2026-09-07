const bcrypt = require("bcrypt");

// Encripta la password usando bcrypt.hashSync con 10 rondas de salt.
const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

// Compara una password en texto plano contra el hash almacenado.
const isValidPassword = (password, hashedPassword) => bcrypt.compareSync(password, hashedPassword);

module.exports = { createHash, isValidPassword };
