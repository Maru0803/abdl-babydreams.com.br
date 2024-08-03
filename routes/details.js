const router = require('express').Router();
const produtos = require('../utils/jsons/produtos.json')
const promove = require('../utils/jsons/promove.json')
 
Object.entries(produtos).forEach(([a, b]) => {
    router.get("/" + b.name, (req, res) => {
        res.render("details", {
            name: a,
            data: b,
            conteudo: promove,
            loged: req.user ? true : false
        })
    });
})

module.exports = router;
