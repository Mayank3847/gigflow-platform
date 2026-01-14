const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup with proper CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Socket.io connection handling
const connectedUsers = new Map(); // Store userId -> socketId mapping

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // User joins their personal room
  socket.on('join', (userId) => {
    socket.join(userId);
    connectedUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} joined room with socket ${socket.id}`);
    console.log(`📊 Total connected users: ${connectedUsers.size}`);
  });

  socket.on('disconnect', () => {
    // Remove user from connected users
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Test route to check if server is running
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    connectedUsers: connectedUsers.size 
  });
});
// Debug endpoint - check cookies
app.get('/api/debug/cookies', (req, res) => {
  res.json({
    cookies: req.cookies,
    headers: req.headers.cookie
  });
});
// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gigs', require('./routes/gigs'));
app.use('/api/bids', require('./routes/bids'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.io ready for connections`);
});