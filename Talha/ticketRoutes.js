require('dotenv').config(); 

const express = require('express');
const router = express.Router();

########################################
// IMPORT TICKET CONTROLLER FUNCTIONS USED FOR ASSIGNMENT, STATUS, REJECTION, FORCE ASSIGN
########################################

const { 
    createTicket, 
    getUserTickets, 
    getAllTickets, 
    updateTicketStatus, 
    upvoteTicket, 
    logMaterialsUsed, 
    addComment, 
    rateTicket,
    rejectTask, 
    adminAssignTicket 
} = require('../controllers/ticketController');

########################################
// CREATE REPORT ROUTE
// USED FOR AUTO-ASSIGNMENT WHEN CITIZEN SUBMITS ISSUE
########################################

router.post('/', upload.single('image'), createTicket);

########################################
// GET ALL TICKETS
// USED BY WORKER DASHBOARD AND ADMIN DASHBOARD
########################################

router.get('/', getAllTickets);

########################################
// WORKER STATUS UPDATE ROUTE
########################################

router.put('/:id/status', updateTicketStatus);

########################################
// WORKER REJECT / REMOVE TASK ROUTE
########################################

router.put('/:id/reject', rejectTask);

########################################
// ADMIN FORCE-ASSIGN ROUTE
########################################

router.put('/:id/admin-assign', adminAssignTicket);

module.exports = router;
