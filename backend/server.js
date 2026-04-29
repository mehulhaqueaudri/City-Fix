require('dotenv').config(); 
console.log("TESTING CLOUDINARY CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import all your routes
const ticketRoutes = require('./routes/ticketRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const workerRoutes = require('./routes/workerRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const inventoryRoutes = require('./routes/inventoryRoutes'); // <-- UNCOMMENTED!

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to local MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/cityfix')
  .then(() => console.log("MongoDB Connected successfully"))
  .catch(err => console.log(err));

// Tell the app to use your routes
app.use('/api/tickets', ticketRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/workers', workerRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/inventory', inventoryRoutes); // <-- UNCOMMENTED!
app.use('/api/system', require('./routes/systemRoutes'));


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));