const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const bcryptjs = require('bcryptjs');

module.exports = {
    loginPage: (req, res) => {
        const error = req.query.error ? decodeURIComponent(req.query.error) : null;
        res.render('admin/login', {
            title: 'Admin login',
            error,
        })
    },
    
    loginAdmin: async (req, res) => {
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
    },

    adminDashboard: async (req, res) => {
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
    },

    logoutAdmin: (req, res) => {
        if (req.session.admin) {
            delete req.session.admin;
            res.clearCookie('connect.sid');
            res.redirect('/admin');
    
        }
        else {
            return res.status(500).redirect('/admin/dashboard');
            }
    },

    // Admin functionalities

    adminSearchUser: async (req, res) => {
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
    },

    adminAddUser: async (req, res) => {
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
    },

    adminEditUser: async (req, res) => {
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
    },

    adminDeleteUser: async (req, res) => {
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
    },
}