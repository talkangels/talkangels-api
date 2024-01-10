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
        type: Number,
        default: 10
    },
    role: {
        type: String,
        default: 'staff'
    },
    listing: {
        total_minutes: {
            type: String,
            default: '0'
        },
        call_history: [
            {
                user: {
                    type: mongoose.Schema.ObjectId,
                    ref: "User",
                    required: true,
                },
                history: [
                    {
                        date: {
                            type: Date,
                            required: true,
                        },
                        call_type: {
                            type: String,
                            required: true,
                        },
                        minutes: {
                            type: String,
                            required: true,
                        }
                    }
                ]
            }
        ]
    },
    earnings: {
        current_earnings: {
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
        },
        sent_withdraw_request: {
            type: Number,
            default: 0
        }
    },
    total_rating: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
        },
    ],
    fcmToken: String,
    updated_at: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Staff', staffSchema);
