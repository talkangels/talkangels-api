const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mobile_number: {
        type: Number,
        unique: true,
        required: true,
        validate: {
            validator: function (value) {
                return /^\d{10}$/.test(value);
            },
            message: props => `${props.value} is not a valid 10-digit mobile number!`
        },
    },
    country_code: {
        type: Number,
        required: true,
        default: 0
    },
    talk_angel_wallet: {
        total_ballance: {
            type: Number,
            default: 0
        },
        transections: [
            {
                amount: {
                    type: Number,
                    required: true,
                },
                payment_id: {
                    type: String,
                    required: true,
                },
                type: {
                    type: String,
                    default: '0'
                },
                curent_bellance: {
                    type: Number,
                    required: true,
                },
                date: {
                    type: Date,
                    required: true,
                },
            }
        ]
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
