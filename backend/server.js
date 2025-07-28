const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting - More lenient in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 requests in dev, 100 in production
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://glamazonskin.com', 'https://www.glamazonskin.com', 'https://glamazonskin.vercel.app']
    : ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const aiChatRoutes = require('./routes/ai-chat');
const invoiceRoutes = require('./routes/invoices');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/invoices', invoiceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error', 
      details: err.message 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid or expired token' 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: 'The requested resource was not found' 
  });
});

// Initialize database and start server
const fs = require('fs');
const reminderService = require('./services/reminderService');

async function startServer() {
  try {
    // Check if database file exists and skip init if it does
    const dbPath = path.join(__dirname, 'olga_skincare.db');
    const dbExists = fs.existsSync(dbPath);
    
    if (!dbExists) {
      console.log('Database file not found, initializing...');
      const initDatabase = require('./database/init');
      await initDatabase();
      console.log('Database initialized successfully');
    } else {
      console.log('Database file exists, skipping initialization');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      
      // Start the reminder service
      setTimeout(() => {
        reminderService.start();
      }, 5000); // Start after 5 seconds to allow server to fully initialize
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app; 