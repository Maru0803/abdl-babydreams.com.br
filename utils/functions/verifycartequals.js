const database = require("./database.js");
const produtos = [ 
    "babyusagi", "chupeta1", "chupeta2",
    "chupeta3", "fantasma", "huggies", "junior", 
    "pastelpuffies", "ups", "ursinho"
]

async function verifyCartEquals (user, cart) {
    var userCart = await database.ref(`cart/${user}`).once("value");
    var data = userCart.val();
    var equals = true;
    produtos.forEach((p) => {
        let cartitem = !cart[p] ? 0 : cart[p]
        let dataitem = !data[p] ? 0 : data[p]
        if(cartitem !== dataitem) equals = false
    });

    return equals;
}

module.exports = verifyCartEquals
