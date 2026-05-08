const express = require('express');
const router = express.Router();
const {
  createTicket,
  getAllTickets,
  upvoteTicket
} = require('../controllers/ticketController');

router.post('/', upload.single('image'), createTicket);
router.get('/', getAllTickets);
router.put('/:id/upvote', upvoteTicket);

module.exports = router;