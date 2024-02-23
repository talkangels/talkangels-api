const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    mobile_number: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    }
});

const Tokens = mongoose.model('Token', tokenSchema);

module.exports = Tokens;
