const database = require("./database.js");

async function verifyStock (cart) {
    var stock = await database.ref("stock").once("value")
    var data = stock.val()
    var valid = true
    Object.entries(cart).forEach(([a, b]) => {
        if(data[a] < b) valid = false
    })
    return valid
}

module.exports = verifyStock
