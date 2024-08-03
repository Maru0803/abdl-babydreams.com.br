const database = require("./database.js");

async function updateCartDatabase (user, cart, cupom, total, frete) {
    var gifts = await database.ref(`gifts`).once("value")
    var list = gifts.val()
    
    var obj =  {
        ...cart,
        cupom: cupom,
        desconto: list[cupom] ? list[cupom] : "null",
        total: total,
        type: frete.type,
        value: frete.value,
        ...frete.address
    }
   
    database.ref(`cart/${user}`).set(obj)
}

module.exports = updateCartDatabase
