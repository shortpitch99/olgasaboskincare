const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', process.env.DB_NAME || 'olga_skincare.db');

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone } = req.body;
    const db = new sqlite3.Database(DB_PATH);

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        db.close();
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      db.run(
        'INSERT INTO users (email, password, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, firstName, lastName, phone || null],
        function(err) {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Failed to create user' });
          }

          const userId = this.lastID;
          
          // Generate JWT token
          const token = jwt.sign(
            { id: userId, email, role: 'customer' },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
          );

          db.close();
          res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
              id: userId,
              email,
              firstName,
              lastName,
              phone,
              role: 'customer'
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const db = new sqlite3.Database(DB_PATH);

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        db.close();
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        db.close();
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      db.close();
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);

  db.get(
    'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at
      });
    }
  );
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional().isMobilePhone()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone } = req.body;
    const db = new sqlite3.Database(DB_PATH);

    const updates = [];
    const values = [];

    if (firstName !== undefined) {
      updates.push('first_name = ?');
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push('last_name = ?');
      values.push(lastName);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }

    if (updates.length === 0) {
      db.close();
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.user.id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, values, function(err) {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      // Get updated user data
      db.get(
        'SELECT id, email, first_name, last_name, phone, role FROM users WHERE id = ?',
        [req.user.id],
        (err, user) => {
          db.close();
          
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            message: 'Profile updated successfully',
            user: {
              id: user.id,
              email: user.email,
              firstName: user.first_name,
              lastName: user.last_name,
              phone: user.phone,
              role: user.role
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const db = new sqlite3.Database(DB_PATH);

    db.get('SELECT password FROM users WHERE id = ?', [req.user.id], async (err, user) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        db.close();
        return res.status(404).json({ error: 'User not found' });
      }

      // Check current password
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        db.close();
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      db.run(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedNewPassword, req.user.id],
        function(err) {
          db.close();
          
          if (err) {
            return res.status(500).json({ error: 'Failed to update password' });
          }

          res.json({ message: 'Password updated successfully' });
        }
      );
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 