const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// 🧠 Import ALL functions from the controller
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

// Cloudinary Image Storage Configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'cityfix_issues',
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
});
const upload = multer({ storage });

// ==========================================
// TICKET API ROUTES
// ==========================================

// Create a new report with a photo
router.post('/', upload.single('image'), createTicket);

// Get tickets
router.get('/', getAllTickets);
router.get('/user/:userId', getUserTickets);

// Update/Interact with tickets
router.put('/:id/status', updateTicketStatus);
router.put('/:id/upvote', upvoteTicket);
router.put('/:id/materials', logMaterialsUsed);
router.post('/:id/comments', addComment);
router.put('/:id/rate', rateTicket);

// 🧠 NEW: Smart Dispatch & Mayor Override Routes
router.put('/:id/reject', rejectTask);
router.put('/:id/admin-assign', adminAssignTicket);

module.exports = router;