const JwtStrategy = require('passport-jwt').Strategy;
const fs = require('fs');
const path = require('path');
const ExtractJwt= require('passport-jwt').ExtractJwt;
const privateKey= fs.readFileSync((path.join(__dirname, '../../keys/private.key')), 'utf8');
const publicKey= fs.readFileSync((path.join(__dirname, '../../keys/public.key')), 'utf8');
const User = require('../models/User');


const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: publicKey,
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