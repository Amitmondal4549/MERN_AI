require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const crypto = require('crypto');
const connectDB = require('./conn');

const app = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN;

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://smartresumematch.netlify.app",
  "https://resumematchscore.netlify.app",
  "https://beautiful-acceptance-production-4c1d.up.railway.app",
  ...(CORS_ORIGIN ? CORS_ORIGIN.split(',').map(s => s.trim()) : []),
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(helmet());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use((req, res, next) => {
  req.requestId = crypto.randomBytes(4).toString('hex');
  res.set('X-Request-Id', req.requestId);
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later' },
});

// health-check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    mongodb: mongoose && mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    firebase: !!process.env.FIREBASE_PRIVATE_KEY ? 'configured' : 'not configured',
  });
});

const UserRoutes = require('./Routes/user');
const ResumeRoutes = require('./Routes/resume');

app.use('/api/user', authLimiter, UserRoutes)
app.use('/api/resume', ResumeRoutes)

const buildPath = path.join(__dirname, "build");

// server static files from the React app's build folder (if it exists)
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));

  // Handle React routing — return index.html for all other non-API requests
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
} else {
  console.warn("⚠  Build folder not found at:", buildPath);
  console.warn("   Static file serving is disabled. Run the frontend build to enable it.");
}

const errorHandler = require('./utils/errorHandler');
app.use(errorHandler);

async function start() {
  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("✓ Created uploads directory");
  }

  // Validate required env vars
  const requiredVars = ['MONGO_URI', 'COHERE_API_KEY'];
  const missingVars = requiredVars.filter(v => !process.env[v]);
  if (missingVars.length > 0) {
    console.warn("⚠  Missing environment variables:", missingVars.join(', '));
    console.warn("   Some features may not work correctly.");
  }

  // Connect to MongoDB
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log("✓ Backend server is running on port " + PORT);
    console.log("   Environment: " + NODE_ENV);
    console.log("   Health check: http://localhost:" + PORT + "/api/health");
    console.log("   Ready for Railway deployment ✅");
  });
}

start().catch(err => {
  console.error("✗ Failed to start server:", err.message);
  process.exit(1);
});