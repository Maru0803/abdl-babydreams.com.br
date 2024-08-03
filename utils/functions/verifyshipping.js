require('dotenv').config();

async function verifyShipping(res, cep, data) {
    try {
        var link = "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate";

        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.token}`,
                'User-Agent': 'Aplicação contato.babydreams@gmail.com'
            },
            body: JSON.stringify({
                from: { postal_code: process.env.from },
                to: { postal_code: cep },
                products: [ data],
                services: "1,2"
            })
        };
        
        await fetch(link, options).then(response => {
            return response.json();  
        })
        .then(data => {
            var filtred = data.errors ?  "invalid" : data.filter(x => !x.error);
            if(!filtred[0] || filtred === "invalid") return res.json({status: "invalid"});
            else res.json({statsu: "success", fretes: filtred});
        })
    } catch (error) {
        console.error(error);
        return res.json({status: "invalid"});
    }
}

module.exports = verifyShipping;