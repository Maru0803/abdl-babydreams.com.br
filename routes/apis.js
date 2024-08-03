const router = require('express').Router();
const database = require("../utils/functions/database.js");
const produtos = require('../utils/jsons/produtos.json')
const verifyGift = require("../utils/functions/verifygift.js")
const verifyShipping = require("../utils/functions/verifyshipping.js");
const verifyProportions = require("../utils/functions/verifyproportions.js");
const clearUserCart = require("../utils/functions/clearusercart.js")
const updateCartDatabase = require("../utils/functions/updatecartdatabase.js")
const verifyCartEquals = require("../utils/functions/verifycartequals.js")
const verifyStock = require("../utils/functions/verifystock.js")
const saveOrder = require("../utils/functions/saveorder.js")
require('dotenv').config();

function isAuthorized(req, res, next) {
    if (req.user) {
        console.log("[LOGIN]: Logado.");
        next();
    } else {
        console.log("[LOGIN]: Não Logado");
        res.redirect('/auth/auth');
    }
} 

router.get('/getdatabasestock', async (req, res) => {
    var stock = await database.ref("stock").once("value")
    res.json(stock.val());
});

router.get('/getproducts', async (req, res) => {
    res.json({ produtos: produtos });
})

router.get('/public', isAuthorized, async (req, res) => {
    res.send({
        publishableKey: process.env.PublicKey,
    });
});

router.get('/secret', isAuthorized, async (req, res) => {
    var ref = await database.ref(`login/${req.user.sub}`).once("value")
    var secret = ref.val().secret
    res.send({
        clientSecret: secret,
    });
});

router.get('/verifygift', async (req, res) => {
    var gift = req.query.gift;
    verifyGift(req, res, gift);
});

router.get('/verifyshippingcart', async (req, res) => {
    var cep = req.query.cep;
    var cartItens = JSON.parse(req.query.cart);
    if(req.user) database.ref(`cart/${req.user.sub}`).set(cartItens)
    var data = await verifyProportions(cartItens);
    verifyShipping(res, cep, data);
});

router.get('/verifytopayment', async (req, res) => {
    try {
        var frete = JSON.parse(req.query.frete);
        var cupom = req.query.cupom;
        var total = req.query.total;
        var cartItens = JSON.parse(req.query.cart);

        var stockDisponible = await verifyStock(cartItens)
        
        if(!stockDisponible) {
            clearUserCart(req.user.sub, "itens")
            return res.json({ status: "error", message: "outstock"})
        } 
        var equals = await verifyCartEquals(req.user.sub, cartItens)
        if(!equals) return res.json({ status: "error", message: "shipping value"})

        updateCartDatabase(req.user.sub, cartItens, cupom, total, frete)
        res.json({status: "success"})
    } catch (error) {
        console.error(error);
        return res.json({ status: "intern error", message: "Erro interno" });
    }
});


router.get('/verifycartdata', isAuthorized, async (req, res) => {
    try {
        var list = [ 
            "babyusagi", "chupeta1", "chupeta2",
            "chupeta3", "fantasma", "huggies", "junior", 
            "pastelpuffies", "ups", "animais"
        ]

        var cart = await database.ref(`cart/${req.user.sub}`).once("value")
        var cartItems = {}
        Object.entries(cart.val()).forEach(([a, b]) => {
            if(list.includes(a)) cartItems[a] = b
        })
        var stockDisponible = await verifyStock(cartItems)
        if(!stockDisponible) {
            clearUserCart(req.user.sub, "itens")
            return res.json({ status: "error", message: "outstock"})
        } 
        return res.json({
            status: "success",
            cart: cartItems,
            info: cart.val()
        })
    } catch (error) {
        console.error(error);
        return res.json({ status: "intern error", message: "Erro interno" });
    }
});

router.get('/saveorder', isAuthorized, async (req, res) => {
    let id = req.query.dataid
    await saveOrder(req, res, id)
});

router.get('/getdataorder', isAuthorized, async (req, res) => {
    try {
            let id = req.query.id
        var list = [ 
            "babyusagi", "chupeta1", "chupeta2",
            "chupeta3", "fantasma", "huggies", "junior", 
            "pastelpuffies", "ups", "animais"
        ]
        var orderdata = await database.ref(`orders/${id}`).once("value")
        var cartItems = {}
        Object.entries(orderdata.val()).forEach(([a, b]) => {
            if(list.includes(a)) cartItems[a] = b
        })
        res.json({ produtos: produtos, cart: cartItems });
    } catch (error) {
        console.error(error);
        return res.json({ status: "intern error", message: "Erro interno" });
    }
});




module.exports = router;
