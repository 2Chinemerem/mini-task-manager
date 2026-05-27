const express = require('express');
const router = express.Router();

const { refreshAccessToken, revokeToken } = require('../controllers/tokenController');

router.post('/refresh', refreshAccessToken);
router.post('/logout', revokeToken);

module.exports = router;

