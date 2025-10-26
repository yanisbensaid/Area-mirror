# Testing Guide for AREA Service Integration

This guide covers comprehensive testing procedures for the AREA service integration system, with a focus on the Telegram service implementation.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Manual Testing](#manual-testing)
- [API Testing](#api-testing)
- [Automated Testing](#automated-testing)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- PHP 8.2+
- Composer
- PostgreSQL 15+
- Laravel 12
- Postman or curl for API testing

### Required Credentials

- Telegram Bot Token (from BotFather)
- Valid Telegram chat ID for testing
- AREA backend running on `http://localhost:8000`

## Environment Setup

### 1. Clone and Install Dependencies

```bash
cd backend
composer install
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Update your `.env` file:

```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=area_test
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Telegram Configuration
TELEGRAM_BOT_TOKEN=123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
TELEGRAM_WEBHOOK_URL=http://localhost:8000/api/webhooks/telegram

LOG_LEVEL=debug
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

## Database Setup

### 1. Run Migrations

```bash
php artisan migrate
```

Expected tables created:
- `users`
- `user_service_tokens`
- `services`
- `actions`
- `reactions`
- `personal_access_tokens`
- `cache`
- `jobs`
- `sessions`

### 2. Verify Database Schema

```bash
php artisan tinker
```

```php
// Check if tables exist
Schema::hasTable('user_service_tokens');
Schema::hasTable('users');

// Check service manager is working
$manager = app(\App\Services\ServiceManager::class);
$manager->getServiceNames();
// Should return: ["Telegram"]

exit
```

## Manual Testing

### 1. Start the Development Server

```bash
php artisan serve
```

Server should start at `http://localhost:8000`

### 2. Register a Test User

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "token": "your_auth_token_here",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "role": "user",
    "is_admin": false
  }
}
```

Save the token for subsequent requests.

### 3. Test Service Discovery

```bash
curl -X GET http://localhost:8000/api/services/available \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "name": "Telegram",
        "description": "Send messages and monitor Telegram chats via Bot API",
        "auth_type": "api_key",
        "icon": "https://telegram.org/img/t_logo.png",
        "color": "#0088cc",
        "is_connected": false,
        "connection_status": "disconnected",
        "actions": {
          "new_message_in_chat": {...},
          "message_contains_keyword": {...},
          "bot_mentioned": {...}
        },
        "reactions": {
          "send_message": {...},
          "send_photo": {...},
          "send_document": {...}
        }
      }
    ],
    "total": 1
  }
}
```

## API Testing

### 1. Connect Telegram Service

```bash
curl -X POST http://localhost:8000/api/services/connect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "service": "Telegram",
    "credentials": {
      "bot_token": "123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Successfully connected to Telegram",
  "data": {
    "service": "Telegram",
    "connected_at": "2025-09-29T21:45:00.000000Z"
  }
}
```

### 2. Test Connection

```bash
curl -X POST http://localhost:8000/api/services/Telegram/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "service": "Telegram",
    "connection_status": "healthy",
    "authenticated": true,
    "tested_at": "2025-09-29T21:46:00.000000Z"
  }
}
```

### 3. Test Bot Information

```bash
curl -X GET http://localhost:8000/api/test/telegram/info \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "service": "Telegram",
    "connection_status": "healthy",
    "authenticated": true,
    "token_valid": true,
    "token_expires_at": null,
    "tested_at": "2025-09-29T21:47:00.000000Z"
  }
}
```

### 4. Send Test Message

**Get your chat ID first**:
1. Send a message to your bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Find your chat ID in the response

```bash
curl -X POST http://localhost:8000/api/test/telegram/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "chat_id": "YOUR_CHAT_ID",
    "text": "Hello from AREA! 🤖 This is a test message."
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "chat_id": "YOUR_CHAT_ID",
    "text": "Hello from AREA! 🤖 This is a test message.",
    "sent_at": "2025-09-29T21:48:00.000000Z"
  }
}
```

You should receive the message in your Telegram chat.

### 5. Test Photo Sending

```bash
curl -X POST http://localhost:8000/api/test/telegram/photo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "chat_id": "YOUR_CHAT_ID",
    "photo_url": "https://picsum.photos/400/300",
    "caption": "Test photo from AREA system 📸"
  }'
