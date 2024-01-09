const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    mobile_number: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true,
    },
    bio: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: '0'
    },
    Language: {
        type: String,
        default: '0'
    },
    Age: {
        type: String,
        default: '0'
    },
    active_status: {
        type: String,
        enum: [
            "Online",
            "Offline"
        ],
        default: "Offline"
    },
    call_status: {
        type: String,
        enum: [
            "Available",
            "Busy",
        ],
        default: "Available"
    },
    status: {
        type: Number,
        enum: [
            0,
            1,
        ],
        default: 0
    },
    charges: {
        type: String,
        default: '0'
    },
    role: {
        type: String,
        default: 'staff'
    },
    fcmToken: String,
    updated_at: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Staff', staffSchema);
