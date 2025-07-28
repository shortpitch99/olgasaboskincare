const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', process.env.DB_NAME || 'olga_skincare.db');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = async (req, res, next) => {
  try {
    const db = new sqlite3.Database(DB_PATH);
    
    db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, row) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!row || row.role !== 'admin') {
        db.close();
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      db.close();
      next();
    });
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
}; 