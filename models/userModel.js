const mongoose = require('mongoose');

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

module.exports =  mongoose.model('user', userSchema)