const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    charges: {
        type: Number,
        default: 1
    },
    mobile_number: {
        type: Number,
        required: true
    },
    avatar: {
        type: String,
    },
    role: {
        type: String,
        default: 'admin'
    },
    resetToken: String,
    resetTokenExpiry: Date,
    fcmToken: String,
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;