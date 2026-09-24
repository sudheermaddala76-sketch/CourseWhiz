const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
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
        const { email, password, firebaseToken } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user exists
        let user = await User.findOne({ email: normalizedEmail });
        
        // If user exists in Firebase but not in MongoDB, create record
        if (!user && firebaseToken) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user = new User({
                name: normalizedEmail.split('@')[0],
                email: normalizedEmail,
                password: hashedPassword
            });
            await user.save();
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Validate password
        let isMatch = false;
        if (user.password) {
            isMatch = await bcrypt.compare(password, user.password);
        }

        if (!isMatch) {
            // If password doesn't match MongoDB, but Firebase verified it (e.g. password was reset), sync new password
            if (firebaseToken) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
                await user.save();
            } else {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }
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
