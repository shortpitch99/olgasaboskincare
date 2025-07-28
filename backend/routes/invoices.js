const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { body, validationResult } = require('express-validator');
const path = require('path');

const dbPath = process.env.DB_NAME || path.join(__dirname, '..', 'olga_skincare.db');
const db = new sqlite3.Database(dbPath);

// Morgan Hill, CA tax rate
const TAX_RATE = 9.125;

// Generate invoice number
const generateInvoiceNumber = () => {
  const prefix = 'INV';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Calculate invoice totals
const calculateInvoiceTotals = (items, taxRate = TAX_RATE) => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};

// Get all invoices
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const status = req.query.status;

  let query = `
    SELECT i.*, 
           COALESCE(i.customer_name, u.first_name || ' ' || u.last_name) as customer_name,
           COALESCE(i.customer_email, u.email) as customer_email,
           b.appointment_date,
           s.name as service_name
    FROM invoices i
    LEFT JOIN users u ON i.user_id = u.id
    LEFT JOIN bookings b ON i.booking_id = b.id
    LEFT JOIN services s ON b.service_id = s.id
  `;
  
  const params = [];
  if (status) {
    query += ' WHERE i.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  db.all(query, params, (err, invoices) => {
    if (err) {
      console.error('Error fetching invoices:', err);
      return res.status(500).json({ error: 'Failed to fetch invoices' });
    }

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM invoices';
    const countParams = [];
    if (status) {
      countQuery += ' WHERE status = ?';
      countParams.push(status);
    }

    db.get(countQuery, countParams, (countErr, countResult) => {
      if (countErr) {
        console.error('Error counting invoices:', countErr);
        return res.status(500).json({ error: 'Failed to count invoices' });
      }

      res.json({
        invoices,
        pagination: {
          page,
          limit,
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// Get specific invoice with items
router.get('/:id', (req, res) => {
  const invoiceId = req.params.id;

  // Get invoice details
  db.get(`
    SELECT i.*, 
           COALESCE(i.customer_name, u.first_name || ' ' || u.last_name) as customer_name,
           COALESCE(i.customer_email, u.email) as customer_email,
           u.phone as customer_phone,
           b.appointment_date,
           s.name as service_name
    FROM invoices i
    LEFT JOIN users u ON i.user_id = u.id
    LEFT JOIN bookings b ON i.booking_id = b.id
    LEFT JOIN services s ON b.service_id = s.id
    WHERE i.id = ?
  `, [invoiceId], (err, invoice) => {
    if (err) {
      console.error('Error fetching invoice:', err);
      return res.status(500).json({ error: 'Failed to fetch invoice' });
    }

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Get invoice items
    db.all(`
      SELECT * FROM invoice_items 
      WHERE invoice_id = ? 
      ORDER BY id ASC
    `, [invoiceId], (itemsErr, items) => {
      if (itemsErr) {
        console.error('Error fetching invoice items:', itemsErr);
        return res.status(500).json({ error: 'Failed to fetch invoice items' });
      }

      res.json({
        ...invoice,
        items
      });
    });
  });
});

// Create new invoice
router.post('/', [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.item_type').isIn(['service', 'product']).withMessage('Invalid item type'),
  body('items.*.item_name').notEmpty().withMessage('Item name is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.unit_price').isFloat({ min: 0 }).withMessage('Unit price must be positive'),
  // Custom validation for customer info
  body().custom((body) => {
    if (!body.user_id && (!body.customer_name || !body.customer_email)) {
      throw new Error('Either user_id or customer_name and customer_email are required');
    }
    return true;
  })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { user_id, booking_id, customer_name, customer_email, items, notes, due_days = 30 } = req.body;
  
  // Calculate totals
  const { subtotal, taxAmount, total } = calculateInvoiceTotals(items);
  
  // Generate invoice number and dates
  const invoiceNumber = generateInvoiceNumber();
  const issueDate = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + (due_days * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

  // Insert invoice
  db.run(`
    INSERT INTO invoices (
      invoice_number, user_id, booking_id, customer_name, customer_email,
      issue_date, due_date, subtotal, tax_rate, tax_amount, total_amount, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    invoiceNumber, user_id || null, booking_id, customer_name || null, customer_email || null,
    issueDate, dueDate, subtotal, TAX_RATE, taxAmount, total, notes
  ], function(invoiceErr) {
    if (invoiceErr) {
      console.error('Error creating invoice:', invoiceErr);
      return res.status(500).json({ error: 'Failed to create invoice' });
    }

    const invoiceId = this.lastID;

    // Insert invoice items
    const itemPromises = items.map(item => {
      return new Promise((resolve, reject) => {
        const totalPrice = item.quantity * item.unit_price;
        db.run(`
          INSERT INTO invoice_items (
            invoice_id, item_type, item_id, item_name, description,
            quantity, unit_price, total_price
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          invoiceId, item.item_type, item.item_id || 0, item.item_name,
          item.description, item.quantity, item.unit_price, totalPrice
        ], function(itemErr) {
          if (itemErr) reject(itemErr);
          else resolve(this.lastID);
        });
      });
    });

    Promise.all(itemPromises)
      .then(() => {
        res.status(201).json({
          success: true,
          message: 'Invoice created successfully',
          invoiceId,
          invoiceNumber
        });
      })
      .catch(itemErr => {
        console.error('Error creating invoice items:', itemErr);
        res.status(500).json({ error: 'Failed to create invoice items' });
      });
  });
});

// Create invoice from booking
router.post('/from-booking/:bookingId', (req, res) => {
  const bookingId = req.params.bookingId;
  const { additional_items = [], notes } = req.body;

  console.log('Creating invoice for booking ID:', bookingId);

  // Get booking details with LEFT JOIN to handle missing related records
  db.get(`
    SELECT b.*, 
           s.name as service_name, 
           s.price as service_price, 
           s.duration,
           u.id as user_id, 
           u.first_name, 
           u.last_name,
           u.email
    FROM bookings b
    LEFT JOIN services s ON b.service_id = s.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
  `, [bookingId], (err, booking) => {
    if (err) {
      console.error('Error fetching booking:', err);
      return res.status(500).json({ error: 'Failed to fetch booking' });
    }

    console.log('Booking query result:', booking);

    if (!booking) {
      console.log('No booking found with ID:', bookingId);
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!booking.service_name) {
      console.error('Service not found for booking:', bookingId, 'service_id:', booking.service_id);
      return res.status(400).json({ error: 'Service information missing for this booking' });
    }

    if (!booking.user_id) {
      console.error('User not found for booking:', bookingId, 'user_id:', booking.user_id);
      return res.status(400).json({ error: 'Customer information missing for this booking' });
    }

    // Check if invoice already exists for this booking
    db.get('SELECT id FROM invoices WHERE booking_id = ?', [bookingId], (checkErr, existingInvoice) => {
      if (checkErr) {
        console.error('Error checking existing invoice:', checkErr);
        return res.status(500).json({ error: 'Failed to check existing invoice' });
      }

      if (existingInvoice) {
        return res.status(400).json({ error: 'Invoice already exists for this booking' });
      }

      // Build items array
      const items = [
        {
          item_type: 'service',
          item_id: booking.service_id,
          item_name: booking.service_name,
          description: `${booking.duration} minute ${booking.service_name}`,
          quantity: 1,
          unit_price: booking.service_price
        },
        ...additional_items
      ];

      // Calculate totals
      const { subtotal, taxAmount, total } = calculateInvoiceTotals(items);
      
      // Generate invoice details
      const invoiceNumber = generateInvoiceNumber();
      const issueDate = new Date().toISOString().split('T')[0];
      const dueDate = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

      // Create invoice
      db.run(`
        INSERT INTO invoices (
          invoice_number, user_id, booking_id, issue_date, due_date,
          subtotal, tax_rate, tax_amount, total_amount, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        invoiceNumber, booking.user_id, bookingId, issueDate, dueDate,
        subtotal, TAX_RATE, taxAmount, total, notes
      ], function(invoiceErr) {
        if (invoiceErr) {
          console.error('Error creating invoice from booking:', invoiceErr);
          return res.status(500).json({ error: 'Failed to create invoice' });
        }

        const invoiceId = this.lastID;

        // Insert all items
        const itemPromises = items.map(item => {
          return new Promise((resolve, reject) => {
            const totalPrice = item.quantity * item.unit_price;
            db.run(`
              INSERT INTO invoice_items (
                invoice_id, item_type, item_id, item_name, description,
                quantity, unit_price, total_price
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              invoiceId, item.item_type, item.item_id || 0, item.item_name,
              item.description, item.quantity, item.unit_price, totalPrice
            ], function(itemErr) {
              if (itemErr) reject(itemErr);
              else resolve(this.lastID);
            });
          });
        });

        Promise.all(itemPromises)
          .then(() => {
            res.status(201).json({
              success: true,
              message: 'Invoice created from booking successfully',
              invoiceId,
              invoiceNumber,
              bookingId
            });
          })
          .catch(itemErr => {
            console.error('Error creating invoice items:', itemErr);
            res.status(500).json({ error: 'Failed to create invoice items' });
          });
      });
    });
  });
});

