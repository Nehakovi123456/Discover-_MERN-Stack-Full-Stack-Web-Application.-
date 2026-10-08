
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; 

router.post('/register', async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ 
            username, 
            email, 
            phone, 
            password: hashedPassword 
        });
        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ 
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone,
                avatar: newUser.avatar
            }
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});


router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, phone, avatar } = req.body;

    if (!username || !email || !phone) {
      return res.status(400).json({ message: 'Username, email, and phone are required.' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.username = username;
    user.email = email;
    user.phone = phone;

    if (avatar) {
      user.avatar = avatar;  
    }

    await user.save();
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});


router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "No user found with that email" });
        }

        const resetToken = bcrypt.hashSync(Math.random().toString(36).slice(2), 10);  
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; 
        await user.save();

        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS, 
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request',
            text: `Hello ${user.username},\n\nWe received a request to reset your password. Please click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
        };

        await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error); 
                return res.status(500).json({ error: "Error sending password reset email" });
            } else {
                console.log("Email sent: " + info.response); 
                res.status(200).json({ message: "Password reset email sent" });
            }
        });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ error: "Something went wrong. Please try again later." });
    }
});

router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ error: "New password is required" });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        if (user.resetPasswordToken !== token) {
            return res.status(400).json({ error: "Invalid token" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password has been successfully reset" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ error: "Something went wrong. Please try again later." });
    }
});


module.exports = router;