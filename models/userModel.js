const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mobile_number: {
        type: Number,
        required: true
    },
    talk_angel_wallet: {
        Ballance: {
            type: String,
            default: '0'
        }
    },
    agora_call: {
        chanal_name: {
            type: String,
        },
        token: {
            type: String,
        },
    },
    refer_and_earn: {
        type: String
    },
    image: {
        type: String,
        default: '0'
    },
    status: {
        type: Number,
        required: true,
        enum: [
            0,
            1,
        ],
        default: 0
    },
    role: {
        type: String,
        default: 'user'
    },
    fcmToken: String,
});

module.exports = mongoose.model('User', userSchema);
