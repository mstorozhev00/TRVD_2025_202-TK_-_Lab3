exports.getProfile = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    res.render('profile', { 
        title: 'Профіль користувача',
        user: req.session.user
    });
};
