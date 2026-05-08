const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  wardNumber: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  severity: { type: String, default: 'Low' },
  status: { type: String, default: 'Pending' },
  upvotedBy: [{ type: String }],
  priorityScore: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);