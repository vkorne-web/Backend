// DTO de usuario: define SOLO la informacion NO sensible que se expone al cliente.
// Evita filtrar la password u otros campos internos.
class UserDTO {
    constructor(user) {
        this.id = user._id ? user._id.toString() : user.id;
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.email = user.email;
        this.age = user.age;
        this.role = user.role;
        this.cart = user.cart ? user.cart.toString() : null;
    }
}

module.exports = UserDTO;
