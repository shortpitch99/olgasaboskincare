const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const moment = require('moment');
const communicationService = require('./communicationService');

const DB_PATH = path.join(__dirname, '..', process.env.DB_NAME || 'olga_skincare.db');

class ReminderService {
  constructor() {
    this.isRunning = false;
    this.reminderInterval = null;
  }

  // Start the reminder service
  start() {
    if (this.isRunning) {
      console.log('📱 Reminder service is already running');
      return;
    }

    console.log('📱 Starting SMS reminder service...');
    this.isRunning = true;

    // Check for reminders every hour
    this.reminderInterval = setInterval(() => {
      this.checkAndSendReminders();
    }, 60 * 60 * 1000); // 1 hour

    // Run immediately on start
    this.checkAndSendReminders();

    console.log('✅ SMS reminder service started');
  }

  // Stop the reminder service
  stop() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }
    this.isRunning = false;
    console.log('📱 SMS reminder service stopped');
  }

  // Check for upcoming appointments and send reminders
  async checkAndSendReminders() {
    try {
      console.log('🔍 Checking for upcoming appointments...');
      
      const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
      const today = moment().format('YYYY-MM-DD');
      const currentTime = moment().format('HH:mm');
      
      const db = new sqlite3.Database(DB_PATH);

      // Get appointments for tomorrow (day-before reminders)
      db.all(
        `SELECT b.*, s.name as service_name, s.duration, 
                u.first_name, u.last_name, u.email, u.phone
         FROM bookings b 
         JOIN services s ON b.service_id = s.id 
         JOIN users u ON b.user_id = u.id 
         WHERE b.appointment_date = ? 
         AND b.status IN ('confirmed', 'pending')
         AND (b.day_before_reminder_sent IS NULL OR b.day_before_reminder_sent = 0)`,
        [tomorrow],
        async (err, tomorrowBookings) => {
          if (err) {
            console.error('❌ Error fetching tomorrow\'s bookings:', err);
            return;
          }

          // Send day-before reminders
          for (const booking of tomorrowBookings) {
            const result = await communicationService.sendSMSReminder(booking, 'day_before');
            
            if (result.success) {
              // Mark reminder as sent
              db.run(
                'UPDATE bookings SET day_before_reminder_sent = 1 WHERE id = ?',
                [booking.id],
                (updateErr) => {
                  if (updateErr) {
                    console.error('❌ Error updating reminder status:', updateErr);
                  } else {
                    console.log(`✅ Day-before reminder sent and marked for booking ${booking.id}`);
                  }
                }
              );
            }
          }

          console.log(`📱 Processed ${tomorrowBookings.length} day-before reminders`);
        }
      );

      // Get appointments for today (same-day reminders - 2 hours before)
      db.all(
        `SELECT b.*, s.name as service_name, s.duration, 
                u.first_name, u.last_name, u.email, u.phone
         FROM bookings b 
         JOIN services s ON b.service_id = s.id 
         JOIN users u ON b.user_id = u.id 
         WHERE b.appointment_date = ? 
         AND b.status IN ('confirmed', 'pending')
         AND (b.same_day_reminder_sent IS NULL OR b.same_day_reminder_sent = 0)`,
        [today],
        async (err, todayBookings) => {
          if (err) {
            console.error('❌ Error fetching today\'s bookings:', err);
            db.close();
            return;
          }

          // Filter bookings that are 2 hours away
          const upcomingBookings = todayBookings.filter(booking => {
            const appointmentTime = moment(booking.appointment_time, 'HH:mm');
            const twoHoursBefore = appointmentTime.clone().subtract(2, 'hours');
            const currentMoment = moment(currentTime, 'HH:mm');
            
            // Send reminder if current time is within 15 minutes of 2 hours before
            return currentMoment.isBetween(
              twoHoursBefore.clone().subtract(15, 'minutes'),
              twoHoursBefore.clone().add(15, 'minutes')
            );
          });

          // Send same-day reminders
          for (const booking of upcomingBookings) {
            const result = await communicationService.sendSMSReminder(booking, 'same_day');
            
            if (result.success) {
              // Mark reminder as sent
              db.run(
                'UPDATE bookings SET same_day_reminder_sent = 1 WHERE id = ?',
                [booking.id],
                (updateErr) => {
                  if (updateErr) {
                    console.error('❌ Error updating reminder status:', updateErr);
                  } else {
                    console.log(`✅ Same-day reminder sent and marked for booking ${booking.id}`);
                  }
                }
              );
            }
          }

          console.log(`📱 Processed ${upcomingBookings.length} same-day reminders`);
          db.close();
        }
      );

    } catch (error) {
      console.error('❌ Error in reminder service:', error);
    }
  }

  // Manually send a reminder for a specific booking
  async sendManualReminder(bookingId, reminderType = 'day_before') {
    try {
      const db = new sqlite3.Database(DB_PATH);
      
      db.get(
        `SELECT b.*, s.name as service_name, s.duration, 
                u.first_name, u.last_name, u.email, u.phone
         FROM bookings b 
         JOIN services s ON b.service_id = s.id 
         JOIN users u ON b.user_id = u.id 
         WHERE b.id = ?`,
        [bookingId],
        async (err, booking) => {
          db.close();
          
          if (err) {
            console.error('❌ Error fetching booking:', err);
            return { success: false, error: err.message };
          }

          if (!booking) {
            return { success: false, error: 'Booking not found' };
          }

          const result = await communicationService.sendSMSReminder(booking, reminderType);
          
          if (result.success) {
            // Update reminder status
            const db2 = new sqlite3.Database(DB_PATH);
            const columnName = reminderType === 'day_before' ? 'day_before_reminder_sent' : 'same_day_reminder_sent';
            
            db2.run(
              `UPDATE bookings SET ${columnName} = 1 WHERE id = ?`,
              [bookingId],
              (updateErr) => {
                db2.close();
                if (updateErr) {
                  console.error('❌ Error updating reminder status:', updateErr);
                }
              }
            );
          }

          return result;
        }
      );
    } catch (error) {
      console.error('❌ Error sending manual reminder:', error);
      return { success: false, error: error.message };
    }
  }

  // Get reminder statistics
  async getReminderStats() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);
      
      db.get(
        `SELECT 
           COUNT(*) as total_bookings,
           SUM(CASE WHEN day_before_reminder_sent = 1 THEN 1 ELSE 0 END) as day_before_sent,
           SUM(CASE WHEN same_day_reminder_sent = 1 THEN 1 ELSE 0 END) as same_day_sent
         FROM bookings 
         WHERE appointment_date >= date('now') 
         AND status IN ('confirmed', 'pending')`,
        (err, stats) => {
          db.close();
          
          if (err) {
            reject(err);
          } else {
            resolve(stats);
          }
        }
      );
    });
  }
}

module.exports = new ReminderService(); 