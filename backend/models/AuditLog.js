const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    ticketTitle: { type: String, required: true },
    changedBy: { type: String, required: true }, // The name of the Worker or Mayor
    oldStatus: { type: String, required: true },
    newStatus: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);