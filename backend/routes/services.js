const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', process.env.DB_NAME || 'olga_skincare.db');

// Get all active services (for public display)
router.get('/', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.all(
    'SELECT * FROM services WHERE is_active = 1 AND is_displayed = 1 ORDER BY display_order, category, name',
    (err, services) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(services);
    }
  );
});

// Get service by ID
router.get('/:id', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.get('SELECT * FROM services WHERE id = ? AND is_active = 1', [req.params.id], (err, service) => {
    db.close();
    
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  });
});

// Get services by category
router.get('/category/:category', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.all(
    'SELECT * FROM services WHERE category = ? AND is_active = 1 ORDER BY name',
    [req.params.category],
    (err, services) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(services);
    }
  );
});

// Get all service categories
router.get('/meta/categories', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.all(
    'SELECT DISTINCT category FROM services WHERE is_active = 1 AND category IS NOT NULL ORDER BY category',
    (err, categories) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const categoryList = categories.map(row => row.category);
      res.json(categoryList);
    }
  );
});

// Admin routes - Create new service
router.post('/', authenticateToken, requireAdmin, [
  body('name').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('duration').isInt({ min: 1 }),
  body('price').isFloat({ min: 0 }),
  body('category').optional().trim(),
  body('image_url').optional().trim(),
  body('benefits').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, duration, price, category, image_url, benefits } = req.body;
    const db = new sqlite3.Database(DB_PATH);

    db.run(
      'INSERT INTO services (name, description, duration, price, category, image_url, benefits) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description || null, duration, price, category || null, image_url || null, benefits || null],
      function(err) {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Failed to create service' });
        }

        const serviceId = this.lastID;
        
        // Get the created service
        db.get('SELECT * FROM services WHERE id = ?', [serviceId], (err, service) => {
          db.close();
          
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.status(201).json({
            message: 'Service created successfully',
            service
          });
        });
      }
    );
  } catch (error) {
    console.error('Service creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes - Update service
router.put('/:id', authenticateToken, requireAdmin, [
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('duration').optional().isInt({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().trim(),
  body('image_url').optional().trim(),
  body('benefits').optional().trim(),
  body('is_active').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const serviceId = req.params.id;
    const { name, description, duration, price, category, image_url, benefits, is_active } = req.body;
    const db = new sqlite3.Database(DB_PATH);

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (duration !== undefined) {
      updates.push('duration = ?');
      values.push(duration);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(image_url);
    }
    if (benefits !== undefined) {
      updates.push('benefits = ?');
      values.push(benefits);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      db.close();
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(serviceId);

    const query = `UPDATE services SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, values, function(err) {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to update service' });
      }

      if (this.changes === 0) {
        db.close();
        return res.status(404).json({ error: 'Service not found' });
      }

      // Get updated service
      db.get('SELECT * FROM services WHERE id = ?', [serviceId], (err, service) => {
        db.close();
        
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          message: 'Service updated successfully',
          service
        });
      });
    });
  } catch (error) {
    console.error('Service update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes - Delete service (soft delete)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.run(
    'UPDATE services SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [req.params.id],
    function(err) {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Failed to delete service' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Service not found' });
      }

      res.json({ message: 'Service deleted successfully' });
    }
  );
});

// Admin routes - Get all active services for admin panel
router.get('/admin/all', authenticateToken, requireAdmin, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.all(
    'SELECT * FROM services WHERE is_active = 1 ORDER BY display_order, created_at DESC',
    (err, services) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(services);
    }
  );
});

// Admin routes - Update service display settings
router.put('/admin/:id/display', authenticateToken, requireAdmin, [
  body('is_displayed').optional().isBoolean().withMessage('is_displayed must be a boolean'),
  body('display_order').optional().isInt({ min: 0 }).withMessage('display_order must be a non-negative integer')
], (req, res) => {
  console.log('Service display update request body:', req.body);
  console.log('Service ID:', req.params.id);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const db = new sqlite3.Database(DB_PATH);
  const { is_displayed, display_order } = req.body;
  const serviceId = req.params.id;

  // Build dynamic query based on provided fields
  const updates = [];
  const values = [];
  
  if (is_displayed !== undefined) {
    updates.push('is_displayed = ?');
    values.push(is_displayed);
  }
  
  if (display_order !== undefined) {
    updates.push('display_order = ?');
    values.push(display_order);
  }
  
  updates.push('updated_at = datetime("now")');
  values.push(serviceId);

  if (updates.length === 1) { // Only has updated_at
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  db.run(
    `UPDATE services SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Service not found' });
      }

      res.json({ 
        success: true, 
        message: 'Service display settings updated successfully' 
      });
    }
  );
});

// Admin routes - Bulk update service display order
router.put('/admin/display-order', authenticateToken, requireAdmin, [
  body('services').isArray().withMessage('services must be an array'),
  body('services.*.id').isInt().withMessage('Each service must have a valid id'),
  body('services.*.display_order').isInt({ min: 0 }).withMessage('Each service must have a valid display_order')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = new sqlite3.Database(DB_PATH);
  const { services } = req.body;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    let completed = 0;
    let hasError = false;

    services.forEach(service => {
      db.run(
        'UPDATE services SET display_order = ?, updated_at = datetime("now") WHERE id = ?',
        [service.display_order, service.id],
        function(err) {
          if (err && !hasError) {
            hasError = true;
            db.run('ROLLBACK');
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          completed++;
          if (completed === services.length && !hasError) {
            db.run('COMMIT');
            db.close();
            res.json({ 
              success: true, 
              message: 'Service display order updated successfully' 
            });
          }
        }
      );
    });
  });
});

module.exports = router; 