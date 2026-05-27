function authorize(...allowedRoles) {
    return (req, res, next) => {
        if(!req.user){
            return res.status(401).json({message: 'Unauthorized'})
        }

        const rolesArray = [...allowedRoles]
        const userRole = req.user.role
        const roleCheck = rolesArray.includes(userRole)

        if(!roleCheck){
            return res.status(403).json({message: 'Insufficient permissions'})
        }
        return next()
    }
}

module.exports = authorize;