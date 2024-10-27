const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'RX6ZVE1OHfczBvEx7mTpdI1bbBkX8ojfMRtYC7VTByA=';

// Route for registering new admin (user creation)
router.post('/create-admin', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Salt and hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    // Save the new user in the database
    await newUser.save();

    // Create a JWT token
    const payload = {
      user: {
        id: newUser.id,
        username: newUser.username,
      },
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // Send success response with the JWT token
    res.status(201).json({ message: 'Admin user created successfully', token });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the submitted password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create a JWT token
    const payload = {
      user: {
        id: user.id,
        username: user.username,
      },
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // Send success response with the JWT token
    res.status(200).json({ message: 'Login successful', token, usertype: user.usertype, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Error during login', error: err.message });
  }
});

router.post('/signup', async (req, res) => {
  const { username, email, password, usertype } = req.body;
  console.log(req.body);

  // Validate user type (ensure it's either "admin" or "member")
  if (!['admin', 'Member'].includes(usertype)) {
    return res.status(400).json({ message: 'Invalid user type' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new admin/member
    user = new User({
      username,
      email,
      password,
      usertype, // Save usertype in the database
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user to the database
    await user.save();

    // Create a JWT token
    const payload = {
      user: {
        id: user.id,
        usertype: user.usertype, // Include usertype in the token
      },
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Send success response with the JWT token
    console.log('User created successfully');
    res.status(201).json({ message: 'User created successfully', token, usertype: user.usertype });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
