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
    status: { type: String, default: 'Pending' },
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
    assignedWorkerName: { type: String, default: 'Unassigned' },
    resolutionRating: { type: Number, min: 1, max: 5 },

    // 🧠 NEW SMART ROUTING FIELDS
    rejectedBy: [{ type: String }], // Keeps track of workers who removed this task
    isMayorAssigned: { type: Boolean, default: false }, // Locks the task to the worker if assigned by Admin
    
    // 🌟 FEATURE 4: DYNAMIC PRIORITY
    priorityScore: { type: Number, default: 0 } 

}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);