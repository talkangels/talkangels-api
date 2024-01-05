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
    fcmToken: String,
});

module.exports = mongoose.model('Admin', adminSchema);
