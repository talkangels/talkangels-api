const mongoose = require('mongoose');

const webPageSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true
    },
    route: {
        type: String,
        default: ""
    },
    data: []
});

const WebPage = mongoose.model('WebPage', webPageSchema);

module.exports = WebPage;
