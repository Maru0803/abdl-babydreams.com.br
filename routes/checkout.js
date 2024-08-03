const router = require('express').Router();

function isAuthorized(req, res, next) {
    if (req.user) {
        console.log("[LOGIN]: Logado.");
        next();
    } else {
        console.log("[LOGIN]: Não Logado");
        res.redirect('/auth/checkout');
    }
} 

router.get('/', isAuthorized, async (req, res) => {
    res.render('checkout', { loged: true });
});

module.exports = router;