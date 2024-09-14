const User = require('../models/userModel');
const bcryptjs = require('bcryptjs');

// capitalize username
function capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    
    loginPage: (req, res) => {
        const error = req.query.error ? decodeURIComponent(req.query.error) : null;
        res.render('user/login', {
            title: 'Login',
            error,
        });
    },

    registerPage: (req, res) => {
        const error = req.query.error ? decodeURIComponent(req.query.error) : null;
        res.render('user/register', {
            title: 'Register',
            error,
        });
    },

    registerUser: async (req, res) => {
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
    },

    loginUser: async (req, res) => {
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
    },

    homePage: (req, res) => {
        capUserName =  capitalizeString(req.session.user.username);
    
        res.render('user/home', {
            title: 'Home',
            name: capUserName,
        });
    },

    logoutUser: (req, res) => {
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
    } 
};