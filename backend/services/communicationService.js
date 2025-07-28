const nodemailer = require('nodemailer');
const twilio = require('twilio');
const moment = require('moment');

class CommunicationService {
  constructor() {
    // Email transporter setup
    this.emailTransporter = null;
    this.setupEmailTransporter();
    
    // Twilio setup
    this.twilioClient = null;
    this.setupTwilioClient();
  }

  setupEmailTransporter() {
    try {
      if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        this.emailTransporter = nodemailer.createTransporter({
          service: process.env.EMAIL_SERVICE, // 'gmail', 'outlook', etc.
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        console.log('✅ Email service configured');
      } else {
        console.log('⚠️ Email service not configured - missing environment variables');
      }
    } catch (error) {
      console.error('❌ Email service setup failed:', error.message);
    }
  }

  setupTwilioClient() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        console.log('✅ SMS service configured');
      } else {
        console.log('⚠️ SMS service not configured - missing environment variables');
      }
    } catch (error) {
      console.error('❌ SMS service setup failed:', error.message);
    }
  }

  // Generate booking confirmation email HTML
  generateBookingConfirmationEmail(booking) {
    const appointmentDate = moment(booking.appointment_date).format('dddd, MMMM Do, YYYY');
    const appointmentTime = moment(booking.appointment_time, 'HH:mm').format('h:mm A');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #E8B4B8, #D4A5A9); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #fefefe; padding: 30px; border: 1px solid #E8B4B8; }
          .booking-details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .label { font-weight: bold; color: #666; }
          .value { color: #333; }
          .footer { background: #f4f4f4; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
          .business-info { margin-top: 20px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌸 Booking Confirmation</h1>
            <p>Olga Sabo Skincare Studio</p>
          </div>
          
          <div class="content">
            <h2>Hello ${booking.first_name}!</h2>
            <p>Thank you for booking with Olga Sabo Skincare Studio. Your appointment has been confirmed!</p>
            
            <div class="booking-details">
              <h3>📅 Appointment Details</h3>
              <div class="detail-row">
                <span class="label">Service:</span>
                <span class="value">${booking.service_name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${appointmentDate}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${appointmentTime}</span>
              </div>
              <div class="detail-row">
                <span class="label">Duration:</span>
                <span class="value">${booking.duration} minutes</span>
              </div>
              <div class="detail-row">
                <span class="label">Price:</span>
                <span class="value">$${booking.price}</span>
              </div>
              ${booking.notes ? `
              <div class="detail-row">
                <span class="label">Notes:</span>
                <span class="value">${booking.notes}</span>
              </div>
              ` : ''}
            </div>

            <div class="booking-details">
              <h3>📍 Location & Contact</h3>
              <p><strong>Olga Sabo Skincare Studio</strong><br>
              📧 Email: olga.sabo.esthetics@gmail.com<br>
              📱 Phone: (555) 123-4567</p>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #856404;">📋 Important Reminders:</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Please arrive 10 minutes early for your appointment</li>
                <li>Bring a valid ID and any relevant medical information</li>
                <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
                <li>You'll receive a text message reminder before your appointment</li>
              </ul>
            </div>

            <p>We look forward to providing you with exceptional skincare services!</p>
            <p>Best regards,<br><strong>Olga Sabo Skincare Studio Team</strong></p>
          </div>
          
          <div class="footer">
            <div class="business-info">
              <p>Olga Sabo Skincare Studio | Professional Esthetics & Skincare Services</p>
              <p>This is an automated confirmation email. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send booking confirmation email
  async sendBookingConfirmation(booking) {
    if (!this.emailTransporter) {
      console.log('⚠️ Email service not available - skipping email confirmation');
      return { success: false, reason: 'Email service not configured' };
    }

    try {
      const htmlContent = this.generateBookingConfirmationEmail(booking);
      const appointmentDate = moment(booking.appointment_date).format('MMMM Do, YYYY');
      
      const mailOptions = {
        from: `"Olga Sabo Skincare Studio" <${process.env.EMAIL_USER}>`,
        to: booking.email,
        subject: `✅ Booking Confirmed - ${booking.service_name} on ${appointmentDate}`,
        html: htmlContent
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log('✅ Booking confirmation email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send booking confirmation email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send SMS reminder
  async sendSMSReminder(booking, reminderType = 'day_before') {
    if (!this.twilioClient) {
      console.log('⚠️ SMS service not available - skipping SMS reminder');
      return { success: false, reason: 'SMS service not configured' };
    }

    try {
      // Clean phone number (remove any formatting)
      const cleanPhone = booking.phone.replace(/[^\d+]/g, '');
      const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+1${cleanPhone}`;
      
      const appointmentDate = moment(booking.appointment_date).format('dddd, MMMM Do');
      const appointmentTime = moment(booking.appointment_time, 'HH:mm').format('h:mm A');
      
      let messageText = '';
      
      if (reminderType === 'day_before') {
        messageText = `🌸 Reminder: You have an appointment tomorrow at Olga Sabo Skincare Studio!\n\n` +
                     `📅 ${appointmentDate} at ${appointmentTime}\n` +
                     `💆‍♀️ Service: ${booking.service_name}\n\n` +
                     `Please arrive 10 minutes early. Contact us if you need to reschedule.\n\n` +
                     `Olga Sabo Skincare Studio`;
      } else if (reminderType === 'same_day') {
        messageText = `🌸 Today's Appointment Reminder!\n\n` +
                     `📅 Today at ${appointmentTime}\n` +
                     `💆‍♀️ Service: ${booking.service_name}\n\n` +
                     `See you soon at Olga Sabo Skincare Studio!`;
      }

      const message = await this.twilioClient.messages.create({
        body: messageText,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });

      console.log('✅ SMS reminder sent:', message.sid);
      return { success: true, messageSid: message.sid };
    } catch (error) {
      console.error('❌ Failed to send SMS reminder:', error);
      return { success: false, error: error.message };
    }
  }

  // Send booking confirmation (email + immediate SMS confirmation)
  async sendBookingNotifications(booking) {
    const results = {
      email: { success: false },
      sms: { success: false }
    };

    // Send email confirmation
    results.email = await this.sendBookingConfirmation(booking);

    // Send immediate SMS confirmation
    if (this.twilioClient && booking.phone) {
      try {
        const cleanPhone = booking.phone.replace(/[^\d+]/g, '');
        const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+1${cleanPhone}`;
        
        const appointmentDate = moment(booking.appointment_date).format('MMMM Do');
        const appointmentTime = moment(booking.appointment_time, 'HH:mm').format('h:mm A');
        
        const confirmationText = `✅ Booking Confirmed at Olga Sabo Skincare Studio!\n\n` +
                                `📅 ${appointmentDate} at ${appointmentTime}\n` +
                                `💆‍♀️ ${booking.service_name}\n\n` +
                                `Confirmation email sent. You'll receive a reminder before your appointment.`;

        const message = await this.twilioClient.messages.create({
          body: confirmationText,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone
        });

        results.sms = { success: true, messageSid: message.sid };
        console.log('✅ SMS confirmation sent:', message.sid);
      } catch (error) {
        console.error('❌ Failed to send SMS confirmation:', error);
        results.sms = { success: false, error: error.message };
      }
    }

    return results;
  }
}

module.exports = new CommunicationService(); 