// Update invoice details (for pending invoices only)
router.put('/:id', [
  body('customer_name').optional().trim().isLength({ min: 1 }).withMessage('Customer name cannot be empty'),
  body('customer_email').optional().isEmail().withMessage('Invalid email format'),
  body('user_id').optional().isInt().withMessage('User ID must be an integer'),
  body('due_date').optional().isISO8601().withMessage('Invalid due date format'),
  body('notes').optional().trim(),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.item_type').isIn(['service', 'product']).withMessage('Item type must be service or product'),
  body('items.*.item_id').isInt().withMessage('Item ID must be an integer'),
  body('items.*.item_name').trim().isLength({ min: 1 }).withMessage('Item name is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.unit_price').isFloat({ min: 0 }).withMessage('Unit price must be non-negative')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const invoiceId = req.params.id;
  const { customer_name, customer_email, user_id, due_date, notes, items } = req.body;

  // First check if invoice exists and is pending
  db.get('SELECT * FROM invoices WHERE id = ?', [invoiceId], (err, invoice) => {
    if (err) {
      console.error('Error fetching invoice:', err);
      return res.status(500).json({ error: 'Failed to fetch invoice' });
    }

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending invoices can be edited' });
    }

    // Calculate totals
    const totals = calculateInvoiceTotals(items);

    // Update invoice
    db.run(
      `UPDATE invoices 
       SET customer_name = ?, customer_email = ?, user_id = ?, due_date = ?, notes = ?,
           subtotal = ?, tax_amount = ?, total_amount = ?, updated_at = datetime("now")
       WHERE id = ?`,
      [
        customer_name || invoice.customer_name,
        customer_email || invoice.customer_email,
        user_id || invoice.user_id,
        due_date || invoice.due_date,
        notes !== undefined ? notes : invoice.notes,
        totals.subtotal,
        totals.taxAmount,
        totals.total,
        invoiceId
      ],
      function(err) {
        if (err) {
          console.error('Error updating invoice:', err);
          return res.status(500).json({ error: 'Failed to update invoice' });
        }

        // Delete existing invoice items
        db.run('DELETE FROM invoice_items WHERE invoice_id = ?', [invoiceId], (err) => {
          if (err) {
            console.error('Error deleting invoice items:', err);
            return res.status(500).json({ error: 'Failed to update invoice items' });
          }

          // Insert new invoice items
          let itemsInserted = 0;
          let insertError = null;

          items.forEach(item => {
            const totalPrice = item.quantity * item.unit_price;
            db.run(
              `INSERT INTO invoice_items (invoice_id, item_type, item_id, item_name, description, quantity, unit_price, total_price)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                invoiceId,
                item.item_type,
                item.item_id,
                item.item_name,
                item.description || null,
                item.quantity,
                item.unit_price,
                totalPrice
              ],
              function(err) {
                if (err && !insertError) {
                  insertError = err;
                }
                itemsInserted++;
                
                if (itemsInserted === items.length) {
                  if (insertError) {
                    console.error('Error inserting invoice items:', insertError);
                    return res.status(500).json({ error: 'Failed to update invoice items' });
                  }

                  res.json({
                    success: true,
                    message: 'Invoice updated successfully',
                    invoiceId: invoiceId,
                    invoiceNumber: invoice.invoice_number
                  });
                }
              }
            );
          });
        });
      }
    );
  });
});

// Update invoice status
router.put('/:id/status', [
  body('status').isIn(['pending', 'sent', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const invoiceId = req.params.id;
  const { status, payment_method, payment_id } = req.body;

  let query = 'UPDATE invoices SET status = ?, updated_at = datetime("now")';
  const params = [status];

  if (status === 'paid' && payment_method) {
    query += ', payment_method = ?';
    params.push(payment_method);
    
    if (payment_id) {
      query += ', payment_id = ?';
      params.push(payment_id);
    }
  }

  query += ' WHERE id = ?';
  params.push(invoiceId);

  db.run(query, params, function(err) {
    if (err) {
      console.error('Error updating invoice status:', err);
      return res.status(500).json({ error: 'Failed to update invoice status' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({
      success: true,
      message: 'Invoice status updated successfully'
    });
  });
});

// Delete invoice
router.delete('/:id', (req, res) => {
  const invoiceId = req.params.id;

  db.run('DELETE FROM invoices WHERE id = ?', [invoiceId], function(err) {
    if (err) {
      console.error('Error deleting invoice:', err);
      return res.status(500).json({ error: 'Failed to delete invoice' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  });
});

// Get invoice statistics
router.get('/stats/summary', (req, res) => {
  const queries = [
    { key: 'total_invoices', query: 'SELECT COUNT(*) as count FROM invoices' },
    { key: 'pending_invoices', query: 'SELECT COUNT(*) as count FROM invoices WHERE status = "pending"' },
    { key: 'paid_invoices', query: 'SELECT COUNT(*) as count FROM invoices WHERE status = "paid"' },
    { key: 'cancelled_invoices', query: 'SELECT COUNT(*) as count FROM invoices WHERE status = "cancelled"' },
    { key: 'total_revenue', query: 'SELECT COALESCE(SUM(total_amount), 0) as amount FROM invoices WHERE status = "paid"' },
    { key: 'pending_amount', query: 'SELECT COALESCE(SUM(total_amount), 0) as amount FROM invoices WHERE status IN ("pending", "sent")' }
  ];

  const results = {};
  let completed = 0;

  queries.forEach(({ key, query }) => {
    db.get(query, (err, result) => {
      if (err) {
        console.error(`Error executing query for ${key}:`, err);
        results[key] = 0;
      } else {
        results[key] = result.count || result.amount || 0;
      }
      
      completed++;
      if (completed === queries.length) {
        res.json(results);
      }
    });
  });
});

// Debug endpoint to check booking data
router.get('/debug/booking/:bookingId', (req, res) => {
  const bookingId = req.params.bookingId;
  
  db.get(`
    SELECT b.*, 
           s.name as service_name, 
           s.price as service_price, 
           s.duration,
           u.id as user_id, 
           u.first_name, 
           u.last_name,
           u.email
    FROM bookings b
    LEFT JOIN services s ON b.service_id = s.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE b.id = ?
  `, [bookingId], (err, booking) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    res.json({
      bookingId,
      booking,
      found: !!booking
    });
  });
});

module.exports = router; 