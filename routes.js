const path = require("path")
var session = require('cookie-session');

function InitApp(app, express) {
    app.use(express.json());
    app.use(session({
        secret: 'random',
        cookie: {
            maxAge: 60000 * 60 * 24,
        },
        saveUninitialized: false,
        resave: false,
        name: 'Baby Dreams Store',
    }));
    
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static(path.join(__dirname + '/public')));

    app.use((req, res, next) => {
        const origin = req.get('host');
        if (origin === 'www.abdl-babydreams.com.br') {
            next();
        } else {
            res.status(200).send('Acesso Negado');
        }
    });
}

function InitRoutes(app) {
    const infoRoute = require('./routes/details');
    const authRoute = require('./routes/auth');
    const checkoutRoute = require('./routes/checkout');
    const produtosRoute = require('./routes/produtos');
    const payRoute = require('./routes/payment');
    const apisRoute = require('./routes/apis');
    const PrivacityRoute = require('./routes/privacity');
    const ordersRoute = require('./routes/orders');

    app.use('/auth', authRoute)
    app.use('/info', infoRoute)
    app.use('/checkout', checkoutRoute)
    app.use('/lister', produtosRoute)
    app.use('/payment', payRoute)
    app.use('/apis', apisRoute)
    app.use('/privacity', PrivacityRoute)
    app.use('/orders', ordersRoute)

    app.get("*", (req, res) => {
        res.redirect("/")
    });
}

module.exports = { InitApp, InitRoutes }
