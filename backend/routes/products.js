const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', process.env.DB_NAME || 'olga_skincare.db');

// Get all active products (for public display)
router.get('/', (req, res) => {
  const { category, brand, inStock } = req.query;
  const db = new sqlite3.Database(DB_PATH);
  
  let query = 'SELECT * FROM products WHERE is_active = 1 AND is_displayed = 1';
  const params = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (brand) {
    query += ' AND brand = ?';
    params.push(brand);
  }
  
  if (inStock === 'true') {
    query += ' AND stock_quantity > 0';
  }
  
  query += ' ORDER BY display_order, category, name';
  
  db.all(query, params, (err, products) => {
    db.close();
    
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(products);
  });
});

// Get product by ID
router.get('/:id', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.get('SELECT * FROM products WHERE id = ? AND is_active = 1', [req.params.id], (err, product) => {
    db.close();
    
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  });
});

// Get products by category
router.get('/category/:category', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.all(
    'SELECT * FROM products WHERE category = ? AND is_active = 1 ORDER BY name',
    [req.params.category],
    (err, products) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(products);
    }
  );
});

// Get all product categories
router.get('/meta/categories', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.all(
    'SELECT DISTINCT category FROM products WHERE is_active = 1 AND category IS NOT NULL ORDER BY category',
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

// Get all brands
router.get('/meta/brands', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.all(
    'SELECT DISTINCT brand FROM products WHERE is_active = 1 AND brand IS NOT NULL ORDER BY brand',
    (err, brands) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const brandList = brands.map(row => row.brand);
      res.json(brandList);
    }
  );
});

// Create new order
router.post('/order', authenticateToken, [
  body('items').isArray({ min: 1 }),
  body('items.*.productId').isInt({ min: 1 }),
  body('items.*.quantity').isInt({ min: 1 }),
  body('shippingAddress').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, shippingAddress } = req.body;
    const userId = req.user.id;
    const db = new sqlite3.Database(DB_PATH);

    // Validate all products exist and have sufficient stock
    const productIds = items.map(item => item.productId);
    const placeholders = productIds.map(() => '?').join(',');
    
    db.all(
      `SELECT * FROM products WHERE id IN (${placeholders}) AND is_active = 1`,
      productIds,
      (err, products) => {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Database error' });
        }

        if (products.length !== productIds.length) {
          db.close();
          return res.status(400).json({ error: 'One or more products not found' });
        }

        // Check stock and calculate total
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
          const product = products.find(p => p.id === item.productId);
          
          if (product.stock_quantity < item.quantity) {
            db.close();
            return res.status(400).json({ 
              error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}` 
            });
          }

          const itemTotal = product.price * item.quantity;
          totalAmount += itemTotal;
          
          orderItems.push({
            productId: item.productId,
            quantity: item.quantity,
            price: product.price
          });
        }

        // Create order
        db.run(
          'INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)',
          [userId, totalAmount, shippingAddress || null],
          function(err) {
            if (err) {
              db.close();
              return res.status(500).json({ error: 'Failed to create order' });
            }

            const orderId = this.lastID;
            
            // Insert order items
            const insertPromises = orderItems.map(item => {
              return new Promise((resolve, reject) => {
                db.run(
                  'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                  [orderId, item.productId, item.quantity, item.price],
                  (err) => {
                    if (err) reject(err);
                    else resolve();
                  }
                );
              });
            });

            Promise.all(insertPromises)
              .then(() => {
                // Update stock quantities
                const updatePromises = orderItems.map(item => {
                  return new Promise((resolve, reject) => {
                    db.run(
                      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                      [item.quantity, item.productId],
                      (err) => {
                        if (err) reject(err);
                        else resolve();
                      }
                    );
                  });
                });

                return Promise.all(updatePromises);
              })
              .then(() => {
                // Get created order with items
                db.get(
                  `SELECT o.*, u.first_name, u.last_name, u.email
                   FROM orders o 
                   JOIN users u ON o.user_id = u.id 
                   WHERE o.id = ?`,
                  [orderId],
                  (err, order) => {
                    if (err) {
                      db.close();
                      return res.status(500).json({ error: 'Database error' });
                    }

                    // Get order items
                    db.all(
                      `SELECT oi.*, p.name, p.description, p.image_url
                       FROM order_items oi 
                       JOIN products p ON oi.product_id = p.id 
                       WHERE oi.order_id = ?`,
                      [orderId],
                      (err, items) => {
                        db.close();
                        
                        if (err) {
                          return res.status(500).json({ error: 'Database error' });
                        }

                        res.status(201).json({
                          message: 'Order created successfully',
                          order: {
                            ...order,
                            items
                          }
                        });
                      }
                    );
                  }
                );
              })
              .catch((error) => {
                db.close();
                console.error('Order creation error:', error);
                res.status(500).json({ error: 'Failed to create order' });
              });
          }
        );
      }
    );
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's orders
router.get('/orders/my-orders', authenticateToken, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.all(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, orders) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }

      if (orders.length === 0) {
        db.close();
        return res.json([]);
      }

      // Get order items for each order
      const orderPromises = orders.map(order => {
        return new Promise((resolve, reject) => {
          db.all(
            `SELECT oi.*, p.name, p.description, p.image_url
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = ?`,
            [order.id],
            (err, items) => {
              if (err) reject(err);
              else resolve({ ...order, items });
            }
          );
        });
      });

      Promise.all(orderPromises)
        .then(ordersWithItems => {
          db.close();
          res.json(ordersWithItems);
        })
        .catch(error => {
          db.close();
          res.status(500).json({ error: 'Database error' });
        });
    }
  );
});

// Get order by ID
router.get('/orders/:id', authenticateToken, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.get(
    `SELECT o.*, u.first_name, u.last_name, u.email
     FROM orders o 
     JOIN users u ON o.user_id = u.id 
     WHERE o.id = ? AND (o.user_id = ? OR ? = 'admin')`,
    [req.params.id, req.user.id, req.user.role],
    (err, order) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }

      if (!order) {
        db.close();
        return res.status(404).json({ error: 'Order not found' });
      }

      // Get order items
      db.all(
        `SELECT oi.*, p.name, p.description, p.image_url
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [req.params.id],
        (err, items) => {
          db.close();
          
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({ ...order, items });
        }
      );
    }
  );
});

