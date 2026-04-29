const mongoose = require('mongoose');

const inventoryRequestSchema = new mongoose.Schema({
    workerName: { type: String, required: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true },
    costPerUnit: { type: Number, required: true }, // 🧠 NEW: Track the requested price
    status: { type: String, default: 'Pending' } // Pending, Approved, Rejected
}, { timestamps: true });

module.exports = mongoose.model('InventoryRequest', inventoryRequestSchema);