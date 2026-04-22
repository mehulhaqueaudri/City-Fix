const express = require('express');
const router = express.Router();

// Import our controller functions
const { getTickets, createTicket, deleteTicket } = require('../controllers/ticketController');

// Map the routes to the controller functions
router.get('/', getTickets);
router.post('/', createTicket);
router.delete('/:id', deleteTicket);

module.exports = router;