// Admin routes - Create new product
router.post('/', authenticateToken, requireAdmin, [
  body('name').trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }),
  body('category').optional().trim(),
  body('brand').optional().trim(),
  body('stock_quantity').isInt({ min: 0 }),
  body('image_url').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, category, brand, stock_quantity, image_url } = req.body;
    const db = new sqlite3.Database(DB_PATH);

    db.run(
      'INSERT INTO products (name, description, price, category, brand, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description || null, price, category || null, brand || null, stock_quantity, image_url || null],
      function(err) {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Failed to create product' });
        }

        const productId = this.lastID;
        
        // Get the created product
        db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
          db.close();
          
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.status(201).json({
            message: 'Product created successfully',
            product
          });
        });
      }
    );
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes - Update product
router.put('/:id', authenticateToken, requireAdmin, [
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('category').optional().trim(),
  body('brand').optional().trim(),
  body('stock_quantity').optional().isInt({ min: 0 }),
  body('image_url').optional().trim(),
  body('is_active').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productId = req.params.id;
    const { name, description, price, category, brand, stock_quantity, image_url, is_active } = req.body;
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
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (brand !== undefined) {
      updates.push('brand = ?');
      values.push(brand);
    }
    if (stock_quantity !== undefined) {
      updates.push('stock_quantity = ?');
      values.push(stock_quantity);
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(image_url);
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
    values.push(productId);

    const query = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, values, function(err) {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Failed to update product' });
      }

      if (this.changes === 0) {
        db.close();
        return res.status(404).json({ error: 'Product not found' });
      }

      // Get updated product
      db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
        db.close();
        
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({
          message: 'Product updated successfully',
          product
        });
      });
    });
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes - Delete product (soft delete)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.run(
    'UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [req.params.id],
    function(err) {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Failed to delete product' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ message: 'Product deleted successfully' });
    }
  );
});

// Admin routes - Get all active products for admin panel
router.get('/admin/all', authenticateToken, requireAdmin, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.all(
    'SELECT * FROM products WHERE is_active = 1 ORDER BY display_order, created_at DESC',
    (err, products) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(products);
    }
  );
});

// Admin routes - Update product display settings
router.put('/admin/:id/display', authenticateToken, requireAdmin, [
  body('is_displayed').optional().isBoolean().withMessage('is_displayed must be a boolean'),
  body('display_order').optional().isInt({ min: 0 }).withMessage('display_order must be a non-negative integer')
], (req, res) => {
  console.log('Product display update request body:', req.body);
  console.log('Product ID:', req.params.id);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const db = new sqlite3.Database(DB_PATH);
  const { is_displayed, display_order } = req.body;
  const productId = req.params.id;

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
  values.push(productId);

  if (updates.length === 1) { // Only has updated_at
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  db.run(
    `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ 
        success: true, 
        message: 'Product display settings updated successfully' 
      });
    }
  );
});

// Admin routes - Bulk update product display order
router.put('/admin/display-order', authenticateToken, requireAdmin, [
  body('products').isArray().withMessage('products must be an array'),
  body('products.*.id').isInt().withMessage('Each product must have a valid id'),
  body('products.*.display_order').isInt({ min: 0 }).withMessage('Each product must have a valid display_order')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = new sqlite3.Database(DB_PATH);
  const { products } = req.body;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    let completed = 0;
    let hasError = false;

    products.forEach(product => {
      db.run(
        'UPDATE products SET display_order = ?, updated_at = datetime("now") WHERE id = ?',
        [product.display_order, product.id],
        function(err) {
          if (err && !hasError) {
            hasError = true;
            db.run('ROLLBACK');
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          completed++;
          if (completed === products.length && !hasError) {
            db.run('COMMIT');
            db.close();
            res.json({ 
              success: true, 
              message: 'Product display order updated successfully' 
            });
          }
        }
      );
    });
  });
});

module.exports = router; 