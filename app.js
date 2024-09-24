const produtos = require("./utils/jsons/produtos.json")
const promove = require("./utils/jsons/promove.json")
const database = require("./utils/functions/database.js");
require('./utils/functions/strategies.js');
const passport = require("passport")
const express = require("express")
const path = require("path")
const session = require("express-session")
const app = express()
const MemoryStore = require('memorystore')(session)

app.use(express.json());
app.use(session({
    secret: 'random',
    cookie: { 
        maxAge: 86400000,
        secure: true
    },
    store: new MemoryStore({
      checkPeriod: 86400000 
    }),
    saveUninitialized: false,
    resave: false,
    name: 'Baby Dreams Store',
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname + '/public')));

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    const origin = req.get('host');
    if (origin === 'localhost:3000') {
        next();
    } else {
        res.status(200).send('Acesso Negado');
    }
});

const infoRoute = require('./routes/details');
const authRoute = require('./routes/auth');
const checkoutRoute = require('./routes/checkout');
const produtosRoute = require('./routes/produtos');
const payRoute = require('./routes/payment');
const apisRoute = require('./routes/apis');
const PrivacityRoute = require('./routes/privacity');
const ordersRoute = require('./routes/orders');
const dashRoute = require('./routes/dev');

app.use('/auth', authRoute)
app.use('/info', infoRoute)
app.use('/checkout', checkoutRoute)
app.use('/lister', produtosRoute)
app.use('/payment', payRoute)
app.use('/apis', apisRoute)
app.use('/privacity', PrivacityRoute)
app.use('/orders', ordersRoute)
app.use('/dev/orders/dashboard', dashRoute)

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
app.get("*", (req, res) => {
    res.redirect("/")
});

app.listen(8080, () => {
    console.log('Online')
});




