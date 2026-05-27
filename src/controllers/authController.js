const User = require('../models/User');
const {generateAccessToken, verifyToken, generateRefreshToken, hashToken} = require('../utils/tokenUtils');
const RefreshToken = require('../models/RefreshToken');

async function registerUser(req, res, next){
    const {username, email, password} = req.body;
    const existingUser = await User.findOne({email: email});
    if(existingUser){
        const error= new Error('User already exists');
        error.statusCode = 409;
        return next(error)
    }
    const newUser = new User({
        username,
        email,
        password
    });


  try {
    await newUser.save();
    const { password, ...userResponse } = newUser.toObject();
    res.status(201).json({ status: 'success', user: userResponse });
}
    catch(err){
        next(err);
    }
    
}

async function loginUser(req, res, next){
    const {email, password}= req.body;
    const user = await User.findOne({email: email});

    if(!user){
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        return next(error);
    }

    const isValidUser= await user.comparePassword(password)

    if(!isValidUser){
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        return next(error);
    }
    
    const payload = {
        id: user._id,
        username: user.username,
        email: user.email,

    }

    const token = generateAccessToken(payload);

    const generatedRefreshToken = generateRefreshToken();
    const hashedRefreshToken = hashToken(generatedRefreshToken);

    const refreshTokenDoc = new RefreshToken({
        token: hashedRefreshToken,
        owner: user._id,
        expiresAt: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: req.ip
    });

    await refreshTokenDoc.save();



    res.cookie('refreshToken', generatedRefreshToken, {
        httpOnly: true,
        maxAge: 7*24*60*60*1000,
        secure: process.env.NODE_ENV === 'production',
    });
    



    return res.status(200).json({status: 'success', token: token});
}


module.exports = {registerUser, loginUser};