// server.js - Complete Production-Ready Configuration
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

// ✅ REQUIRED for secure cookies behind Render proxy
app.set('trust proxy', 1);

// =======================
// ALLOWED ORIGINS (DEV + PROD)
// =======================
const allowedOrigins = [
  process.env.CLIENT_URL,        // Netlify/Vercel Production
  'http://localhost:5173',       // Local Vite dev
  'http://localhost:3000',       // Local React dev
  'http://localhost:5174',       // Backup Vite port
].filter(Boolean); // Remove undefined values

console.log('✅ Allowed origins:', allowedOrigins);

// =======================
// Socket.io setup
// =======================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'], // Support both transports
  allowEIO3: true // Support older clients
});

// =======================
// GLOBAL MIDDLEWARE
// =======================

// ✅ CORRECT CORS SETUP (handles preflight automatically)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser clients (Postman, server-to-server, mobile apps)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin (non-browser client)');
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Allowing request from:', origin);
      return callback(null, true);
    }

    console.log('❌ CORS: Blocking request from:', origin);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true, // CRITICAL: Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));

// ❌ REMOVED - causes issues with Node 22
// app.options('*', cors());
// The cors() middleware above already handles OPTIONS requests

// Body parser - Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser MUST be before routes - CRITICAL for authentication
app.use(cookieParser());

// =======================
// Database connection
// =======================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit if DB connection fails
  });

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// =======================
// Socket.io logic
// =======================
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Join user-specific room
  socket.on('join', (userId) => {
    socket.join(userId);
    connectedUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} joined room with socket ${socket.id}`);
    console.log(`📊 Total connected users: ${connectedUsers.size}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
    console.log('❌ User disconnected:', socket.id);
    console.log(`📊 Remaining connected users: ${connectedUsers.size}`);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

// Make io and connectedUsers accessible to routes
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// =======================
// ROUTES
// =======================

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 GigFlow Backend API is running!',
    status: 'success',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      test: '/api/test',
      auth: '/api/auth (register, login, logout, me)',
      gigs: '/api/gigs',
      bids: '/api/bids',
      health: '/health',
      debug: '/api/debug/cookies'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    connectedUsers: connectedUsers.size
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is running!',
    connectedUsers: connectedUsers.size,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Debug cookies endpoint
app.get('/api/debug/cookies', (req, res) => {
  res.json({
    cookies: req.cookies,
    rawCookieHeader: req.headers.cookie,
    hasToken: !!req.cookies.token,
    allHeaders: req.headers
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
  console.log('❌ 404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({
    message: 'Route not found',
    requestedPath: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// =======================
// GLOBAL ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err.message);
  console.error('Stack:', err.stack);
  
  // Handle CORS errors specifically
  if (err.message && err.message.includes('CORS blocked')) {
    return res.status(403).json({
      message: 'CORS policy violation',
      error: err.message,
      origin: req.headers.origin
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      error: err.message
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token',
      error: err.message
    });
  }

  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      message: 'Database error',
      error: process.env.NODE_ENV === 'production' ? 'Database operation failed' : err.message
    });
  }
  
  // Generic error response
  res.status(err.status || 500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// =======================
// GRACEFUL SHUTDOWN
// =======================
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('🔴 Server closed');
    mongoose.connection.close(false, () => {
      console.log('🔴 MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('🔴 Server closed');
    mongoose.connection.close(false, () => {
      console.log('🔴 MongoDB connection closed');
      process.exit(0);
    });
  });
});

// =======================
// SERVER START
// =======================
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`🚀 GigFlow Backend Server Started`);
  console.log('='.repeat(50));
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🔌 Socket.io ready for connections`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Allowed origins:`, allowedOrigins);
  console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log('='.repeat(50));
});

module.exports = { app, server, io };