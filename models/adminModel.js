const mongoose = require('mongoose');

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

module.exports = mongoose.model('admin', adminSchema);