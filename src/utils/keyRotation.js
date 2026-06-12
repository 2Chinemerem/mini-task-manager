const cron = require('node-cron');

cron.schedule('* * * * * *', () => {
const fs = require('fs');
const path = require('path');

const key_path= path.join(__dirname, '../../keys/keyPairSync.ts')

const {genKeyPairSync} = require(key_path);
// second (optional)
//  minute
//  hour
//  day of month
//  month
//  day of week


const old_publicKey= fs.readFileSync((path.join(__dirname, '../../keys/public.key')), 'utf8');

fs.writeFileSync((path.join(__dirname, '../../keys/previous_pubdlic.key')), old_publicKey, 'utf8');

const {privateKey, publicKey} = genKeyPairSync();

fs.writeFileSync((path.join(__dirname, '../../keys/private.key')), privateKey, 'utf8');
fs.writeFileSync((path.join(__dirname, '../../keys/public.key')), publicKey, 'utf8');

console.log("Keys rotated successfully");
})