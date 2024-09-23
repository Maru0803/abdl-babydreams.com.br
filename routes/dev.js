const router = require('express').Router();
const database = require("../utils/functions/database.js");

function isAuthorized(req, res, next) {
    if (req.user && req.user.sub === process.env.ID) {
        console.log("[LOGIN]: Logado.");
        next();
    } else {
        console.log("[LOGIN]: Não Logado");
        res.redirect('/auth/orders');
    }
} 
   
router.get("/", isAuthorized, async (req, res) => {
    try {
        var ref = await database.ref(`orders`).once("value")
        var orders = ref.val()
        res.render("dev", {
            dataorders: orders,
            loged: false 
        })
    } catch (error) {
        console.error(error);
        res.json({ status: "error", message: "Erro ao carregar os pedidos" });
    }
    
})

router.get("/:orderId", isAuthorized, async (req, res) => {    
    try {
        const orderId = req.params.orderId;
        var ref = await database.ref(`orders/${orderId}`).once("value");
        var orderInfo = ref.val();

        if (orderInfo) {
            res.render("devinfo", {
                order: orderId,
                info: orderInfo,
                loged: false
            });
        } else {
            res.redirect("/dev/orders/dashboard")
        }
    } catch (error) {
        console.error(error);
        res.json({ status: "error", message: "Erro ao carregar informações do pedido" });
    } 
});

module.exports = router;
