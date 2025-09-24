# 📧 Email Setup Guide for AREA Platform

## Current Status
✅ **Your email system is already working!** 
- Emails are currently set to `MAIL_MAILER=log`
- This means emails are saved to `storage/logs/laravel.log` instead of being sent
- Perfect for development and testing

## If You Want to Send Real Emails

### Option 1: Gmail (Easiest)

1. **Get Gmail App Password:**
   - Go to your Google Account settings
   - Enable 2-Factor Authentication
   - Go to "App passwords" 
   - Generate a new app password for "Mail"
   - Copy the 16-character password

2. **Update your `.env` file:**
   ```env
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-gmail@gmail.com
   MAIL_PASSWORD=your-app-password-here
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=your-gmail@gmail.com
   MAIL_FROM_NAME="AREA Platform"
   ```

3. **Replace:**
   - `your-gmail@gmail.com` with your actual Gmail address
   - `your-app-password-here` with the 16-character app password

### Option 2: Other Email Providers

**Outlook/Hotmail:**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USERNAME=your-email@outlook.com
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
```

**Custom SMTP Server:**
```env
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-server.com
MAIL_PORT=587
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
```

## Testing Your Email Setup

### Method 1: Check Logs (Current Setup)
1. Register a new user in your app
2. Check `backend/storage/logs/laravel.log`
3. You'll see the email content there

### Method 2: Test API Endpoint
```bash
curl -X POST http://localhost:8000/api/mail/test \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

## Common Issues

**Problem:** "Connection refused"
**Solution:** Check your SMTP settings and internet connection

**Problem:** "Authentication failed"
**Solution:**
- For Gmail: Make sure you're using an app password, not your regular password
- For other providers: Check username/password are correct

**Problem:** Emails go to spam
**Solution:**
- Use your own domain email address
- Set up proper SPF/DKIM records
- Start with a few test emails

## What Emails Are Sent?

1. **Welcome Email:** Automatically sent when users register
2. **Custom Notifications:** Via API endpoints
3. **Bulk Emails:** To multiple users at once

## Recommendation

For development, keep `MAIL_MAILER=log` - it's perfect for testing without sending real emails!

Only switch to SMTP when you're ready to send real emails to users.
