const firebase = require("firebase");
require('dotenv').config();

if(!firebase.apps.length) firebase.initializeApp({
    authDomain: process.env.authDomain,
    databaseURL: process.env.databaseURL,
});

module.exports = firebase.database()
