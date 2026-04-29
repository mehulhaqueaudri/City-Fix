const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Worker = require('../models/Worker'); // NEW: Import Worker Model

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

// @desc    Register new citizen
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email, password: hashedPassword });

        if (user) {
            res.status(201).json({
                _id: user.id, name: user.name, email: user.email, role: 'citizen', token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register new Worker
// @route   POST /api/auth/worker/register
const registerWorker = async (req, res) => {
    try {
        const { name, email, password, wardNumber } = req.body;

        if (!name || !email || !password || !wardNumber) {
            return res.status(400).json({ message: 'Please add all fields' });
        }

        const workerExists = await Worker.findOne({ email });
        if (workerExists) {
            return res.status(400).json({ message: 'Worker already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const worker = await Worker.create({
            name, email, password: hashedPassword, wardNumber, status: 'Available'
        });

        if (worker) {
            res.status(201).json({
                _id: worker.id, name: worker.name, email: worker.email, role: 'worker', wardNumber: worker.wardNumber, token: generateToken(worker._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid worker data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate ANY user (Citizen or Worker)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if they are a Citizen
        let account = await User.findOne({ email });
        let role = 'citizen';

        // 2. If not a Citizen, check if they are a Worker
        if (!account) {
            account = await Worker.findOne({ email });
            role = 'worker';
        }

        // 3. Verify password
        if (account && (await bcrypt.compare(password, account.password))) {
            res.json({
                _id: account.id,
                name: account.name,
                email: account.email,
                role: role, // Send the role to the frontend so it knows where to redirect
                wardNumber: account.wardNumber || null,
                token: generateToken(account._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, registerWorker, loginUser };