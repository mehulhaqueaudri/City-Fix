// backend/routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const { getInventory, addMaterial, updateStock } = require('../controllers/inventoryController');

router.get('/', getInventory);
router.post('/', addMaterial);
router.put('/:id', updateStock);

module.exports = router;