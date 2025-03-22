require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Atlas Connection
mongoose.connect('mongodb+srv://abiramimuthukumar05:admin@movie.gdl8h.mongodb.net/MovieDB?retryWrites=true&w=majority&appName=movie', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Define MongoDB Schema and Models
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    movie: { type: String, required: true },
    date: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// Routes
// 1. Sign-in route
app.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user in database
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        
        // Simple password check (no encryption here as requested)
        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        
        res.status(200).json({ message: 'Sign in successful', user: { name: user.name, email: user.email } });
    } catch (error) {
        console.error('Sign in error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 2. Sign-up route
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Create new user
        const newUser = new User({
            name,
            email,
            password // Note: In a real app, this should be hashed
        });
        
        await newUser.save();
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Sign up error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 3. Booking route
app.post('/book', async (req, res) => {
    try {
        const { name, email, phone, movie, date } = req.body;
        
        // Create new booking
        const newBooking = new Booking({
            name,
            email,
            phone,
            movie,
            date
        });
        
        await newBooking.save();
        
        res.status(201).json({ message: 'Booking successful' });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});