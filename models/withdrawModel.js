const mongoose = require('mongoose');

const withdrowSchema = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.ObjectId,
        ref: "Staff",
        required: true,
    },
    request: [
        {
            request_amount: {
                type: Number,
                required: true
            },
            current_amount: {
                type: Number,
                required: true
            },
            pending_amount: {
                type: Number,
            },
            date: {
                type: Date,
                required: true,
            },
            request_status: {
                type: String,
                enum: [
                    "accept",
                    "pending",
                    "reject"
                ],
                default: "pending"
            }
        }
    ],
});

const Withdrows = mongoose.model('Withdrows', withdrowSchema);

module.exports = Withdrows;