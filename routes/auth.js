const router = require('express').Router();
const passport = require('passport');

router.get('/auth', passport.authenticate('home', {
    failureRedirect: '/',
    successRedirect: '/'
}));

router.get('/checkout', passport.authenticate('cart', {
    failureRedirect: '/',
    successRedirect: '/checkout'
}));


router.get('/orders', passport.authenticate('order', {
    failureRedirect: '/',
    successRedirect: '/orders'
}));

router.get('/logout', (req, res) => {
    if (req.user) {
        req.logout(function(err) {
            console.log(err)
        });
        console.log("[LOGOUT]: User desconectado")
        res.redirect('/');
    } else {
        console.log("[LOGOUT]: O user não estava logado para deslogar")
        res.redirect('/');
    }
});

module.exports = router;
