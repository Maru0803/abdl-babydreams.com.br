require('dotenv').config();

const stripe = require("stripe")(process.env.stripeapikey, {
    apiVersion: "2020-08-27",
    appInfo: {
        name: "stripe-baby-dreams",
        version: "0.0.2",
    },
});

module.exports = stripe ;