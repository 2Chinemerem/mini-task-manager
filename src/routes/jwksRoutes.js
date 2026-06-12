const express = require('express');
const router = express.Router();
const {getJWKS} = require('../controllers/jwksController');


router.get('/.well-known/jwks.json', getJWKS);

module.exports = router;