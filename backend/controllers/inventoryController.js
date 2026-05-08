// backend/controllers/inventoryController.js
const Inventory = require('../models/Inventory');
const InventoryCheckout = require('../models/InventoryCheckout');

// @desc    Get all inventory items
// @route   GET /api/inventory
const getInventory = async (req, res) => {
    try {
        const items = await Inventory.find().sort({ itemName: 1 });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new material to the warehouse
// @route   POST /api/inventory
const addMaterial = async (req, res) => {
    try {
        const { itemName, quantity, costPerUnit } = req.body;
        
        // Basic validation
        if (!itemName || quantity === undefined || costPerUnit === undefined) {
            return res.status(400).json({ message: "Please provide itemName, quantity, and costPerUnit." });
        }

        // Convert to numbers just in case the frontend sent them as strings
        const qty = Number(quantity);
        const cost = Number(costPerUnit);

        // 1. Check if an item with the EXACT same name (case-insensitive) AND same cost exists
        const existingItem = await Inventory.findOne({ 
            itemName: { $regex: new RegExp(`^${itemName}$`, 'i') }, 
            costPerUnit: cost 
        });

        if (existingItem) {
            // Same Name AND Same Price -> Add to existing quantity
            existingItem.quantity += qty;
            await existingItem.save();
            return res.status(200).json(existingItem);
        } else {
            // Different Name OR Same Name but Different Price -> Create new row
            // We store the original case the user typed (e.g., "cement" or "Cement")
            const newItem = await Inventory.create({ 
                itemName, 
                quantity: qty, 
                costPerUnit: cost 
            });
            return res.status(201).json(newItem);
        }
    } catch (error) {
        console.error("Error adding material:", error);
        res.status(500).json({ message: "Server error while saving material.", error: error.message });
    }
};

// @desc    Update stock (add/remove quantity)
// @route   PUT /api/inventory/:id
const updateStock = async (req, res) => {
    try {
        const { quantityUsed } = req.body; 
        const item = await Inventory.findById(req.params.id);

        if (!item) return res.status(404).json({ message: 'Item not found' });

        item.quantity = item.quantity - quantityUsed;
        await item.save();

        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🌟 FEATURE 14: Update the custom alarm threshold for an item
// @route   PUT /api/inventory/:id/threshold
const updateThreshold = async (req, res) => {
    try {
        const { alarmThreshold } = req.body;
        const item = await Inventory.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        item.alarmThreshold = Number(alarmThreshold);
        await item.save();
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

<<<<<<< Updated upstream
// 🌟 FEATURE: Standalone Inventory Checkout by Workers
// @desc    Worker checks out materials from the warehouse (with total cost)
// @route   POST /api/inventory/checkout
const checkoutMaterial = async (req, res) => {
    try {
        const { workerName, items, purpose } = req.body;

        if (!workerName || !items || items.length === 0) {
            return res.status(400).json({ message: "Please provide workerName and at least one item." });
        }

        let grandTotal = 0;
        const processedItems = [];

        for (const entry of items) {
            const item = await Inventory.findById(entry.inventoryId);
            if (!item) return res.status(404).json({ message: `Item not found: ${entry.inventoryId}` });
            if (item.quantity < entry.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${item.itemName}. Available: ${item.quantity}` });
            }

            const totalCost = entry.quantity * item.costPerUnit;
            grandTotal += totalCost;

            // Deduct from inventory
            item.quantity -= entry.quantity;
            await item.save();

            processedItems.push({
                inventoryId: item._id,
                itemName: item.itemName,
                quantity: entry.quantity,
                costPerUnit: item.costPerUnit,
                totalCost: totalCost
            });
        }

        const checkout = await InventoryCheckout.create({
            workerName,
            items: processedItems,
            grandTotal,
            purpose: purpose || ''
        });

        res.status(201).json(checkout);
    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).json({ message: "Server error during checkout.", error: error.message });
    }
};

// @desc    Get all checkout history
// @route   GET /api/inventory/checkouts
const getCheckoutHistory = async (req, res) => {
    try {
        const checkouts = await InventoryCheckout.find().sort({ createdAt: -1 });
        res.status(200).json(checkouts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export ALL functions including the new ones
module.exports = { getInventory, addMaterial, updateStock, updateThreshold, checkoutMaterial, getCheckoutHistory };
