const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    wardNumber: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Available', 'Offline'],
        default: 'Available' // Defaulting to available so they can get dispatched immediately
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Worker', workerSchema);