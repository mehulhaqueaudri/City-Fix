require('dotenv').config(); 
console.log("TESTING CLOUDINARY CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const Ticket = require('./models/Ticket'); 

const ticketRoutes = require('./routes/ticketRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const workerRoutes = require('./routes/workerRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const inventoryRoutes = require('./routes/inventoryRoutes'); 
const systemRoutes = require('./routes/systemRoutes'); // 🌟 NEW: Import system routes

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/cityfix')
  .then(() => console.log("MongoDB Connected successfully"))
  .catch(err => console.log(err));

cron.schedule('0 0 * * *', async () => {
    console.log('⏳ Running daily priority score calculation...');
    try {
        const tickets = await Ticket.find({ status: { $in: ['Pending', 'Assigned', 'In Progress'] } });
        
        for (const ticket of tickets) {
            let score = 0;
            
            // 🌟 NEW LOGIC: Respecting the exact base scores (20/30/40)
            if (ticket.severity === 'High') score += 40;
            else if (ticket.severity === 'Medium') score += 30;
            else score += 20;
            
            // 🌟 NEW LOGIC: 10 points per upvote
            score += (ticket.upvotedBy.length * 10);
            
            // Age bonus (2 points for every day since creation)
            const daysOld = Math.floor((Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60 * 24));
            score += (daysOld * 2);
            
            ticket.priorityScore = score;
            await ticket.save();
        }
        console.log(`✅ Daily priority scores updated for ${tickets.length} tickets.`);
    } catch (error) {
        console.error('❌ Error updating priority scores:', error);
    }
});

app.use('/api/tickets', ticketRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/workers', workerRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/inventory', inventoryRoutes); 
app.use('/api/system', systemRoutes); // 🌟 NEW: Mount system routes

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));