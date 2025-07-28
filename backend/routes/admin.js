const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const reminderService = require('../services/reminderService');

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', process.env.DB_NAME || 'olga_skincare.db');

// Get dashboard statistics
router.get('/dashboard', authenticateToken, requireAdmin, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.serialize(() => {
    const stats = {};
    let completed = 0;
    const total = 8;
    
    const checkComplete = () => {
      completed++;
      if (completed === total) {
        db.close();
        res.json(stats);
      }
    };
    
    // Total users
    db.get('SELECT COUNT(*) as total FROM users WHERE role = "customer"', (err, result) => {
      stats.totalUsers = err ? 0 : result.total;
      checkComplete();
    });
    
    // Total bookings
    db.get('SELECT COUNT(*) as total FROM bookings', (err, result) => {
      stats.totalBookings = err ? 0 : result.total;
      checkComplete();
    });
    
    // Total revenue from bookings
    db.get('SELECT SUM(total_amount) as revenue FROM bookings WHERE status = "completed"', (err, result) => {
      stats.bookingRevenue = err ? 0 : (result.revenue || 0);
      checkComplete();
    });
    
    // Total product orders
    db.get('SELECT COUNT(*) as total FROM orders', (err, result) => {
      stats.totalOrders = err ? 0 : result.total;
      checkComplete();
    });
    
    // Total revenue from products
    db.get('SELECT SUM(total_amount) as revenue FROM orders WHERE status = "confirmed"', (err, result) => {
      stats.productRevenue = err ? 0 : (result.revenue || 0);
      checkComplete();
    });
    
    // Recent bookings
    db.all(
      `SELECT b.*, s.name as service_name, u.first_name, u.last_name, u.email
       FROM bookings b 
       JOIN services s ON b.service_id = s.id 
       JOIN users u ON b.user_id = u.id 
       ORDER BY b.created_at DESC LIMIT 5`,
      (err, bookings) => {
        stats.recentBookings = err ? [] : bookings;
        checkComplete();
      }
    );
    
    // Recent orders
    db.all(
      `SELECT o.*, u.first_name, u.last_name, u.email
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC LIMIT 5`,
      (err, orders) => {
        stats.recentOrders = err ? [] : orders;
        checkComplete();
      }
    );
    
    // Monthly revenue trend (last 6 months)
    db.all(
      `SELECT 
         strftime('%Y-%m', appointment_date) as month,
         SUM(total_amount) as booking_revenue,
         COUNT(*) as booking_count
       FROM bookings 
       WHERE appointment_date >= date('now', '-6 months')
       GROUP BY strftime('%Y-%m', appointment_date)
       ORDER BY month`,
      (err, bookingTrend) => {
        stats.monthlyBookingTrend = err ? [] : bookingTrend;
        checkComplete();
      }
    );
  });
});

