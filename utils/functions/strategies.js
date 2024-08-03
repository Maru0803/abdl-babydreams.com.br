const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const database = require("./database.js");
require('dotenv').config();

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    var user = await database.ref(`login/${id}`).once("value");
    if (user) done(null, user.val());
});

passport.use("home", new GoogleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: 'https://www.abdl-babydreams.com.br/auth/auth',
   scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("[LOGIN]: Conectado", profile._json);
        var ref = database.ref(`login/${profile.id}`);
        ref.set(profile._json);
        done(null, profile);
    } catch (err) {
        console.log("[LOGIN]: Erro", err);
        done(err, null);
    }
}));

passport.use("cart", new GoogleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: 'https://www.abdl-babydreams.com.br/auth/checkout',
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("[LOGIN]: Conectado", profile._json);
        var ref = database.ref(`login/${profile.id}`);
        ref.set(profile._json);
        done(null, profile);
    } catch (err) {
        console.log("[LOGIN]: Erro", err);
        done(err, null);
    }
}));

passport.use("order", new GoogleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: 'https://www.abdl-babydreams.com.br/auth/orders',
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("[LOGIN]: Conectado", profile._json);
        var ref = database.ref(`login/${profile.id}`);
        ref.set(profile._json);
        done(null, profile);
    } catch (err) {
        console.log("[LOGIN]: Erro", err);
        done(err, null);
    }
}));
