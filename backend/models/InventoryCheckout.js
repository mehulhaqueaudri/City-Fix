const mongoose = require('mongoose');

const inventoryCheckoutSchema = new mongoose.Schema({
    workerName: { type: String, required: true },
    items: [{
        inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
        itemName: { type: String, required: true },
        quantity: { type: Number, required: true },
        costPerUnit: { type: Number, required: true },
        totalCost: { type: Number, required: true }
    }],
    grandTotal: { type: Number, required: true },
    purpose: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('InventoryCheckout', inventoryCheckoutSchema);
