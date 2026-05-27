const {generateAccessToken, verifyToken, hashToken, generateRefreshToken} = require('../utils/tokenUtils');
const RefreshToken = require('../models/RefreshToken');

async function refreshAccessToken(req, res, next) {

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not provided' });
    }
    const hashedToken = hashToken(refreshToken);
    const refreshTokenDoc= await RefreshToken.findOne({token: hashedToken}).populate('owner')
    if(!refreshTokenDoc || !refreshTokenDoc.isActive()){
        return res.status(401).json({ message: 'Token expired or revoked' });
    }
    

    const payload = {
        id: refreshTokenDoc.owner._id,
        username: refreshTokenDoc.owner.username,
        email: refreshTokenDoc.owner.email,
    }

    const newAccessToken = generateAccessToken(payload);

    refreshTokenDoc.isRevoked = true;
    
    await refreshTokenDoc.save();

    const newRefreshToken = generateRefreshToken();
    const hashedNewRefreshToken = hashToken(newRefreshToken);

    const newRefreshTokenDoc = new RefreshToken({
        token: hashedNewRefreshToken,
        owner: refreshTokenDoc.owner._id,
        expiresAt: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: req.ip
    });

    await newRefreshTokenDoc.save();

    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        maxAge: 7*24*60*60*1000,
        secure: process.env.NODE_ENV === 'production',
    });
    



    res.status(200).json({status: 'success', token: newAccessToken});

   }


async function revokeToken(req, res, next){
    const token = req.cookies.refreshToken;
    if(!token){
        return res.sendStatus(201)
    }
    const hashedToken = hashToken(token);
    const revokedToken= await RefreshToken.findOneAndUpdate({token: hashedToken}, {isRevoked: true}, {new: true})
    console.log('Revoked Token:', revokedToken);

    
    res.clearCookie('refreshToken');
    res.status(200).json({status: 'success', message: 'Logged out successfully'});

}
module.exports.refreshAccessToken = refreshAccessToken;
module.exports.revokeToken = revokeToken;