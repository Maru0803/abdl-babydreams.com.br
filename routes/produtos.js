const router = require('express').Router();
const Produtos = require('../utils/jsons/produtos.json')
const database = require("../utils/functions/database.js");
const promove = require('../utils/jsons/promove.json')
        
router.get("/", async (req, res) => {
    try {
        var ref = await database.ref("stock").once("value")
        var stock = ref.val()

        res.render("products", {
            products: Produtos,
            stock: stock,
            conteudo: promove,
            loged: req.user ? true : false
        })
    } catch (error) {
        console.error(error);
        res.json({ status: "error", message: "Erro ao carregar os produtos" });
    }
})

module.exports = router;
