# Email System Documentation

This document explains how to use the email system in the AREA backend.

## Overview

The email system includes:
- **Mail Classes**: `WelcomeMail` and `NotificationMail`
- **Email Templates**: Professional HTML templates with responsive design
- **Mail Controller**: API endpoints for sending emails
- **Automatic Welcome Emails**: Sent when users register

## Mail Classes

### WelcomeMail
Sends a welcome email to new users with account information and getting started instructions.

```php
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\Mail;

// Basic usage
Mail::to($user->email)->send(new WelcomeMail($user));

// With custom message
Mail::to($user->email)->send(new WelcomeMail($user, "Welcome to our exclusive platform!"));
```

### NotificationMail
Generic notification email for any purpose.

```php
use App\Mail\NotificationMail;
use Illuminate\Support\Facades\Mail;

Mail::to($user->email)->send(new NotificationMail(
    $user,
    'Your automation is ready!',           // Subject
    'Automation Complete',                 // Title
    'Your workflow has been successfully created and is now active.', // Message
    'View Dashboard',                      // Action button text (optional)
    'https://yourapp.com/dashboard'        // Action button URL (optional)
));
```

## API Endpoints

### Test Email Configuration
`POST /api/mail/test`

Test your email configuration by sending a test email.

**Request:**
```json
{
    "email": "test@example.com"
}
```

### Send Welcome Email (Protected)
`POST /api/mail/welcome`

Send a welcome email to a specific user.

**Request:**
```json
{
    "user_id": 1,
    "custom_message": "Welcome to our exclusive platform!" // optional
}
```

### Send Notification Email (Protected)
`POST /api/mail/notification`

Send a custom notification email.

**Request:**
```json
{
    "user_id": 1,
    "subject": "Your automation is ready!",
    "title": "Automation Complete",
    "message": "Your workflow has been successfully created and is now active.",
    "action_text": "View Dashboard", // optional
    "action_url": "https://yourapp.com/dashboard" // optional
}
```

### Send Bulk Email (Protected)
`POST /api/mail/bulk`

Send the same notification to multiple users.

**Request:**
```json
{
    "user_ids": [1, 2, 3],
    "subject": "System Maintenance",
    "title": "Scheduled Maintenance Notice",
    "message": "We will be performing system maintenance tomorrow from 2-4 AM EST.",
    "action_text": "Learn More", // optional
    "action_url": "https://yourapp.com/maintenance" // optional
}
```

## Configuration

### Environment Variables
Make sure these are set in your `.env` file:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="AREA Platform"

APP_NAME="AREA"
APP_URL=http://localhost:3000
```

### For Gmail:
1. Enable 2-factor authentication
2. Generate an "App Password" for Laravel
3. Use the app password in `MAIL_PASSWORD`

### For Development:
You can use `log` driver to save emails to storage/logs/laravel.log instead of sending them:

```env
MAIL_MAILER=log
```

## Automatic Welcome Emails

Welcome emails are automatically sent when users register through the `/api/register` endpoint. This happens in the `AuthController::register` method.

If the email fails to send, it won't prevent user registration - it just logs a warning.

## Customizing Templates

Email templates are located in `resources/views/emails/`:
- `layout.blade.php` - Base template with styling
- `welcome.blade.php` - Welcome email template
- `notification.blade.php` - Generic notification template

You can modify these templates to match your brand and design requirements.

## Error Handling

All email sending operations include proper error handling:
- API endpoints return appropriate error responses
- Failed bulk emails are tracked individually
- Registration continues even if welcome email fails

## Examples

### Send Welcome Email with Custom Message
```bash
curl -X POST http://localhost:8000/api/mail/welcome \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "user_id": 1,
    "custom_message": "Thanks for joining our beta program!"
  }'
```

### Send Automation Notification
```bash
curl -X POST http://localhost:8000/api/mail/notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "user_id": 1,
    "subject": "Automation Triggered",
    "title": "Your Workflow Executed Successfully",
    "message": "Your GitHub to Slack automation ran at 2:30 PM and posted 3 new issues to your team channel.",
    "action_text": "View Details",
    "action_url": "https://yourapp.com/automations/123"
  }'
```
