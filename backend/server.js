// server.js - Node 22 Compatible Version with CORS Fix
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
// ALLOWED ORIGINS
// =======================
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',      // Vite dev server
  'http://localhost:4173',      // ✅ FIXED: Added Vite preview server
  'http://localhost:3000',      // Common dev port
  'http://localhost:5174',      // Alternative dev port
  'https://gigflow-platform-ms7295.netlify.app',  // Production
].filter(Boolean);

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
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// =======================
// CORS MIDDLEWARE - Node 22 Compatible
// =======================
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Allowing request from:', origin);
      return callback(null, true);
    }
    console.log('❌ CORS: Blocking request from:', origin);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// ❌ REMOVED - This line causes the error in Node 22
// app.options('*', cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Request logger
app.use((req, res, next) => {
  console.log(`🔥 ${req.method} ${req.path}`);
  next();
});

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
    process.exit(1);
  });

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

  socket.on('join', (userId) => {
    if (!userId) return;
    socket.join(userId);
    connectedUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} joined room`);
    console.log(`📊 Total users: ${connectedUsers.size}`);
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });

  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

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
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      test: '/api/test',
      auth: '/api/auth',
      gigs: '/api/gigs',
      bids: '/api/bids',
      health: '/health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    connectedUsers: connectedUsers.size
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is running!',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gigs', require('./routes/gigs'));
app.use('/api/bids', require('./routes/bids'));

// =======================
// 404 HANDLER
// =======================
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// =======================
// ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  if (err.message && err.message.includes('CORS blocked')) {
    return res.status(403).json({
      message: 'CORS policy violation',
      error: err.message
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      error: err.message
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }
  
  res.status(err.status || 500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// =======================
// GRACEFUL SHUTDOWN
// =======================
const shutdown = (signal) => {
  console.log(`\n👋 ${signal} - Shutting down...`);
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('🔴 Server closed');
      process.exit(0);
    });
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// =======================
// SERVER START
// =======================
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('🚀 GigFlow Backend Server Started');
  console.log('='.repeat(50));
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log(`🔗 Allowed Origins:`);
  allowedOrigins.forEach(origin => console.log(`   - ${origin}`));
  console.log('='.repeat(50));
});

module.exports = { app, server, io };