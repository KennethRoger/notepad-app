const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcryptjs = require('bcryptjs');
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const path = require('node:path');

const port = 3000;
const app = express();

// Using static path
app.use(express.static('public'));
// using express layouts
app.use(expressLayouts);

// Middleware to parse URL-encoded bodies (from forms)
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Setting headers to prevent back button
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
});

// Creating a session
app.use(session({
    secret: 'thisismysecretkey',
    resave: false, 
    saveUninitialized: false,
    cookie: {
        secure: false, 
        maxAge: 1000 * 60 * 60 // cookie lifespan - 1hr
    }
}));

// Setting apps
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layout/layout');

// Connect to MongoDB
mongoose
.connect('mongodb://localhost:27017/notepadApp')
.then(() => console.log('connected to MongoDB'))
.catch(err => console.log('Could not connect to MongoDB...', err));

// Setting a schema for users
const userSchema = new mongoose.Schema({
    userId: {
        type: Number,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
},
{timestamps: true}
);

// Setting model for users
const User = mongoose.model('user', userSchema);

// Setting schema for admin

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    adminId: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        unique: true
    }
});

const Admin = mongoose.model('admin', adminSchema);

// LOGIN PAGE

function wasAuthenticated(req, res, next) {
    if (req.session.user) {
        return res.redirect('/home');
    }
    next();
}

// get request for login page
app.get('/', wasAuthenticated, (req, res) => {
    const error = req.query.error ? decodeURIComponent(req.query.error) : null;
    res.render('user/login', {
        title: 'Login',
        error,
    });
});

// handling post req to the login page
app.post('/', async (req, res) => {
    const {username, password} = req.body;
    try {
        const user = await User.findOne({username});
        if (user) {
            const match = await bcryptjs.compare(password, user.password);

            if (match) {
                req.session.user = { username: user.username, uid: user._id };
                res.status(200).redirect('/home');
            }
            else {
                res.redirect('/?error=Invalid+username+or+password');
            }
        }
        else {
            res.redirect('/?error=Invalid+username+or+password');
        }
    }
    catch (err) {
        res.status(500).send("500 - Internal error occured");
    }
    
});

// Ensure authentication if user already logged in
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/');
}

// REGISTER PAGE
// get request for register page
app.get('/register', wasAuthenticated, (req, res) => {
    const error = req.query.error ? decodeURIComponent(req.query.error) : null;
    res.render('user/register', {
        title: 'Register',
        error,
    });
});

// post request on the register page
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // creating new user
    try {
        const hashedPass = await bcryptjs.hash(password, 10);

        const maxUser = await User.findOne().sort({userId:-1});
        const nextUserId = maxUser? maxUser.userId + 1 : 1;

        // creating user in db
        const newUser = await User.create({
            userId: nextUserId,
            username: username,
            email: email,
            password: hashedPass, 
        });
        console.log(newUser);
        
        
        res.redirect('/home');
    }
    catch (err) {
        return res.redirect("/register?error=The+username+is+already+taken");
    }
});

// HOME PAGE

// capitalize username
function capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

app.get('/home', isAuthenticated, (req, res) => {
    capUserName =  capitalizeString(req.session.user.username);

    res.render('user/home', {
        title: 'Home',
        name: capUserName,
    });
});

app.post('/logout', (req, res) => {
    if (req.session.user) {
        try {
            delete req.session.user;
            res.clearCookie('connect.sid');
            res.redirect('/');
        }
        catch (err) {
            return res.status(500).redirect('/home');
        }
    }
});

// ADMIN PAGE

function wasAdminAuth(req, res, next) {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    next();
}

// admin login
app.get('/admin', wasAdminAuth, (req, res) => {
    const error = req.query.error ? decodeURIComponent(req.query.error) : null;
    res.render('admin/login', {
        title: 'Admin login',
        error,
    })
});

app.post('/admin', async (req, res) => {
    const { name, adminId, password } = req.body;

    try {
        const admin =  await Admin.findOne({name, adminId, password});
    
        if (admin) {
            req.session.admin = { name: admin.name, aid: admin.adminId};
            res.redirect('/admin/dashboard');
        }
        else {
            res.redirect('/admin?error=Invalid+login+credentials');
        }
    }
    catch (err) {
        res.status(500).send('500 - Internal server error')
    }
});

function isAdminAuth(req, res, next) {
    if (req.session.admin) {
        return next();
    }
    res.redirect('/admin');
}

// Admin dashboard
app.get('/admin/dashboard', isAdminAuth, async (req, res) => {
    try {
        const users = await User.find({}, {userId:1, username:1, email:1});

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            adminName: req.session.admin.name,
            users,
        });
    }
    catch (err){
        res.status(500).redirect('/admin/dashboard');
    }
});

// Admin search user

app.get('/admin/dashboard/search-user', isAdminAuth, async (req, res) => {
    const searchQuery = req.query.data;

    try {
        let users;
        const userIdQuery = isNaN(searchQuery)? null: Number(searchQuery);
        
        users = await User.find({
            $or: [
                { username: { $regex: searchQuery, $options: 'i' } },
                { userId: userIdQuery }
            ]
        }, {userId:1, username:1, email:1});
        
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            adminName: req.session.admin.name,
            users,
        });

    }
    catch (err){
        res.status(500).redirect('/admin/dashboard')
    }
});

// Admin add user

app.post('/admin/dashboard/add-user', isAdminAuth, async (req, res) => {
    const { username, email, password} = req.body;
    
    try {
        const hashedPassword = await bcryptjs.hash(password, 10);

        const maxUser = await User.findOne().sort({userId:-1});
        const nextUserId = maxUser? maxUser.userId + 1 : 1;

        await User.create({
            userId: nextUserId,
            username,
            email,
            password: hashedPassword
        });

        res.redirect('/admin/dashboard');
    }
    catch (err) {
        res.status(500).render('admin/dashboard', {
            title: 'Admin Dashboard',
            adminName: req.session.admin.name,
            users: await User.find({}, { userId:1, username:1, email:1 }),
            error: 'Something went wrong. User creation failed.'
        });
    }
});

// Admin edit user

app.post('/admin/dashboard/edit-user', isAdminAuth, async (req, res) => {
    const { userId, username, email, password } = req.body;

    try {
        const validUser = await User.findOne({ userId });

        if (!validUser) {
            console.log('User not found');
            return res.status(404).send('User not found');
        }

        const updateFields = {};
        if (username) updateFields.username = username;
        if (email) updateFields.email = email;
        if (password) updateFields.password = await bcryptjs.hash(password, 10);

        await User.updateOne({ userId }, { $set: updateFields });

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('An error occurred while updating the user');
    }
});

// Admin delete user

app.post('/admin/dashboard/delete-user', isAdminAuth, async (req, res) => {
    const userId = req.body.userId;

    if (userId) {
        try {
            const userToDelete = await User.findOneAndDelete({userId: Number(userId)});
            console.log(userToDelete);
            
            res.status(200).redirect('/admin/dashboard')
        }
        catch (err) {
            res.status(500).redirect('/admin/dashboard')
        }   
    }
    else {
        res.redirect('/admin/dashboard')
    }
});

// Admin logout

app.post('/admin/logout', (req, res) => {
    if (req.session.admin) {
        delete req.session.admin;
        res.clearCookie('connect.sid');
        res.redirect('/admin');

    }
    else {
        return res.status(500).redirect('/admin/dashboard');
        }
});

app.listen(port, (err) => {
    console.log(`Listening to port ${port}`);
})
