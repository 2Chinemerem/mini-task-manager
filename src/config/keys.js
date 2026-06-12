const fs = require('fs');
const path = require('path');
const crypto = require('crypto');


function loadkeys(){
    const privateKey= fs.readFileSync((path.join(__dirname, '../../keys/private.key')), 'utf8');
    const publicKey= fs.readFileSync((path.join(__dirname, '../../keys/public.key')), 'utf8');
    let previous_public = null;
    let previousKid = null;


    try{
        const previous_public= fs.readFileSync((path.join(__dirname, '../../keys/previous_public.key')), 'utf8');
        const previousKid = crypto.createHash('sha256').update(previous_public).digest('hex');
    }
    catch(err){
        console.log("No previous public key found, skipping...");
    }

   

    const activeKid = crypto.createHash('sha256').update(publicKey).digest('hex');


    return { privateKey, publicKey, activeKid, previous_public: previous_public?? null, previousKid: previousKid ?? null };
}

function convertToJwk(publicKey, kid){
    const keyObject = crypto.createPublicKey(publicKey);
    const jwk = keyObject.export({ format: 'jwk' });

    return{
        kty: jwk.kty,
        n: jwk.n,
        e: jwk.e,
        kid: kid,
        use: 'sig',
        alg: 'RS256'
    }
}

function getActiveKid(){
    const keys = loadkeys();
    return keys.activeKid;
}

module.exports = {
    loadkeys,
    convertToJwk,
    getActiveKid
}