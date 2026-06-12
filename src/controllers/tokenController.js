const {generateAccessToken, verifyToken, hashToken, generateRefreshToken} = require('../utils/tokenUtils');
const RefreshToken = require('../models/RefreshToken');
//The below function handles the refresh token logic. First it checks if the refresh token is present in the cookies. 
// If not, it returns a 401 error. Then it hashes the provided refresh token and looks for it in the database. 
// If the token is not found or is revoked, the function recognizes it as a refresh token reuse attempt.
//It then revokes all tokens in the same family and returns a 401 error. If the token is valid, 
// it generates a new access token and a new refresh token, saves the new refresh token in the database, 
// and sends the new access token in the response along with setting the new refresh token in an HTTP-only cookie.

async function refreshAccessToken(req, res, next) {

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not provided' });
    }

    const hashedToken = hashToken(refreshToken);
    const refreshTokenDoc= await RefreshToken.findOne({token: hashedToken}).populate('owner')
    if(!refreshTokenDoc){
        return res.status(401).json({ message: 'Token expired or does not exist' });
    }
    if(!refreshTokenDoc.isActive()){
        //Refresh token reuse detected
        console.warn('Refresh token reuse detected for token:', hashedToken);
        console.warn('Details:', req.headers['user-agent'], req.ip);

        const tokenFamily = refreshTokenDoc.family;
        await RefreshToken.updateMany({family: tokenFamily}, {isRevoked: true});

        return res.status(401).json({ message: 'Refresh token revoked. Please log in again.' });
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
    const familyId= crypto.randomUUID();

    const newRefreshTokenDoc = new RefreshToken({
        token: hashedNewRefreshToken,
        owner: refreshTokenDoc.owner._id,
        family: refreshTokenDoc.family,
        expiresAt: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: req.ip,
        replacedByToken: hashedToken
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
        return res.status(200).json({'status': 'success', message: 'Logged out successfully'});
    }
    const hashedToken = hashToken(token);
    const revokedToken= await RefreshToken.findOneAndUpdate({token: hashedToken}, {isRevoked: true}, {new: true})
    console.log('Revoked Token:', revokedToken);

    
    res.clearCookie('refreshToken');
    res.status(200).json({status: 'success', message: 'Logged out successfully'});

}
module.exports.refreshAccessToken = refreshAccessToken;
module.exports.revokeToken = revokeToken;