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

########################################
// WORKER WARD FIELD USED FOR SAME-WARD ASSIGNMENT
########################################

    wardNumber: {
        type: String,
        required: true
    },

########################################
// WORKER AVAILABILITY FIELD USED FOR AUTO-DISPATCH
########################################

    status: {
        type: String,
        enum: ['Available', 'Offline'],
        default: 'Available'
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Worker', workerSchema);
