const database = require("./database.js");

async function clearUserCart (user, type) {
    var obj = {
        "babyusagi": 0,
        "chupeta1": 0,
        "chupeta2": 0,
        "chupeta3": 0,
        "fantasma": 0,
        "huggies": 0,
        "junior": 0,
        "pastelpuffies": 0,
        "ups": 0,
        "ursinho": 0
    }

    if(type === "itens") database.ref(`cart/${user}`).update(obj)
    else if(type === "total") database.ref(`cart/${user}`).remove()
}

module.exports = clearUserCart