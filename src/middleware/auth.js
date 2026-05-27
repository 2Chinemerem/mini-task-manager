const passport = require('passport');

function authenticate(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized Access' });
        }
        req.user = user;
        next();
    })(req, res, next);
}

module.exports = authenticate;