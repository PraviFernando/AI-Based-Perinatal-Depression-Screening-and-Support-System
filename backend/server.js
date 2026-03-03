const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8073;

// Middleware
app.use(cors({ 
  origin: 'http://localhost:3000', // change to your actual frontend URL in production
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Optional debug: see what DNS Node is actually using
console.log('Active DNS servers:', dns.getServers());

// MongoDB Connection
const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  console.error('MONGODB_URL is missing from .env');
  process.exit(1);
}

mongoose.connect(MONGODB_URL)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
const userRouter = require('./routes/user');
app.use('/user', userRouter);

// Example protected route
app.get('/protected', (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const jwt = require('jsonwebtoken'); // ← add this if not already required globally
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: 'Protected data', userId: decoded.id, role: decoded.role });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});