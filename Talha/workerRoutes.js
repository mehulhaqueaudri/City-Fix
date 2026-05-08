const express = require('express');
const router = express.Router();

########################################
// IMPORT WORKER CONTROLLER FUNCTIONS
########################################

const { 
    getWorkerStatus, 
    getAllWorkers, 
    toggleWorkerStatus 
} = require('../controllers/workerController');

########################################
// GET ALL WORKERS
// USED BY ADMIN DASHBOARD FORCE-ASSIGN DROPDOWN
########################################

router.get('/', getAllWorkers);

########################################
// WORKER CLOCK IN / CLOCK OUT
// ALSO ASSIGNS WAITING PENDING TICKETS WHEN WORKER BECOMES AVAILABLE
########################################

router.put('/:id/toggle', toggleWorkerStatus);

module.exports = router;
