const produtos = require("./utils/jsons/produtos.json")
const promove = require("./utils/jsons/promove.json")
const database = require("./utils/functions/database.js");
const { InitApp, InitRoutes } = require("./routes.js");
require('./utils/functions/strategies.js');
const passport = require("passport")
const express = require("express")
const app = express()

InitApp(app, express);
app.use(passport.initialize());
app.use(passport.session());

app.get('/', async (req, res) => {
    var ref = await database.ref("stock").once("value")
    var stock = ref.val()
    res.render('home', {
        loged: req.user ? true : false,
        products: produtos,
        stock: stock,
        conteudo: promove
    })
});

InitRoutes(app);

app.listen(3000, () => {
    console.log('Online')
});

/*
dashboard para atualizar status de pedidos
atualizar as medidas dos produtos
fazer funcao para reduzir o stock na api sucess
*/