```

### 6. Test Message Checking (Actions)

```bash
curl -X POST http://localhost:8000/api/test/telegram/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "chat_id": "YOUR_CHAT_ID"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "chat_id": "YOUR_CHAT_ID",
    "messages": [
      {
        "message_id": 123,
        "text": "Hello from AREA! 🤖 This is a test message.",
        "from": {
          "id": 987654321,
          "username": "testuser",
          "first_name": "Test"
        },
        "date": 1695945600,
        "chat": {
          "id": 123456789,
          "type": "private"
        }
      }
    ],
    "count": 1,
    "checked_at": "2025-09-29T21:50:00.000000Z"
  }
}
```

### 7. Test Health Check

```bash
curl -X GET http://localhost:8000/api/test/health \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "services": {
      "Telegram": {
        "status": "healthy",
        "authenticated": true,
        "last_checked": "2025-09-29T21:51:00.000000Z"
      }
    },
    "overall_status": "healthy",
    "checked_at": "2025-09-29T21:51:00.000000Z"
  }
}
```

### 8. Test Service Disconnection

```bash
curl -X DELETE http://localhost:8000/api/services/Telegram/disconnect \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "message": "Successfully disconnected from Telegram"
}
```

## Automated Testing

### 1. PHPUnit Tests

Run the existing test suite:

```bash
php artisan test
```

### 2. Feature Tests

Create a feature test for the Telegram service:

```bash
php artisan make:test TelegramServiceTest
```

Example test structure:

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Services\ServiceManager;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TelegramServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_connect_telegram_service()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/services/connect', [
                'service' => 'Telegram',
                'credentials' => [
                    'bot_token' => '123456789:test_token_for_testing_only'
                ]
            ]);

        $response->assertStatus(200)
                ->assertJson(['success' => true]);
    }

    public function test_telegram_service_is_registered()
    {
        $manager = app(ServiceManager::class);
        $this->assertTrue($manager->has('Telegram'));
    }
}
```

### 3. Unit Tests

Test individual service components:

```bash
php artisan make:test Services/TelegramServiceUnitTest --unit
```

## Testing Checklist

### Basic Functionality
- [ ] User registration works
- [ ] User can authenticate
- [ ] Service discovery returns Telegram
- [ ] Service connection succeeds with valid token
- [ ] Service connection fails with invalid token
- [ ] Connection test passes when connected
- [ ] Bot info retrieval works
- [ ] Message sending works
- [ ] Photo sending works
- [ ] Message checking (actions) works
- [ ] Service disconnection works
- [ ] Health check reports correctly

### Error Handling
- [ ] Invalid bot token returns proper error
- [ ] Invalid chat ID returns proper error
- [ ] Rate limiting is respected
- [ ] Network errors are handled gracefully
- [ ] Database errors are handled
- [ ] Authentication failures are handled

### Security
- [ ] Tokens are encrypted in database
- [ ] API tokens are required for protected endpoints
- [ ] Bot tokens are not logged
- [ ] Sensitive data is not exposed in API responses

### Performance
- [ ] API responses are under 2 seconds
- [ ] Database queries are optimized
- [ ] Large message lists are paginated
- [ ] Rate limiting prevents abuse

## Troubleshooting

### Common Issues

#### 1. "Service not found" Error
**Cause**: ServiceManager not properly registered
**Solution**: Check `AppServiceProvider.php` registration

#### 2. Database Connection Error
**Cause**: PostgreSQL not running or wrong credentials
**Solution**: Verify database is running and credentials are correct

#### 3. "Telegram API Unauthorized"
**Cause**: Invalid bot token
**Solution**: Check token format and regenerate if needed

#### 4. "Class not found" Error
**Cause**: Autoloader not updated
**Solution**: Run `composer dump-autoload`

### Debug Commands

Enable debug logging:
```bash
tail -f storage/logs/laravel.log
```

Check service registration:
```bash
php artisan tinker
$manager = app(\App\Services\ServiceManager::class);
$manager->getAll();
```

Test database connection:
```bash
php artisan migrate:status
```

### Environment Issues

If tests fail, check:

1. **Environment variables**: Ensure `.env` is properly configured
2. **Database**: Verify PostgreSQL is running
3. **Dependencies**: Run `composer install`
4. **Migrations**: Run `php artisan migrate`
5. **Cache**: Clear with `php artisan cache:clear`

## Test Data

### Sample Bot Token Format
```
123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
```

### Sample Chat IDs
- Private chat: `123456789` (positive number)
- Group chat: `-1001234567890` (negative number)
- Channel: `-1001234567890` (negative number)

### Sample Test Messages
```json
{
  "text": "Hello AREA! 👋",
  "parse_mode": "Markdown"
}
```

## Performance Benchmarks

Expected response times:
- Service connection: < 2 seconds
- Message sending: < 1 second
- Bot info retrieval: < 500ms
- Health check: < 200ms

## Next Steps

After successful testing:
1. Deploy to staging environment
2. Set up production Telegram webhook
3. Implement monitoring and alerting
4. Add integration tests for other services
5. Set up automated CI/CD testing

## Support

For additional help:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Review Telegram API documentation
3. Test with Telegram API directly
4. Check this testing guide
5. Verify environment configuration