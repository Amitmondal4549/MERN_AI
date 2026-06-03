require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

require('./conn');
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

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://smartresumematch.netlify.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Vary', 'Origin');
  }
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

const UserRoutes = require('./Routes/user');
const ResumeRoutes = require('./Routes/resume');

app.use('/api/user', authLimiter, UserRoutes)
app.use('/api/resume', ResumeRoutes)

// server static files from the React app's build folder
app.use(express.static(path.join(__dirname, "build")));

// Handle React routing — return index.html for all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const errorHandler = require('./utils/errorHandler');
app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Backend running on port", PORT)
})