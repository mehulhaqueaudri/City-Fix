// backend/models/Inventory.js
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
        // NOTE: We do NOT use "unique: true" here, so we can have multiple 
        // rows of the same item if they have different prices!
    },
    costPerUnit: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: { 
        type: String, 
        default: 'bags' 
    },
    // 🌟 FEATURE 14: Ensure the database remembers the Admin's custom number
    alarmThreshold: { 
        type: Number, 
        default: 10 
    }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);