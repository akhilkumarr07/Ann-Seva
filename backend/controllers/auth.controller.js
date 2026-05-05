require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

// Register User
const registerHandler = async (req, res) => {
  const { name, phone, password, email, role, location } = req.body;

  if (!name || !phone || !password || !role) {
    return res.status(400).json({ message: 'Name, phone, password, and role are required' });
  }

  if (!location || !location.lat || !location.long) {
    return res.status(400).json({ message: 'Location (lat & long) is required' });
  }

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({ message: 'Phone number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = role === 'admin';
    const user = new User({ name, phone, password: hashedPassword, email: email || '', role, location, isAdmin });
    await user.save();

    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '5h' });
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user,
      redirectUrl: `/${role}`,
    });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ message: 'Failed to register user' });
  }
};

// Login
const loginHandler = async (req, res) => {
  const { phone, password, role } = req.body;

  if (!password || !role) {
    return res.status(400).json({ message: 'Password and role are required' });
  }

  try {
    let user;
    if (role === 'admin') {
      if (phone !== 'Abhi242') {
        return res.status(401).json({ message: 'Invalid admin username' });
      }
      // Find the single creator admin by role instead of phone
      user = await User.findOne({ role: 'admin', isAdmin: true });
      if (!user) return res.status(404).json({ message: 'Admin user not found in database.' });
    } else {
      if (!phone) return res.status(400).json({ message: 'Phone number is required' });
      user = await User.findOne({ phone });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found. Please register first.' });
      }
      
      if (user.role !== role) {
        return res.status(401).json({ message: `Unauthorized. You are not registered as a ${role}.` });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '5h' }
    );

    let redirectUrl = '/';
    if (user.isAdmin) {
      redirectUrl = '/admin';
    } else if (user.role === 'donor') {
      redirectUrl = '/donor';
    } else if (user.role === 'receiver') {
      redirectUrl = '/receiver';
    } else if (user.role === 'volunteer') {
      redirectUrl = '/volunteer';
    }

    res.status(200).json({ message: 'Login successful', token, user, redirectUrl });
  } catch (error) {
    console.error('Error in loginHandler:', error.message);
    res.status(500).json({ message: 'Failed to login' });
  }
};

module.exports = { registerHandler, loginHandler };
