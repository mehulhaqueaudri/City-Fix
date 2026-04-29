const express = require('express');
const router = express.Router();

// 🧠 Import ALL functions from the controller
const { 
    getWorkerStatus, 
    getAllWorkers, 
    toggleWorkerStatus 
} = require('../controllers/workerController');

// ==========================================
// WORKER API ROUTES
// ==========================================

// Get a specific worker's status
router.get('/status', getWorkerStatus);

// 🧠 NEW: Fetch the full roster of workers (Used by Admin Dashboard)
router.get('/', getAllWorkers);

// Toggle a worker's shift (Clock In / Clock Out)
router.put('/:id/toggle', toggleWorkerStatus);

module.exports = router;