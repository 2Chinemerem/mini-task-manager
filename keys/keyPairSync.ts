const crypto = require('crypto');
const fs = require('fs');

function genKeyPairSync(){
    const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding:{
            type: 'pkcs1',
            format: 'pem',
        },
        privateKeyEncoding:{
            type: 'pkcs1',
            format: 'pem',
        },
    });
    return {publicKey, privateKey};
}



if (require.main === module) {
    const keys = genKeyPairSync();

    fs.writeFileSync('private.key', keys.privateKey);
    fs.writeFileSync('public.key', keys.publicKey);
}


module.exports= {genKeyPairSync};
