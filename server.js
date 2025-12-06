const express = require('express');
const mustacheExpress = require('mustache-express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/mydatabase')
  .then(() => console.log("MongoDB підключено"))
  .catch(err => console.error("Помилка MongoDB:", err));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/mydatabase' }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

const userController = require('./controllers/userController');
const authRoutes = require('./routes/auth');
const { ensureAuthenticated } = require('./middleware/auth');

app.use('/auth', authRoutes);

app.get('/', (req, res) => res.render('index', { title: 'Головна сторінка' }));
app.get('/about', (req, res) => res.render('about', { title: 'Про нас' }));

app.get('/users', userController.getUsers);
app.post('/users', userController.createUser);

app.get('/profile', ensureAuthenticated, userController.getProfile);

app.get('/login', (req, res) => res.redirect('/auth/login'));
app.get('/register', (req, res) => res.redirect('/auth/register'));

app.listen(port, () => {
    console.log(`Сервер запущено на http://localhost:${port}`);
});
