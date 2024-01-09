const mongoose = require('mongoose');

const rechargeSchema = new mongoose.Schema({
    amount: {
        type: String,
        required: true
    },
    discount_amount: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        enum: [
            0,
            1,
        ],
        default: 0
    }
});

module.exports = mongoose.model('Recharges', rechargeSchema);
