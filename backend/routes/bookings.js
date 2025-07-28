const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const moment = require('moment');
const communicationService = require('../services/communicationService');

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', process.env.DB_NAME || 'olga_skincare.db');

// Get available time slots for a specific date
router.get('/availability/:date', (req, res) => {
  const date = req.params.date;
  
  // Validate date format
  if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
    return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  const dayOfWeek = moment(date).day(); // 0 = Sunday, 1 = Monday, etc.
  const db = new sqlite3.Database(DB_PATH);

  // Get business hours for this day
  db.get(
    'SELECT start_time, end_time FROM available_slots WHERE day_of_week = ? AND is_active = 1',
    [dayOfWeek],
    (err, businessHours) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }

      if (!businessHours) {
        db.close();
        return res.json({ available: false, message: 'Closed on this day', slots: [] });
      }

      // Get existing bookings for this date
      db.all(
        'SELECT appointment_time, duration FROM bookings b JOIN services s ON b.service_id = s.id WHERE appointment_date = ? AND status != "cancelled"',
        [date],
        (err, bookings) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          // Get blocked slots for this date
          db.all(
            'SELECT start_time, end_time FROM blocked_slots WHERE block_date = ?',
            [date],
            (err, blockedSlots) => {
              db.close();
              
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }

              // Generate available time slots (30-minute intervals)
              const slots = generateAvailableSlots(businessHours.start_time, businessHours.end_time, bookings, blockedSlots);
              
              res.json({
                available: slots.length > 0,
                date,
                dayOfWeek,
                businessHours,
                slots
              });
            }
          );
        }
      );
    }
  );
});

// Helper function to generate available time slots
function generateAvailableSlots(startTime, endTime, existingBookings, blockedSlots = []) {
  const slots = [];
  const start = moment(startTime, 'HH:mm');
  const end = moment(endTime, 'HH:mm');
  
  const current = start.clone();
  
  while (current.isBefore(end)) {
    const timeSlot = current.format('HH:mm');
    const slotEnd = current.clone().add(30, 'minutes');
    
    // Check if this slot conflicts with existing bookings
    const isBooked = existingBookings.some(booking => {
      const bookingStart = moment(booking.appointment_time, 'HH:mm');
      const bookingEnd = bookingStart.clone().add(booking.duration, 'minutes');
      
      return current.isBetween(bookingStart, bookingEnd, null, '[)') ||
             slotEnd.isBetween(bookingStart, bookingEnd, null, '(]') ||
             (current.isSameOrBefore(bookingStart) && slotEnd.isSameOrAfter(bookingEnd));
    });

    // Check if this slot conflicts with blocked time slots
    const isBlocked = blockedSlots.some(blocked => {
      const blockedStart = moment(blocked.start_time, 'HH:mm');
      const blockedEnd = moment(blocked.end_time, 'HH:mm');
      
      return current.isBetween(blockedStart, blockedEnd, null, '[)') ||
             slotEnd.isBetween(blockedStart, blockedEnd, null, '(]') ||
             (current.isSameOrBefore(blockedStart) && slotEnd.isSameOrAfter(blockedEnd));
    });
    
    if (!isBooked && !isBlocked) {
      slots.push(timeSlot);
    }
    
    current.add(30, 'minutes');
  }
  
  return slots;
}

