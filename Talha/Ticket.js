const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    user: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    wardNumber: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    severity: { type: String, default: 'Low' },
    imageUrl: { type: String },

########################################
// TICKET STATUS FIELD USED FOR ASSIGNMENT, WORKFLOW, SLA, ADMIN VIEW
########################################

    status: { type: String, default: 'Pending' },

########################################
// WORKER ASSIGNMENT FIELD
########################################

    assignedWorkerName: { type: String, default: 'Unassigned' },

########################################
// WORKER REJECTION / REASSIGNMENT FIELD
########################################

    rejectedBy: [{ type: String }],

########################################
// ADMIN FORCE-ASSIGN LOCK FIELD
########################################

    isMayorAssigned: { type: Boolean, default: false },

########################################
// EXTRA FIELDS USED BY DASHBOARDS AND WORKFLOW
########################################

    upvotedBy: [{ type: String }],

    materialsUsed: [{ 
        itemName: String, 
        quantity: Number, 
        cost: Number 
    }],

    totalCost: { type: Number, default: 0 },

    comments: [{ 
        senderName: String, 
        text: String 
    }],

    resolutionRating: { type: Number, min: 1, max: 5 },

    priorityScore: { type: Number, default: 0 } 

}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
