const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const profileRoutes = require('./routes/profile');
const albumRoutes = require('./routes/albums');
const imageRoutes = require('./routes/images');
const customLinksRoutes = require('./routes/customLinks');
const bookingsRoutes = require('./routes/bookings');

const app = express();
// In Docker, PORT is 5000 (mapped to 5002 externally)
// For local development, default to 5002
const PORT = process.env.PORT || 5002;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allowed origins: localhost for development + Vercel domains for production
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000',
      'http://localhost:5001',
      'http://localhost:5002',
      'https://portbox-y.vercel.app',
      'https://*.vercel.app' // Allow all Vercel preview deployments
    ];
    
    // Check if origin matches any allowed origin (supports wildcards)
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        // Handle wildcard: *.vercel.app
        const pattern = allowed.replace('*', '.*');
        const regex = new RegExp(`^https://${pattern}$`);
        return regex.test(origin);
      }
      return allowed === origin;
    });
    
    // Also allow any Vercel preview deployment
    if (!isAllowed && origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  preflightContinue: false
};
app.use(cors(corsOptions));

// Security middleware (configured to allow images)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:5002", "https://*.supabase.co", "https://*.vercel.app"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// Rate limiting (more lenient for development)
const isDevelopment = process.env.NODE_ENV !== 'production';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // Higher limit for development, lower for production
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded images) with CORS headers
app.use('/uploads', (req, res, next) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000',
      'http://localhost:5001',
      'http://localhost:5002',
      'https://portbox-y.vercel.app'
    ];
    
    // Check if origin is allowed (including Vercel preview deployments)
    const isAllowed = origin && (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    );
    
    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    }
    return res.status(204).end();
  }
  
  // Set CORS headers for static files
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5000',
    'http://localhost:5001',
    'http://localhost:5002',
    'https://portbox-y.vercel.app'
  ];
  
  // Check if origin is allowed (including Vercel preview deployments)
  const isAllowed = origin && (
    allowedOrigins.includes(origin) ||
    origin.endsWith('.vercel.app')
  );
  
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Cache control for images
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  
  next();
}, express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/me', profileRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/custom-links', customLinksRoutes);
app.use('/api/bookings', bookingsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB (optional - albums API uses Supabase)
    try {
      await connectDB();
    } catch (dbError) {
      console.warn('⚠️  MongoDB connection failed (albums API uses Supabase, so this is OK):', dbError.message);
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`📁 Portfolio API: http://localhost:${PORT}/api/portfolios`);
      console.log(`🖼️  Albums API: http://localhost:${PORT}/api/albums`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer(); 