const database = require("./database.js");

async function clearUserCart (user, type) {
    var obj = {
        "babyusagi": 0,
        "chupeta1": 0,
        "chupeta2": 0,
        "chupeta3": 0,
        "chupeta4": 0,
        "fantasma": 0,
        "animais": 0,
        "huggies": 0,
        "junior": 0,
        "ups": 0,
        "goodnites": 0,
        "huggies2": 0,
        "junior2": 0,
        "ups2": 0,
        "goodnites2": 0,
        "pastelpuffies": 0,
        "bunnyhopps": 0,
        "littleking": 0,
        "pants1"; 0, 
        "pants2": 0, 
        "pants3": 0, 
        "coala": 0,
        "unicornio": 0, 
        "furry": 0,
        "princess": 0
    }

    if(type === "itens") database.ref(`cart/${user}`).update(obj)
    else if(type === "total") database.ref(`cart/${user}`).remove()
}

module.exports = clearUserCart