// Create a new booking
router.post('/', authenticateToken, [
  body('service_id').isInt({ min: 1 }),
  body('appointment_date').isDate(),
  body('appointment_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('notes').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { service_id: serviceId, appointment_date: appointmentDate, appointment_time: appointmentTime, notes } = req.body;
    const userId = req.user.id;
    
    const db = new sqlite3.Database(DB_PATH);

    // Check if service exists and get details
    db.get('SELECT * FROM services WHERE id = ? AND is_active = 1', [serviceId], (err, service) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }

      if (!service) {
        db.close();
        return res.status(404).json({ error: 'Service not found' });
      }

      // Check if time slot is available
      const appointmentDateTime = moment(`${appointmentDate} ${appointmentTime}`);
      const appointmentEnd = appointmentDateTime.clone().add(service.duration, 'minutes');

      db.all(
        `SELECT b.*, s.duration FROM bookings b 
         JOIN services s ON b.service_id = s.id 
         WHERE appointment_date = ? AND status != "cancelled"`,
        [appointmentDate],
        (err, existingBookings) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }

          // Check for booking conflicts
          const hasBookingConflict = existingBookings.some(booking => {
            const bookingStart = moment(`${booking.appointment_date} ${booking.appointment_time}`);
            const bookingEnd = bookingStart.clone().add(booking.duration, 'minutes');
            
            return appointmentDateTime.isBetween(bookingStart, bookingEnd, null, '[)') ||
                   appointmentEnd.isBetween(bookingStart, bookingEnd, null, '(]') ||
                   (appointmentDateTime.isSameOrBefore(bookingStart) && appointmentEnd.isSameOrAfter(bookingEnd));
          });

          if (hasBookingConflict) {
            db.close();
            return res.status(400).json({ error: 'Time slot is already booked' });
          }

          // Check for blocked slots
          db.all(
            'SELECT * FROM blocked_slots WHERE block_date = ?',
            [appointmentDate],
            (err, blockedSlots) => {
              if (err) {
                db.close();
                return res.status(500).json({ error: 'Database error' });
              }

              // Check for blocked time conflicts
              const hasBlockedConflict = blockedSlots.some(blocked => {
                const blockedStart = moment(`${appointmentDate} ${blocked.start_time}`);
                const blockedEnd = moment(`${appointmentDate} ${blocked.end_time}`);
                
                return appointmentDateTime.isBetween(blockedStart, blockedEnd, null, '[)') ||
                       appointmentEnd.isBetween(blockedStart, blockedEnd, null, '(]') ||
                       (appointmentDateTime.isSameOrBefore(blockedStart) && appointmentEnd.isSameOrAfter(blockedEnd));
              });

              if (hasBlockedConflict) {
                db.close();
                return res.status(400).json({ error: 'Time slot is not available (blocked by admin)' });
              }

              // Create the booking
              db.run(
                'INSERT INTO bookings (user_id, service_id, appointment_date, appointment_time, notes, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, serviceId, appointmentDate, appointmentTime, notes || null, service.price],
                function(err) {
                  if (err) {
                    db.close();
                    return res.status(500).json({ error: 'Failed to create booking' });
                  }

                  const bookingId = this.lastID;
                  
                  // Get the created booking with service details
                  db.get(
                    `SELECT b.*, s.name as service_name, s.description as service_description, 
                            s.duration, s.price, s.category,
                            u.first_name, u.last_name, u.email, u.phone
                     FROM bookings b 
                     JOIN services s ON b.service_id = s.id 
                     JOIN users u ON b.user_id = u.id 
                     WHERE b.id = ?`,
                    [bookingId],
                    async (err, booking) => {
                      if (err) {
                        db.close();
                        return res.status(500).json({ error: 'Database error' });
                      }

                      // Send email and SMS notifications
                      const notificationResults = await communicationService.sendBookingNotifications(booking);
                      
                      // Update email confirmation status
                      if (notificationResults.email.success) {
                        db.run(
                          'UPDATE bookings SET email_confirmation_sent = 1 WHERE id = ?',
                          [bookingId],
                          (updateErr) => {
                            if (updateErr) {
                              console.error('❌ Error updating email confirmation status:', updateErr);
                            }
                          }
                        );
                      }

                      db.close();

                      res.status(201).json({
                        message: 'Booking created successfully',
                        booking,
                        notifications: {
                          email: notificationResults.email.success ? 'sent' : 'failed',
                          sms: notificationResults.sms.success ? 'sent' : 'failed'
                        }
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new booking for guest users
router.post('/guest', [
  body('service_id').isInt({ min: 1 }),
  body('appointment_date').isDate(),
  body('appointment_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('notes').optional().trim(),
  body('guest_info.firstName').notEmpty().trim(),
  body('guest_info.lastName').notEmpty().trim(),
  body('guest_info.email').isEmail().normalizeEmail(),
  body('guest_info.phone').notEmpty().trim(),
  body('payment_info.creditCard').notEmpty().trim(),
  body('payment_info.expiryDate').matches(/^(0[1-9]|1[0-2])\/[0-9]{2}$/),
  body('payment_info.cvv').matches(/^[0-9]{3,4}$/),
  body('payment_info.billingAddress').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      service_id: serviceId, 
      appointment_date: appointmentDate, 
      appointment_time: appointmentTime, 
      notes,
      guest_info: guestInfo,
      payment_info: paymentInfo 
    } = req.body;
    
    const db = new sqlite3.Database(DB_PATH);

    // Check if service exists and get details
    db.get('SELECT * FROM services WHERE id = ? AND is_active = 1', [serviceId], (err, service) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }

      if (!service) {
        db.close();
        return res.status(404).json({ error: 'Service not found' });
      }

      // Check if user already exists by email
      db.get('SELECT * FROM users WHERE email = ?', [guestInfo.email], (err, existingUser) => {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Database error' });
        }

        const processBooking = (userId) => {
          // Check if time slot is available (same logic as authenticated booking)
          const appointmentDateTime = moment(`${appointmentDate} ${appointmentTime}`);
          const appointmentEnd = appointmentDateTime.clone().add(service.duration, 'minutes');

          db.all(
            `SELECT b.*, s.duration FROM bookings b 
             JOIN services s ON b.service_id = s.id 
             WHERE appointment_date = ? AND status != "cancelled"`,
            [appointmentDate],
            (err, existingBookings) => {
              if (err) {
                db.close();
                return res.status(500).json({ error: 'Database error' });
              }

              // Check for booking conflicts
              const hasBookingConflict = existingBookings.some(booking => {
                const bookingStart = moment(`${booking.appointment_date} ${booking.appointment_time}`);
                const bookingEnd = bookingStart.clone().add(booking.duration, 'minutes');
                
                return appointmentDateTime.isBetween(bookingStart, bookingEnd, null, '[)') ||
                       appointmentEnd.isBetween(bookingStart, bookingEnd, null, '(]') ||
                       (appointmentDateTime.isSameOrBefore(bookingStart) && appointmentEnd.isSameOrAfter(bookingEnd));
              });

              if (hasBookingConflict) {
                db.close();
                return res.status(400).json({ error: 'Time slot is already booked' });
              }

              // Check for blocked slots
              db.all(
                'SELECT * FROM blocked_slots WHERE block_date = ?',
                [appointmentDate],
                (err, blockedSlots) => {
                  if (err) {
                    db.close();
                    return res.status(500).json({ error: 'Database error' });
                  }

                  // Check for blocked time conflicts
                  const hasBlockedConflict = blockedSlots.some(blocked => {
                    const blockedStart = moment(`${appointmentDate} ${blocked.start_time}`);
                    const blockedEnd = moment(`${appointmentDate} ${blocked.end_time}`);
                    
                    return appointmentDateTime.isBetween(blockedStart, blockedEnd, null, '[)') ||
                           appointmentEnd.isBetween(blockedStart, blockedEnd, null, '(]') ||
                           (appointmentDateTime.isSameOrBefore(blockedStart) && appointmentEnd.isSameOrAfter(blockedEnd));
                  });

                  if (hasBlockedConflict) {
                    db.close();
                    return res.status(400).json({ error: 'Time slot is not available (blocked by admin)' });
                  }

                  // Create the booking
                  db.run(
                    'INSERT INTO bookings (user_id, service_id, appointment_date, appointment_time, notes, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
                    [userId, serviceId, appointmentDate, appointmentTime, notes || null, service.price],
                    function(err) {
                      if (err) {
                        db.close();
                        return res.status(500).json({ error: 'Failed to create booking' });
                      }

                      const bookingId = this.lastID;
                      
                      // Get the created booking with service details
                      db.get(
                        `SELECT b.*, s.name as service_name, s.description as service_description, 
                                s.duration, s.price, s.category,
                                u.first_name, u.last_name, u.email, u.phone
                         FROM bookings b 
                         JOIN services s ON b.service_id = s.id 
                         JOIN users u ON b.user_id = u.id 
                         WHERE b.id = ?`,
                        [bookingId],
                        async (err, booking) => {
                          if (err) {
                            db.close();
                            return res.status(500).json({ error: 'Database error' });
                          }

                          // Send email and SMS notifications
                          const notificationResults = await communicationService.sendBookingNotifications(booking);
                          
                          // Update email confirmation status
                          if (notificationResults.email.success) {
                            db.run(
                              'UPDATE bookings SET email_confirmation_sent = 1 WHERE id = ?',
                              [bookingId],
                              (updateErr) => {
                                if (updateErr) {
                                  console.error('❌ Error updating email confirmation status:', updateErr);
                                }
                              }
                            );
                          }

                          db.close();

                          res.status(201).json({
                            message: 'Booking created successfully',
                            booking,
                            isGuestBooking: true,
                            notifications: {
                              email: notificationResults.email.success ? 'sent' : 'failed',
                              sms: notificationResults.sms.success ? 'sent' : 'failed'
                            }
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        };

        if (existingUser) {
          // User exists, use their ID
          processBooking(existingUser.id);
        } else {
          // Create new user account
          const hashedPassword = 'guest_user_' + Date.now(); // Temporary password for guest users
          
          db.run(
            `INSERT INTO users (first_name, last_name, email, password, phone, role, created_via_guest_booking) 
             VALUES (?, ?, ?, ?, ?, 'user', 1)`,
            [guestInfo.firstName, guestInfo.lastName, guestInfo.email, hashedPassword, guestInfo.phone],
            function(err) {
              if (err) {
                db.close();
                if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                  return res.status(400).json({ error: 'Email already registered' });
                }
                return res.status(500).json({ error: 'Failed to create user account' });
              }

              const newUserId = this.lastID;
              processBooking(newUserId);
            }
          );
        }
      });
    });
  } catch (error) {
    console.error('Guest booking creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's bookings
router.get('/my-bookings', authenticateToken, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.all(
    `SELECT b.*, s.name as service_name, s.description as service_description, 
            s.duration, s.price, s.category
     FROM bookings b 
     JOIN services s ON b.service_id = s.id 
     WHERE b.user_id = ? 
     ORDER BY b.appointment_date DESC, b.appointment_time DESC`,
    [req.user.id],
    (err, bookings) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(bookings);
    }
  );
});

// Get booking by ID
router.get('/:id', authenticateToken, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.get(
    `SELECT b.*, s.name as service_name, s.description as service_description, 
            s.duration, s.price, s.category,
            u.first_name, u.last_name, u.email, u.phone
     FROM bookings b 
     JOIN services s ON b.service_id = s.id 
     JOIN users u ON b.user_id = u.id 
     WHERE b.id = ? AND (b.user_id = ? OR ? = 'admin')`,
    [req.params.id, req.user.id, req.user.role],
    (err, booking) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      res.json(booking);
    }
  );
});

// Update booking status
router.put('/:id/status', authenticateToken, [
  body('status').isIn(['confirmed', 'completed', 'cancelled'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bookingId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const db = new sqlite3.Database(DB_PATH);

    // First, get the booking to verify ownership or admin access
    db.get('SELECT * FROM bookings WHERE id = ?', [bookingId], (err, booking) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }

      if (!booking) {
        db.close();
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Check if user owns the booking or is admin
      if (!isAdmin && booking.user_id !== userId) {
        db.close();
        return res.status(403).json({ error: 'Access denied' });
      }

      // Update the booking status
      db.run(
        'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, bookingId],
        function(err) {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Failed to update booking status' });
          }

          // Get the updated booking with service details
          db.get(
            `SELECT b.*, s.name as service_name, s.description as service_description, 
                    s.duration, s.price, s.category
             FROM bookings b 
             JOIN services s ON b.service_id = s.id 
             WHERE b.id = ?`,
            [bookingId],
            (err, updatedBooking) => {
              db.close();
              
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }

              res.json({
                message: 'Booking status updated successfully',
                booking: updatedBooking
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes - Get all bookings
router.get('/admin/all', authenticateToken, requireAdmin, (req, res) => {
  const { date, status } = req.query;
  const db = new sqlite3.Database(DB_PATH);
  
  let query = `
    SELECT b.*, s.name as service_name, s.duration, s.price, s.category,
           u.first_name, u.last_name, u.email, u.phone
    FROM bookings b 
    JOIN services s ON b.service_id = s.id 
    JOIN users u ON b.user_id = u.id
  `;
  
  const conditions = [];
  const params = [];
  
  if (date) {
    conditions.push('b.appointment_date = ?');
    params.push(date);
  }
  
  if (status) {
    conditions.push('b.status = ?');
    params.push(status);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY b.appointment_date DESC, b.appointment_time DESC';
  
  db.all(query, params, (err, bookings) => {
    db.close();
    
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json(bookings);
  });
});

// Admin routes - Get booking statistics
router.get('/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.serialize(() => {
    const stats = {};
    
    // Get total bookings
    db.get('SELECT COUNT(*) as total FROM bookings', (err, result) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database error' });
      }
      stats.totalBookings = result.total;
      
      // Get bookings by status
      db.all(
        'SELECT status, COUNT(*) as count FROM bookings GROUP BY status',
        (err, statusCounts) => {
          if (err) {
            db.close();
            return res.status(500).json({ error: 'Database error' });
          }
          
          stats.byStatus = {};
          statusCounts.forEach(item => {
            stats.byStatus[item.status] = item.count;
          });
          
          // Get revenue
          db.get(
            'SELECT SUM(total_amount) as revenue FROM bookings WHERE status = "completed"',
            (err, revenueResult) => {
              db.close();
              
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }
              
              stats.totalRevenue = revenueResult.revenue || 0;
              res.json(stats);
            }
          );
        }
      );
    });
  });
});

// Admin routes - Block time slots
router.post('/admin/block-slot', authenticateToken, requireAdmin, [
  body('block_date').isDate(),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('reason').optional().trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { block_date, start_time, end_time, reason } = req.body;
    const adminId = req.user.id;

    // Validate that end_time is after start_time
    if (start_time >= end_time) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const db = new sqlite3.Database(DB_PATH);

    // Check for overlapping blocked slots
    db.all(
      `SELECT * FROM blocked_slots 
       WHERE block_date = ? 
       AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
      [block_date, start_time, start_time, end_time, end_time],
      (err, existingBlocks) => {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Database error' });
        }

        if (existingBlocks.length > 0) {
          db.close();
          return res.status(400).json({ error: 'Time slot overlaps with existing blocked time' });
        }

        // Create the blocked slot
        db.run(
          'INSERT INTO blocked_slots (block_date, start_time, end_time, reason, created_by) VALUES (?, ?, ?, ?, ?)',
          [block_date, start_time, end_time, reason || null, adminId],
          function(err) {
            if (err) {
              db.close();
              return res.status(500).json({ error: 'Failed to block time slot' });
            }

            const blockId = this.lastID;
            
            // Get the created blocked slot
            db.get(
              'SELECT * FROM blocked_slots WHERE id = ?',
              [blockId],
              (err, blockedSlot) => {
                db.close();
                
                if (err) {
                  return res.status(500).json({ error: 'Database error' });
                }

                res.status(201).json({
                  message: 'Time slot blocked successfully',
                  blockedSlot
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Block slot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes - Get blocked slots
router.get('/admin/blocked-slots', authenticateToken, requireAdmin, (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  
  db.all(
    'SELECT * FROM blocked_slots ORDER BY block_date DESC, start_time DESC',
    (err, blockedSlots) => {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(blockedSlots);
    }
  );
});

// Admin routes - Delete blocked slot
router.delete('/admin/blocked-slots/:id', authenticateToken, requireAdmin, (req, res) => {
  const blockId = req.params.id;
  const db = new sqlite3.Database(DB_PATH);
  
  db.run(
    'DELETE FROM blocked_slots WHERE id = ?',
    [blockId],
    function(err) {
      db.close();
      
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Blocked slot not found' });
      }

      res.json({ message: 'Blocked slot deleted successfully' });
    }
  );
});

module.exports = router; 