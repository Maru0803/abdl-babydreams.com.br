const router = require('express').Router();
const database = require("../utils/functions/database.js");

function isAuthorized(req, res, next) {
    if (req.user) {
        console.log("[LOGIN]: Logado.");
        next();
    } else {
        console.log("[LOGIN]: Não Logado");
        res.redirect('/auth/orders');
    }
} 

router.get("/", isAuthorized, async (req, res) => {
    try {
        var ref = await database.ref(`userorders/${req.user.sub}`).once("value")
        var orders = ref.val()
        res.render("orderslist", {
            orders: orders,
            loged: true 
        })
    } catch (error) {
        console.error(error);
        res.json({ status: "error", message: "Erro ao carregar os pedidos" });
    }
    
})

router.get("/:orderId", isAuthorized, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        var ref = await database.ref(`userorders/${req.user.sub}/${orderId}`).once("value");
        var orderInfo = ref.val();

        if (orderInfo) {
            res.render("orderinfo", {
                order: orderId,
                info: orderInfo,
                loged: true
            });
        } else {
            res.redirect("/orders")
        }
    } catch (error) {
        console.error(error);
        res.json({ status: "error", message: "Erro ao carregar informações do pedido" });
    }
});

module.exports = router;