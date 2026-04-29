const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: String, required: true }, // Can be userId, workerName, or 'ALL_WORKERS'
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
