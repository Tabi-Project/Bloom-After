const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    theme: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: 'en'
    },
    sourceUrl: {
        type: String,
        required: true
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
    },
    published: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;