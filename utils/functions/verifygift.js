const database = require("./database.js");

async function verifyGift (req, res, gift) {
    try {
        var gifts = await database.ref(`gifts`).once("value")
        var list = gifts.val()
        if(list[gift]) {
            if(req.user) {
                var user = await database.ref(`useds/${req.user.sub}`).once("value") 
                var data = user.val()
                if(!data[gift] || data[gift] === null || data[gift] === false) return res.json({status: "valid", value: list[gift], message: "cupom aplicado com sucesso"})
                else return res.json({ status: "used", message: "cupom ja utilizado"})
            } else {
                return res.json({status: "valid", value: list[gift], message: "cupom aplicado com sucesso"})
            }
        } else {
            return res.json({ status: "invalid", message: "cupom invalido" })
        }   
    } catch (error) {
        console.error(error);
        return res.json({ status: "invalid", message: "cupom invalido" })
    }
}

module.exports = verifyGift
