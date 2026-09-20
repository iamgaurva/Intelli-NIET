function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    next();
}

function requireRole(role) {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (req.session.user.role !== role) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        next();
    };
}

module.exports = {
    requireLogin,
    requireRole
};