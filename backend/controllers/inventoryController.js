// backend/controllers/inventoryController.js
const Inventory = require('../models/Inventory');

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

module.exports = { getInventory, addMaterial, updateStock };