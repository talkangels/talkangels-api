const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
        required: true,
        enum: [0, 1],
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    },
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff', 
    },
});

module.exports = mongoose.model('reports', reportSchema);
