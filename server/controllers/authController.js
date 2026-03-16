const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // Create JWT token
        const payload = {
            user: {
                id: newUser.id
            }
        };

        const tokenSecret = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only';
        
        jwt.sign(
            payload,
            tokenSecret,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    token,
                    user: {
                        id: newUser.id,
                        name: newUser.name,
                        email: newUser.email,
                        points: newUser.points
                    }
                });
            }
        );

    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).send('Server Error');
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Create JWT token
        const payload = {
            user: {
                id: user.id
            }
        };

        const tokenSecret = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only';

        jwt.sign(
            payload,
            tokenSecret,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        points: user.points
                    }
                });
            }
        );

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).send('Server Error');
    }
};

// Update user points
exports.updatePoints = async (req, res) => {
    try {
        const { userId, pointsToAdd } = req.body;

        if (!userId || typeof pointsToAdd !== 'number') {
            return res.status(400).json({ message: 'Missing userId or pointsToAdd' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.points = (user.points || 0) + pointsToAdd;
        await user.save();

        res.json({
            message: 'Points updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                points: user.points
            }
        });
    } catch (error) {
        console.error('Update points error:', error.message);
        res.status(500).send('Server Error');
    }
};
