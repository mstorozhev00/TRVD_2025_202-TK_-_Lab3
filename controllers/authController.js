const User = require('../models/user');

exports.register = async (req, res) => {
    try {
        const { name, email, age, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.render('register', { error: 'Цей email вже зареєстровано' });

        const user = await User.create({ name, email, age, password });
        req.session.user = { id: user._id, name: user.name, role: user.role };
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.render('register', { error: 'Помилка реєстрації' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.render('login', { error: 'Користувача не знайдено' });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.render('login', { error: 'Невірний пароль' });

        req.session.user = { id: user._id, name: user.name, role: user.role };
        res.redirect('/profile');
    } catch (err) {
    console.error(err);
    res.render('register', { error: 'Помилка реєстрації: ' + err.message });
}

};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
};

