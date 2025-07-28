const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', process.env.DB_NAME || 'olga_skincare.db');

// Initialize Square client with error handling
let squareClient = null;
let paymentsApi = null;

try {
  const { Client, Environment } = require('square');
  
  if (process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_ENVIRONMENT) {
    squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox
});
    paymentsApi = squareClient.paymentsApi;
    console.log('✅ Square payments initialized successfully');
  } else {
    console.warn('⚠️  Square payment configuration missing - payment features will be disabled');
  }
} catch (error) {
  console.warn('⚠️  Square SDK error - payment features will be disabled:', error.message);
}

// Process payment for booking
router.post('/booking/:bookingId', authenticateToken, [
  body('sourceId').isString().isLength({ min: 1 }),
  body('verificationToken').optional().isString()
], async (req, res) => {
  try {
    // Check if Square payments are available
    if (!paymentsApi) {
      return res.status(503).json({ 
        error: 'Payment processing is currently unavailable. Please contact the administrator.' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sourceId, verificationToken } = req.body;
    const bookingId = req.params.bookingId;
    const db = new sqlite3.Database(DB_PATH);

    // Get booking details
    db.get(
      `SELECT b.*, s.name as service_name, s.price, u.first_name, u.last_name, u.email
       FROM bookings b 
       JOIN services s ON b.service_id = s.id 
       JOIN users u ON b.user_id = u.id 
       WHERE b.id = ? AND b.user_id = ?`,
      [bookingId, req.user.id],
      async (err, booking) => {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Database error' });
        }

        if (!booking) {
          db.close();
          return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.payment_id) {
          db.close();
          return res.status(400).json({ error: 'Payment already processed for this booking' });
        }

        try {
          // Create payment request
          const paymentRequest = {
            sourceId,
            idempotencyKey: uuidv4(),
            amountMoney: {
              amount: Math.round(booking.price * 100), // Convert to cents
              currency: 'USD'
            },
            note: `Payment for ${booking.service_name} - Booking #${bookingId}`,
            buyerEmailAddress: booking.email
          };

          if (verificationToken) {
            paymentRequest.verificationToken = verificationToken;
          }

          // Process payment with Square
          const response = await paymentsApi.createPayment(paymentRequest);
          
          if (response.result && response.result.payment) {
            const payment = response.result.payment;
            
            // Update booking with payment information
            db.run(
              'UPDATE bookings SET payment_id = ?, status = "confirmed", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
              [payment.id, bookingId],
              function(err) {
                if (err) {
                  db.close();
                  console.error('Failed to update booking with payment:', err);
                  return res.status(500).json({ error: 'Payment processed but failed to update booking' });
                }

                db.close();
                res.json({
                  message: 'Payment processed successfully',
                  paymentId: payment.id,
                  status: payment.status,
                  booking: {
                    id: bookingId,
                    status: 'confirmed',
                    paymentId: payment.id
                  }
                });
              }
            );
          } else {
            db.close();
            res.status(400).json({ 
              error: 'Payment failed', 
              details: response.errors || 'Unknown error' 
            });
          }
        } catch (squareError) {
          db.close();
          console.error('Square payment error:', squareError);
          res.status(400).json({ 
            error: 'Payment processing failed', 
            details: squareError.message || 'Square API error' 
          });
        }
      }
    );
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process payment for product order
router.post('/order/:orderId', authenticateToken, [
  body('sourceId').isString().isLength({ min: 1 }),
  body('verificationToken').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sourceId, verificationToken } = req.body;
    const orderId = req.params.orderId;
    const db = new sqlite3.Database(DB_PATH);

    // Get order details
    db.get(
      `SELECT o.*, u.first_name, u.last_name, u.email
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       WHERE o.id = ? AND o.user_id = ?`,
      [orderId, req.user.id],
      async (err, order) => {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Database error' });
        }

        if (!order) {
          db.close();
          return res.status(404).json({ error: 'Order not found' });
        }

        if (order.payment_id) {
          db.close();
          return res.status(400).json({ error: 'Payment already processed for this order' });
        }

        try {
          // Create payment request
          const paymentRequest = {
            sourceId,
            idempotencyKey: uuidv4(),
            amountMoney: {
              amount: Math.round(order.total_amount * 100), // Convert to cents
              currency: 'USD'
            },
            note: `Payment for Order #${orderId}`,
            buyerEmailAddress: order.email
          };

          if (verificationToken) {
            paymentRequest.verificationToken = verificationToken;
          }

          // Process payment with Square
          const response = await paymentsApi.createPayment(paymentRequest);
          
          if (response.result && response.result.payment) {
            const payment = response.result.payment;
            
            // Update order with payment information
            db.run(
              'UPDATE orders SET payment_id = ?, status = "confirmed", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
              [payment.id, orderId],
              function(err) {
                if (err) {
                  db.close();
                  console.error('Failed to update order with payment:', err);
                  return res.status(500).json({ error: 'Payment processed but failed to update order' });
                }

                db.close();
                res.json({
                  message: 'Payment processed successfully',
                  paymentId: payment.id,
                  status: payment.status,
                  order: {
                    id: orderId,
                    status: 'confirmed',
                    paymentId: payment.id
                  }
                });
              }
            );
          } else {
            db.close();
            res.status(400).json({ 
              error: 'Payment failed', 
              details: response.errors || 'Unknown error' 
            });
          }
        } catch (squareError) {
          db.close();
          console.error('Square payment error:', squareError);
          res.status(400).json({ 
            error: 'Payment processing failed', 
            details: squareError.message || 'Square API error' 
          });
        }
      }
    );
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payment details
router.get('/payment/:paymentId', authenticateToken, async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    
    // Get payment from Square
    const response = await paymentsApi.getPayment(paymentId);
    
    if (response.result && response.result.payment) {
      const payment = response.result.payment;
      
      // Verify user owns this payment
      const db = new sqlite3.Database(DB_PATH);
      
      db.get(
        'SELECT COUNT(*) as count FROM bookings WHERE payment_id = ? AND user_id = ? UNION SELECT COUNT(*) as count FROM orders WHERE payment_id = ? AND user_id = ?',
        [paymentId, req.user.id, paymentId, req.user.id],
        (err, result) => {
          db.close();
          
          if (err || !result || result.count === 0) {
            return res.status(404).json({ error: 'Payment not found or access denied' });
          }

          res.json({
            id: payment.id,
            status: payment.status,
            amount: payment.amountMoney,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            note: payment.note
          });
        }
      );
    } else {
      res.status(404).json({ error: 'Payment not found' });
    }
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to retrieve payment details' });
  }
});

// Refund payment (admin only)
router.post('/refund/:paymentId', authenticateToken, [
  body('amount').optional().isFloat({ min: 0 }),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    // Check if Square payments are available
    if (!paymentsApi) {
      return res.status(503).json({ 
        error: 'Payment processing is currently unavailable. Please contact the administrator.' 
      });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const paymentId = req.params.paymentId;
    const { amount, reason } = req.body;

    // Get original payment details
    const paymentResponse = await paymentsApi.getPayment(paymentId);
    
    if (!paymentResponse.result || !paymentResponse.result.payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const originalPayment = paymentResponse.result.payment;
    
    // Create refund request
    const refundRequest = {
      idempotencyKey: uuidv4(),
      paymentId: paymentId,
      amountMoney: {
        amount: amount ? Math.round(amount * 100) : originalPayment.amountMoney.amount,
        currency: 'USD'
      },
      reason: reason || 'Refund requested'
    };

    const refundResponse = await squareClient.refundsApi.refundPayment(refundRequest);
    
    if (refundResponse.result && refundResponse.result.refund) {
      const refund = refundResponse.result.refund;
      
      res.json({
        message: 'Refund processed successfully',
        refund: {
          id: refund.id,
          status: refund.status,
          amount: refund.amountMoney,
          reason: refund.reason,
          createdAt: refund.createdAt
        }
      });
    } else {
      res.status(400).json({ 
        error: 'Refund failed', 
        details: refundResponse.errors || 'Unknown error' 
      });
    }
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

// Square webhook endpoint (for payment status updates)
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  try {
    // Verify webhook signature if signature key is provided
    if (process.env.SQUARE_WEBHOOK_SIGNATURE_KEY) {
      const crypto = require('crypto');
      const signature = req.headers['x-square-signature'];
      const body = req.body;
      
      const hmac = crypto.createHmac('sha1', process.env.SQUARE_WEBHOOK_SIGNATURE_KEY);
      hmac.update(body);
      const hash = hmac.digest('base64');
      
      if (signature !== hash) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event = JSON.parse(req.body);
    
    // Handle different webhook events
    switch (event.type) {
      case 'payment.updated':
        handlePaymentUpdate(event.data.object.payment);
        break;
      default:
        console.log('Unhandled webhook event:', event.type);
    }
    
    res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

function handlePaymentUpdate(payment) {
  const db = new sqlite3.Database(DB_PATH);
  
  // Update booking or order status based on payment status
  if (payment.status === 'FAILED' || payment.status === 'CANCELED') {
    db.run('UPDATE bookings SET status = "pending" WHERE payment_id = ?', [payment.id]);
    db.run('UPDATE orders SET status = "pending" WHERE payment_id = ?', [payment.id]);
  }
  
  db.close();
}

module.exports = router; 