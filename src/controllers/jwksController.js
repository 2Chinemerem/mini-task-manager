const {convertToJwk, loadkeys} = require('../config/keys');

function getJWKS(req, res) {
    const jwks = {keys: []};
    const keys = loadkeys();

    const jwk = convertToJwk(keys.publicKey, keys.activeKid);
    jwks.keys.push(jwk);
    
    if (keys.previous_public) {
        jwks.keys.push(convertToJwk(keys.previous_public, keys.previousKid));
    }

    res.set('Cache-Control', 'public, max-age=3600');

    res.status(200).json(jwks);


}
module.exports = {
    getJWKS
}

