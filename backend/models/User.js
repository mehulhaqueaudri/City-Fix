const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Citizen', 'Dispatcher', 'Worker', 'Admin'], default: 'Citizen' }
});

module.exports = mongoose.model('User', userSchema);

