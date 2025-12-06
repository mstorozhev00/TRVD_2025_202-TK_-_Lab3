const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.render('users', { users });
    } catch (err) {
        res.status(500).send('Помилка сервера');
    }
};

exports.createUser = async (req, res) => {
    const { name, email, age, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send('Заповніть усі обов’язкові поля');
    }

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).send('Користувач з таким email вже існує');

        user = new User({ name, email, age, password, role: role || 'user' });
        await user.save();

        res.redirect('/users');
    } catch (err) {
        res.status(500).send('Помилка сервера');
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.render('login', { error: 'Невірний email або пароль' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.render('login', { error: 'Невірний email або пароль' });

        req.session.user = { id: user._id, name: user.name, role: user.role };
        res.redirect('/profile');
    } catch (err) {
        res.status(500).send('Помилка сервера');
    }
};

exports.logoutUser = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send('Помилка при виході');
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};

exports.getProfile = async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/auth/login');

        // Дістаємо id користувача з сесії
        const userId = req.session.user.id;

        // Підвантажуємо актуальний профіль з бази
        const user = await User.findById(userId).lean().select('-password');
        if (!user) return res.redirect('/auth/login');

        res.render('profile', {
            title: 'Профіль користувача',
            user
        });
    } catch (err) {
        console.error(err);
        res.redirect('/auth/login');
    }
};