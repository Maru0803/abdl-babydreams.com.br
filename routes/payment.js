const router = require('express').Router();
const database = require("../utils/functions/database.js");
const stripe = require("../utils/functions/stripe.js")
require('dotenv').config()

function isAuthorized(req, res, next) {
    if (req.user) {
        console.log("[LOGIN]: Logado.");
        next();
    } else {
        console.log("[LOGIN]: Não Logado");
        res.redirect('/auth/auth');
    }
} 

router.get('/', isAuthorized, async (req, res) => {
    try {
        if (req.headers.referer && req.headers.referer.endsWith("checkout")) {
            res.render('payment', {
                loged: true
            })
        } else {
        res.redirect("/checkout")
        }
    } catch (error) {
        console.error(error);
        res.json({ status: "error", message: "Erro ao carregar a pagina" });
    }

});

router.get("/success", isAuthorized, async (req, res) => {
    try {
        if (req.headers.referer && req.headers.referer.endsWith("payment")) {
            res.render('success', { loged: true });
        } else {
            res.redirect("/checkout")
        }
    } catch (error) {
        console.error(error);
        res.json({ status: "error", message: "Erro ao carregar a pagina" });
    }
});

router.get("/intent", isAuthorized, async (req, res) => {
    try {
        var getcart = await database.ref(`cart/${req.user.sub}`).once("value")
        const paymentIntent = await stripe.paymentIntents.create({
            currency: "BRL",
            amount: (getcart.val().total * 100),
            automatic_payment_methods: { enabled: true },
        });
        
        database.ref(`login/${req.user.sub}`).update({secret: paymentIntent.client_secret})
        res.send({
            clientSecret: "secret ok",
        });
    } catch (e) {
        console.log("[INTENT ERR]: " + e)
        return res.status(400).send({
            error: {
                message: e.message,
            },
        });
    }
});

module.exports = router;