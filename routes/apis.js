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
const NodeMailer = require("nodemailer")

const transport = NodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "contato.babydreamsabdlstore@gmail.com",
        pass: process.env.access    
    }
})

async function send(user, order, message, status) {
    await transport.sendMail({
        from: "BabyDreams ABDL <contato.babydreamsabdlstore@gmail.com>",
        to: user,
        subject: `Temos novidades sobre seu pedido #${order} - ${status}`,
        html: `<body style="background-color: #E6E6FA; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
        <div style="border: 10px solid #E6E6FA; padding: 20px; background-color: white; border-radius: 15px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.2); position: relative;">
        <img src="https://i.imgur.com/EZIoltq.png" alt="logo" style="width: 100%; border-radius: 10px;">
        <h1 style="text-align: center; color: #4B0082;">Baby Dreams Store</h1>
        <p style="text-align: justify; color: #333;">
            Status: ${status} ${message}
        </p>
        <p style="text-align: justify; color: #333;">
            Temos uma atualização do seu pedido, verique agora clicando no botao abaixo: 
        </p>
         <p style="text-align: center; margin-top: 20px;">
            <a href="https://www.abdl-babydreams.com.br/orders" style="background-color: #800080; color: white; padding: 10px 20px; text-decoration: none; border-radius: 25px; display: inline-block;">Verificar no site</a>
        </p>
        </div></body>`,
        text: `Temos uma atualização do seu pedido, verique agora por esse link: https://www.abdl-babydreams.com.br/orders`
    })
}

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
            "pastelpuffies", "ups", "animais",
            "huggies2", "junior2", "ups2", "goodnites2",
            "goodnites", "littleking", "bunnyhopps"
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
            "pastelpuffies", "ups", "animais",
            "huggies2", "junior2", "ups2", "goodnites2",
            "goodnites", "littleking", "bunnyhopps"
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

router.get("/sendstatus", async (req, res) => {
    try { 
        var rastreio = req.query.rastreio
        var status = req.query.status
        var order = req.query.order
        var id = req.query.id

        var messages = [
            "o pedido esta sendo embalado para envio!",
            "o pedido ja foi preparado e assim que disponivel sera realizado o envio!",
            "o pedido foi enviado, verifique o rastreio no site dos correios!",
            "o pedido foi finalizado",
            "o pedido foi cancelado por motivos internos, o reembolso ja foi solicitado, entre em contato para caso tenha mais duvidas."
        ]
        var types = ["preparando", "pronto para envio", "enviado", "concluido", "cancelado"]
        var user = await database.ref(`login/${id}`).once("value")
        var obj = { message: messages[status-1], status: types[status-1] }

        if(status === 3) obj.rastreio = rastreio;
        database.ref(`userorders/${id}/${order}`).update(obj)
        database.ref(`orders/${order}`).update(obj)
        try {
            await send(user.val().email, order, messages[status-1], types[status-1])
        } catch(err) {
            console.log(err)
        }

        res.json({ status: "sucess", message: "sucess" });
    } catch (error) {
        console.error(error);
        return res.json({ status: "intern error", message: "Erro interno" });
    }
});
  
module.exports = router;
