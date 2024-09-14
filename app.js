const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const path = require('node:path');

const app = express();
const port = 3000;

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Middlewares
app.use(express.static('public'));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'thisismysecretkey',
    resave: false, 
    saveUninitialized: false,
    cookie: {
        secure: false, 
        maxAge: 1000 * 60 * 60 // cookie lifespan - 1hr
    }
}));

// prevent cache for backbutton
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});


// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layout/layout');

// Connect to MongoDB
mongoose
.connect('mongodb://localhost:27017/notepadApp')
.then(() => console.log('connected to MongoDB'))
.catch(err => console.log('Could not connect to MongoDB...', err));

// routes setup
app.use('/', userRoutes);
app.use('/admin', adminRoutes);

app.listen(port, (err) => {
    console.log(`Listening to port ${port}`);
})

