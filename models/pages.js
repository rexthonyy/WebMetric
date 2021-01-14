const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    projectId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Page', pageSchema);