function wasAuthenticated(req, res, next) {
    if (req.session.user) {
        return res.redirect('/home');
    }
    next();
}

// Ensure authentication if user already logged in
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/');
}

// ADMIN PAGE

function wasAdminAuth(req, res, next) {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    next();
}

function isAdminAuth(req, res, next) {
    if (req.session.admin) {
        return next();
    }
    res.redirect('/admin');
}

module.exports = { wasAuthenticated, isAuthenticated, wasAdminAuth, isAdminAuth };