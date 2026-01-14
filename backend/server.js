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

// ✅ Trust proxy (REQUIRED for secure cookies on Render)
app.set('trust proxy', 1);

// =======================
// Socket.io setup
// =======================
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// =======================
// GLOBAL MIDDLEWARE
// =======================

// ✅ CORS — hardened, production-safe
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Body parser
app.use(express.json());

// ✅ cookie-parser MUST be BEFORE routes (YOU DID THIS RIGHT)
app.use(cookieParser());

// =======================
// Database connection
// =======================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// =======================
// Socket.io logic
// =======================
const connectedUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    connectedUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} joined room with socket ${socket.id}`);
    console.log(`📊 Total connected users: ${connectedUsers.size}`);
  });

  socket.on('disconnect', () => {
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

// Make io accessible in routes
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// =======================
// ROUTES
// =======================

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Gigflow Backend API is running!',
    status: 'success',
    timestamp: new Date().toISOString(),
    endpoints: {
      test: '/api/test',
      auth: '/api/auth',
      gigs: '/api/gigs',
      bids: '/api/bids'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is running!',
    connectedUsers: connectedUsers.size,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Debug cookies (VERY USEFUL)
app.get('/api/debug/cookies', (req, res) => {
  res.json({
    cookies: req.cookies,
    headers: req.headers.cookie
  });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gigs', require('./routes/gigs'));
app.use('/api/bids', require('./routes/bids'));

// =======================
// 404 HANDLER (Node 22 safe)
// =======================
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    requestedPath: req.originalUrl
  });
});

// =======================
// ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// =======================
// SERVER START
// =======================
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.io ready for connections`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
