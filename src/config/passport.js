const JwtStrategy = require('passport-jwt').Strategy;
const fs = require('fs');
const path = require('path');
const ExtractJwt= require('passport-jwt').ExtractJwt;
const privateKey= fs.readFileSync((path.join(__dirname, '../../keys/private.key')), 'utf8');
const publicKey= fs.readFileSync((path.join(__dirname, '../../keys/public.key')), 'utf8');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {loadkeys} = require('./keys');

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKeyProvider: (req, rawJwtToken, done)=>{
        const decoded = jwt.decode(rawJwtToken, {complete: true});
        if(!decoded || !decoded.header || !decoded.header.kid){
            return done(new Error('Invalid token: Missing kid in header'), null);
        }
        const kid = decoded.header.kid;

        if(kid === loadkeys().activeKid){
            return done(null, loadkeys().publicKey);
        }
        else if(kid === loadkeys().previousKid){
            return done(null, loadkeys().previous_public);
        }
        else{
            return done(new Error('Invalid token: Unknown kid'), null);
        }

    },
    algorithms: ['RS256'],
    issuer: 'Mini-Task-Manager',
    audience: 'Mini-Task-Manager-Clients'
}

const Strategy = new JwtStrategy(options, async(payload, done) =>{

    try{
        const user= await User.findById(payload.id);

        if(user){
            return done(null, user);
        }
        else{
            return done(null, false);
        }
    }
    catch(error){
        return done(error, false);
    }
})

module.exports = (passport) =>{
    passport.use(Strategy);
}   