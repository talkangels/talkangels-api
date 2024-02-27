const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    mobile_number: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    fcm_token: {
        type: String,
        required: true,
    },
    log_out: {
        type: Number,
        required: true,
        enum: [
            0,
            1,
        ],
        default: 0
    }
});

const Tokens = mongoose.model('Token', tokenSchema);

module.exports = Tokens;
