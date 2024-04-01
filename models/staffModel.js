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
            message: props => `please enter valid 10 digit mobile number!`
        },
    },
    email: {
        type: String,
    },
    country_code: {
        type: Number,
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
    },
    language: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
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
            "NotAvailable"
        ],
        default: "NotAvailable"
    },
    call_available_status: {
        type: String,
        enum: [
            "0",
            "1",
        ],
        default: "1"
    },
    status: {
        type: Number,
        enum: [
            0,
            1,
        ],
        default: 1
    },
    charges: {
        type: Number,
        default: 1
    },
    staff_charges: {
        type: Number,
        default: 1
    },
    user_charges: {
        type: Number,
        default: 2
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
                        call_time: {
                            type: String,
                            required: true,
                        },
                        call_type: {
                            type: String,
                            required: true,
                        },
                        mobile_number: {
                            type: Number,
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
        },
        withdraw_request_message: {
            type: String,
            default: ""
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
            user_reviews: [
                {
                    rating: {
                        type: Number,
                        required: true,
                    },
                    comment: {
                        type: String,
                    },
                    date: {
                        type: Date,
                        default: new Date()
                    },
                }
            ]

        },
    ],
    log_out: {
        type: Number,
        required: true,
        enum: [
            0,
            1,
        ],
        default: 0
    },
    fcmToken: String,
    updated_at: {
        type: Date,
        default: Date.now
    },
});

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
