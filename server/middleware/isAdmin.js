module.exports = function(req, res, next) {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
}; 