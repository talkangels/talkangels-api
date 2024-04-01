const mongoose = require('mongoose');

const listenersSchema = new mongoose.Schema({
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
    country_code: {
        type: String,
        default: 0
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    status: {
        type: Number,
        enum: [
            0,
            1,
        ],
        default: 0
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
});

const Listener = mongoose.model('listener', listenersSchema);

module.exports = Listener;
