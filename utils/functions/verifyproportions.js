const produtos = require('../jsons/produtos.json')

async function verifyProportions(info) {
    var quantity = 0;
    var insurance_value = 0;
    var width = 0
    var height = 0
    var length = 0
    var weight = 0
    var err = false
    Object.entries(info).forEach(([a, b]) => {
        if(!produtos[a]) err = true;
        quantity += b;
        insurance_value += produtos[a].price * b;
        height += produtos[a].info.altura * b;
        weight += produtos[a].info.peso * b;
        width = produtos[a].info.largura > width ? produtos[a].info.largura : width;
        length = produtos[a].info.comprimento > length ? produtos[a].info.comprimento : length;
    })

    var obj = {
        id: "verifyShippingDreams",
        width: width,
        height: height,
        length: length,
        weight: weight,
        insurance_value: insurance_value,
        quantity: quantity
    };
    
    return err ? { status: "error", error: "invalid Item Detected "} : obj
}

module.exports = verifyProportions;