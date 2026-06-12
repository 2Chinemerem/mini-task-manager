const path = require('path');
const fs = require('fs')
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {getActiveKid} = require('../config/keys');
const privateKey= fs.readFileSync((path.join(__dirname, '../../keys/private.key')), 'utf8');
const publicKey= fs.readFileSync((path.join(__dirname, '../../keys/public.key')), 'utf8');



const signOptions = {
    expiresIn: '1d',
    algorithm: 'RS256',
    issuer: 'Mini-Task-Manager',
    audience: 'Mini-Task-Manager-Clients',
    keyid: getActiveKid()
};

const verifyOptions = {
    algorithms: ['RS256'],
    issuer: 'Mini-Task-Manager',
    audience: 'Mini-Task-Manager-Clients'
};


function generateAccessToken(payload) {
    return jwt.sign(payload, privateKey, signOptions);
}

function generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');

}
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}


function verifyToken(token) {
    try {
        return jwt.verify(token, publicKey, verifyOptions);
    } catch (err) {
        throw new Error('Invalid token');
    }
}

module.exports= {
    generateAccessToken,
    verifyToken,
    generateRefreshToken,
    hashToken
};