# Email & SMS Configuration Setup

## Overview
The booking system now includes automatic email confirmations and SMS reminders for all bookings (both guest and logged-in users).

## Required Environment Variables

Add these variables to your `.env` file in the backend directory:

### Email Configuration (Required)
```bash
# Email service provider (gmail, outlook, yahoo, etc.)
EMAIL_SERVICE=gmail

# Your email address (must match the service)
EMAIL_USER=your_email@gmail.com

# App password (not your regular password)
EMAIL_PASS=your_app_password_here
```

### SMS Configuration (Required)
```bash
# Twilio Account SID (from your Twilio dashboard)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here

# Twilio Auth Token (from your Twilio dashboard)
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here

# Your Twilio phone number (must be verified)
TWILIO_PHONE_NUMBER=+1234567890
```

## Setup Instructions

### Email Setup (Gmail Example)
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
   - Use this generated password as EMAIL_PASS

### SMS Setup (Twilio)
1. Create a free Twilio account at https://www.twilio.com/
2. Get your Account SID and Auth Token from the console
3. Get a Twilio phone number (free trial includes one)
4. Add the credentials to your .env file

## Features

### Email Confirmations
- ✅ Sent immediately after booking creation
- ✅ Beautiful HTML template with booking details
- ✅ Includes appointment date, time, service details
- ✅ Professional branding for Olga Sabo Skincare Studio

### SMS Notifications
- ✅ **Immediate Confirmation**: Sent right after booking
- ✅ **Day-Before Reminder**: Sent 24 hours before appointment
- ✅ **Same-Day Reminder**: Sent 2 hours before appointment

### Automatic Tracking
- ✅ Tracks which reminders have been sent
- ✅ Prevents duplicate messages
- ✅ Admin can view reminder statistics

## Testing

1. Update your .env file with the credentials
2. Restart the backend server
3. Create a test booking (guest or logged-in)
4. Check that you receive:
   - Email confirmation
   - SMS confirmation

## Production Notes

- Use production email service credentials
- Use production Twilio account (not trial)
- Ensure phone numbers are in international format (+1XXXXXXXXXX)
- Monitor email delivery rates and SMS costs

## Troubleshooting

### Email Issues
- Verify EMAIL_SERVICE matches your provider
- Check EMAIL_USER is correct
- Ensure EMAIL_PASS is an app password, not regular password
- Check spam folder

### SMS Issues
- Verify Twilio credentials are correct
- Ensure phone numbers are in +1XXXXXXXXXX format
- Check Twilio account balance
- Verify sender phone number is active

## Support

If you encounter issues:
1. Check the server console for error messages
2. Verify all environment variables are set correctly
3. Test with a simple booking first
4. Contact support if problems persist 