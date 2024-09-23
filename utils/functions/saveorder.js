const database = require("./database.js");
const clearUserCart = require("./clearusercart.js")

async function saveOrder(req, res, id) {
    try { 
        var list = [ 
            "babyusagi", "chupeta1", "chupeta2",
            "chupeta3", "fantasma", "huggies", "junior", 
            "pastelpuffies", "ups", "animais",
            "huggies2", "junior2", "ups2", "goodnites2",
            "goodnites", "littleking", "bunnyhopps"
        ];
        
        var cart = await database.ref(`cart/${req.user.sub}`).once("value")
        var cartItems = {}
        var stock = await database.ref(`stock`).once("value")
        Object.entries(cart.val()).forEach(([a, b]) => {
            if(list.includes(a)) {
                cartItems[a] = b
                database.ref(`stock`).update({[a]: stock.val()[a] - b})
            }
        })

        var numOrder = await database.ref(`num`).once("value")
        if(cart.val().cupom && cart.val().cupom !== "null") {
            var list = await database.ref(`useds/${req.user.sub}`).once("value")
            if(list.val() === null) database.ref(`useds/${req.user.sub}`).set({ [cart.val().cupom]: true})
            else database.ref(`useds/${req.user.sub}`).update({ [cart.val().cupom]: true})
        }

        var obj = {...cart.val(), userid: req.user.sub, orderid: id, rastreio: false, status: "preparando", message: "aguardando envio do produto"}
        database.ref(`userorders/${req.user.sub}/${numOrder.val().num}`).set(obj)
        database.ref(`orders/${numOrder.val().num}`).set(obj)
        database.ref(`num`).set({ num: numOrder.val().num + 1 })
        clearUserCart(req.user.sub, "total")
        return res.json({ status: "success", cart: cartItems, info: {...cart.val(), orderid: numOrder.val().num }})
    } catch (error) {
        console.error(error);
        return res.json({ status: "error", message: "Erro interno" });
    }
}

module.exports = saveOrder;
