# Telegram Bot Setup Guide

This guide explains how to create and configure a Telegram bot for use with the AREA system.

## Table of Contents

- [Creating a Telegram Bot](#creating-a-telegram-bot)
- [Obtaining the Bot Token](#obtaining-the-bot-token)
- [Configuring Environment Variables](#configuring-environment-variables)
- [Testing Your Bot](#testing-your-bot)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Creating a Telegram Bot

### Step 1: Contact BotFather

1. Open Telegram on any device (mobile app, desktop app, or web version)
2. Search for `@BotFather` or visit https://t.me/BotFather
3. Start a conversation with BotFather

### Step 2: Create a New Bot

1. Send the command `/newbot` to BotFather
2. BotFather will ask for a **bot name**. This is a display name that users will see.
   - Example: `My AREA Bot`
3. BotFather will ask for a **username** for your bot. This must:
   - End with `bot` (case insensitive)
   - Be unique across all Telegram bots
   - Example: `my_area_test_bot`

### Step 3: Receive Bot Token

After successful creation, BotFather will provide:
- A confirmation message
- **Bot token** in the format: `123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`
- Link to your bot: `https://t.me/your_bot_username`

**⚠️ Important**: Save this token securely. Anyone with this token can control your bot.

## Obtaining the Bot Token

If you need to retrieve your bot token later:

1. Message BotFather with `/mybots`
2. Select your bot from the list
3. Choose "API Token"
4. BotFather will display your token

## Configuring Environment Variables

### Backend Configuration

1. Copy your bot token
2. Open your `.env` file in the backend directory
3. Add or update the Telegram configuration:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
TELEGRAM_WEBHOOK_URL=http://localhost:8000/api/webhooks/telegram
```

### Environment Variables Explained

- **TELEGRAM_BOT_TOKEN**: Your bot's API token from BotFather
- **TELEGRAM_WEBHOOK_URL**: URL where Telegram will send updates (for production webhooks)

## Testing Your Bot

### Step 1: Start a Conversation

1. Go to your bot's link: `https://t.me/your_bot_username`
2. Click "START" or send `/start`
3. Note the chat ID from the URL or use `/getid` (if implemented)

### Step 2: Test via AREA API

Once your AREA backend is running, you can test the integration:

1. **Connect the service**:
```bash
curl -X POST http://localhost:8000/api/services/connect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{
    "service": "Telegram",
    "credentials": {
      "bot_token": "123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw"
    }
  }'
```

2. **Send a test message**:
```bash
curl -X POST http://localhost:8000/api/test/telegram/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{
    "chat_id": "YOUR_CHAT_ID",
    "text": "Hello from AREA! 🤖"
  }'
```

### Step 3: Get Your Chat ID

To find your chat ID:

1. Send a message to your bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Look for `"chat":{"id": YOUR_CHAT_ID}` in the response

## Security Considerations

### Bot Token Security

- **Never commit tokens to git**: Always use environment variables
- **Regenerate if compromised**: Use BotFather's `/revoke` command
- **Limit bot permissions**: Only give necessary permissions
- **Use webhooks in production**: More secure than polling

### Access Control

- **Private bots**: Set privacy mode to restrict group access
- **Bot commands**: Use BotFather to set up command menu
- **Admin validation**: Verify user permissions in your AREA logic

### Production Setup

For production deployment:

1. **Enable webhooks**:
   - Use `/setwebhook` with BotFather
   - Provide HTTPS endpoint URL
   - Implement webhook verification

2. **Use HTTPS**: Telegram requires HTTPS for webhooks

3. **Rate limiting**: Respect Telegram's limits (30 msgs/second)

## Bot Configuration Options

### Optional Bot Settings (via BotFather)

1. **Bot description**: `/setdescription` - Shown in bot info
2. **Bot about text**: `/setabouttext` - Shown in profile
3. **Bot profile photo**: `/setuserpic` - Upload an image
4. **Bot commands**: `/setcommands` - Create command menu
5. **Privacy mode**: `/setprivacy` - Control group message access

### Example Commands Setup

Send `/setcommands` to BotFather, then:

```
start - Start interacting with the bot
help - Get help and usage information
status - Check connection status
settings - Configure AREA settings
```

## Troubleshooting

### Common Issues

#### 1. "Unauthorized" Error (401)
- **Cause**: Invalid bot token
- **Solution**: Check token format and regenerate if needed

#### 2. "Bad Request: chat not found" (400)
- **Cause**: Invalid chat ID or bot not added to chat
- **Solution**: Verify chat ID and ensure bot has access

#### 3. "Forbidden: bot was blocked by the user" (403)
- **Cause**: User blocked the bot
- **Solution**: User must unblock the bot

#### 4. "Too Many Requests" (429)
- **Cause**: Rate limit exceeded
- **Solution**: Implement proper rate limiting and retry logic

### Debug Mode

Enable detailed logging by setting:

```env
LOG_LEVEL=debug
```

This will log all Telegram API requests and responses.

### Testing Commands

Use these commands to test your integration:

```bash
# Test bot connection
curl -X GET http://localhost:8000/api/test/telegram/info \
  -H "Authorization: Bearer YOUR_API_TOKEN"

# Test message sending
curl -X POST http://localhost:8000/api/test/telegram/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{"chat_id": "YOUR_CHAT_ID", "text": "Test message"}'

# Check service health
curl -X GET http://localhost:8000/api/test/health \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Advanced Configuration

### Webhook Setup (Production)

For production, use webhooks instead of polling:

1. Set up HTTPS endpoint
2. Configure webhook URL:
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
  -d "url=https://yourdomain.com/api/webhooks/telegram"
```

### Group Chat Setup

To use the bot in group chats:

1. Add bot to the group
2. Make bot admin (if needed for certain actions)
3. Use group chat ID (negative number) in API calls

### Bot Privacy Settings

- **Privacy ON**: Bot only sees messages starting with `/` or replies to bot
- **Privacy OFF**: Bot sees all messages in group chats

Configure via BotFather's `/setprivacy` command.

## API Reference

### Telegram Bot API Documentation

- Official Docs: https://core.telegram.org/bots/api
- BotFather Commands: https://core.telegram.org/bots#6-botfather

### AREA Service Endpoints

- Connect Service: `POST /api/services/connect`
- Test Connection: `POST /api/services/Telegram/test`
- Send Message: `POST /api/test/telegram/send`
- Get Bot Info: `GET /api/test/telegram/info`

## Support

If you encounter issues:

1. Check the logs: `tail -f storage/logs/laravel.log`
2. Verify environment variables are set
3. Test with Telegram's API directly
4. Review this documentation
5. Check the Telegram Bot API documentation

For AREA-specific issues, refer to the main project documentation.