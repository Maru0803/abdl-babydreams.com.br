const router = require('express').Router();
const promove = require('../utils/jsons/promove.json')
        
router.get('/', async (req, res) => {
    res.render('privacity', {
        conteudo: promove,
        loged: req.user ? true : false,
    })
});

module.exports = router;
