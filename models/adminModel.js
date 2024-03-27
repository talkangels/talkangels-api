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
    staff_charges: {
        type: Number,
        required: true
    },
    user_charges: {
        type: Number,
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
    revenue: {
        revenue_earnings: {
            type: Number,
            default: 0
        },
        total_money_withdraws: {
            type: Number,
            default: 0
        },
        total_pending_money: {
            type: Number,
            default: 0
        }
    },
    resetToken: String,
    resetTokenExpiry: Date,
    fcmToken: String,
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;