// Get all users
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const offset = (page - 1) * limit;
  const db = new sqlite3.Database(DB_PATH);
  
  let query = 'SELECT id, email, first_name, last_name, phone, role, created_at FROM users';
  let countQuery = 'SELECT COUNT(*) as total FROM users';
  const params = [];
  
  if (search) {
    const searchCondition = ' WHERE (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
    query += searchCondition;
    countQuery += searchCondition;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  // Get total count
  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Database error' });
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    // Get users
    db.all(query, params, (err, users) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        users,
        pagination: {
          total: countResult.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// Update user role
router.put('/users/:userId/role', authenticateToken, requireAdmin, (req, res) => {
  const { role } = req.body;
  const userId = req.params.userId;
  
  if (!['customer', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  
  const db = new sqlite3.Database(DB_PATH);
  
  db.run(
    'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [role, userId],
    function(err) {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to update user role' });
      }
      
      if (this.changes === 0) {
        db.close();
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Get updated user
      db.get(
        'SELECT id, email, first_name, last_name, phone, role FROM users WHERE id = ?',
        [userId],
        (err, user) => {
          db.close();
          
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          res.json({
            message: 'User role updated successfully',
            user
          });
        }
      );
    }
  );
});

// Get business settings
router.get('/settings', authenticateToken, requireAdmin, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.all('SELECT key, value FROM business_settings', (err, settings) => {
    db.close();
    
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Convert to object format
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.json(settingsObj);
  });
});

// Update business settings
router.put('/settings', authenticateToken, requireAdmin, (req, res) => {
  const settings = req.body;
  const db = new sqlite3.Database(DB_PATH);
  
  const updates = Object.entries(settings).map(([key, value]) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO business_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, value],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });
  
  Promise.all(updates)
    .then(() => {
      db.close();
      res.json({ message: 'Settings updated successfully' });
    })
    .catch((error) => {
      db.close();
      console.error('Settings update error:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    });
});

// Get business hours
router.get('/business-hours', authenticateToken, requireAdmin, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.all(
    'SELECT * FROM available_slots ORDER BY day_of_week',
    (err, slots) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json(slots);
    }
  );
});

// Update business hours
router.put('/business-hours', authenticateToken, requireAdmin, (req, res) => {
  const { slots } = req.body;
  const db = new sqlite3.Database(DB_PATH);
  
  // Clear existing slots
  db.run('DELETE FROM available_slots', (err) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Failed to clear existing slots' });
    }
    
    // Insert new slots
    const insertPromises = slots.map(slot => {
      return new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO available_slots (day_of_week, start_time, end_time, is_active) VALUES (?, ?, ?, ?)',
          [slot.day_of_week, slot.start_time, slot.end_time, slot.is_active ? 1 : 0],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    });
    
    Promise.all(insertPromises)
      .then(() => {
        db.close();
        res.json({ message: 'Business hours updated successfully' });
      })
      .catch((error) => {
        db.close();
        console.error('Business hours update error:', error);
        res.status(500).json({ error: 'Failed to update business hours' });
      });
  });
});

// Export data (for backup purposes)
router.get('/export/:table', authenticateToken, requireAdmin, (req, res) => {
  const table = req.params.table;
  const allowedTables = ['users', 'services', 'products', 'bookings', 'orders', 'business_settings'];
  
  if (!allowedTables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }
  
  const db = new sqlite3.Database(DB_PATH);
  
  db.all(`SELECT * FROM ${table}`, (err, data) => {
    db.close();
    
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${table}_export.json"`);
    res.json(data);
  });
});

// Get system health
router.get('/health', authenticateToken, requireAdmin, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  // Check database connectivity and get some basic stats
  db.get('SELECT COUNT(*) as user_count FROM users', (err, result) => {
    if (err) {
      db.close();
      return res.status(500).json({ 
        status: 'unhealthy', 
        database: 'error',
        error: err.message
      });
    }
    
    db.close();
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      userCount: result.user_count,
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    });
  });
});

// Get reminder statistics
router.get('/reminders/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await reminderService.getReminderStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching reminder stats:', error);
    res.status(500).json({ error: 'Failed to fetch reminder statistics' });
  }
});

// Send manual reminder for a specific booking
router.post('/reminders/send/:bookingId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reminderType = 'day_before' } = req.body;
    
    if (!['day_before', 'same_day'].includes(reminderType)) {
      return res.status(400).json({ error: 'Invalid reminder type. Must be "day_before" or "same_day"' });
    }
    
    const result = await reminderService.sendManualReminder(bookingId, reminderType);
    
    if (result.success) {
      res.json({
        success: true,
        message: `${reminderType} reminder sent successfully`,
        messageSid: result.messageSid
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || result.reason
      });
    }
  } catch (error) {
    console.error('Error sending manual reminder:', error);
    res.status(500).json({ error: 'Failed to send reminder' });
  }
});

// Trigger immediate reminder check (for testing)
router.post('/reminders/check', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Trigger the reminder check manually
    reminderService.checkAndSendReminders();
    
    res.json({
      success: true,
      message: 'Reminder check triggered successfully'
    });
  } catch (error) {
    console.error('Error triggering reminder check:', error);
    res.status(500).json({ error: 'Failed to trigger reminder check' });
  }
});

// Get communication service status
router.get('/communications/status', authenticateToken, requireAdmin, (req, res) => {
  const communicationService = require('../services/communicationService');
  
  res.json({
    success: true,
    email: {
      configured: !!communicationService.emailTransporter,
      service: process.env.EMAIL_SERVICE || 'Not configured'
    },
    sms: {
      configured: !!communicationService.twilioClient,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || 'Not configured'
    },
    reminderService: {
      running: reminderService.isRunning
    }
  });
});

module.exports = router; 