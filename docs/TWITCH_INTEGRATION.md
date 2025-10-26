# Twitch Integration Documentation

## Overview

The Twitch integration enables AREA automation workflows involving Twitch live streaming activities. This integration uses OAuth 2.0 for authentication and supports monitoring stream events and managing stream settings.

## Features

### Actions (Triggers)

#### 1. Stream Started
**Action Name**: `stream_started`

Detects when your Twitch channel goes live.

**Trigger Conditions**:
- User starts a new stream
- Detection happens within 1 minute of going live

**Data Provided**:
```php
[
    'stream_id' => '123456789',
    'user_id' => '987654321',
    'user_name' => 'streamer_name',
    'title' => 'Playing Awesome Game!',
    'game_name' => 'Just Chatting',
    'viewer_count' => 150,
    'started_at' => '2025-10-15T14:30:00Z',
    'thumbnail_url' => 'https://...',
]
```

**Example AREA**:
- **When**: I start streaming on Twitch
- **Then**: Send Telegram notification with stream title

#### 2. New Follower
**Action Name**: `new_follower`

Detects when someone follows your channel.

**Trigger Conditions**:
- New user follows your channel
- Checks last 20 followers

**Data Provided**:
```php
[
    'follower_id' => '111222333',
    'follower_name' => 'new_fan_123',
    'followed_at' => '2025-10-15T15:00:00Z',
]
```

**Example AREA**:
- **When**: I get a new follower on Twitch
- **Then**: Update stream title to thank them

#### 3. Stream Title Changed
**Action Name**: `stream_title_changed`

Monitors changes to your stream title.

**Trigger Conditions**:
- Stream title is updated
- Detects changes within 1 minute

**Data Provided**:
```php
[
    'old_title' => 'Previous Title',
    'new_title' => 'New Stream Title',
    'changed_at' => '2025-10-15T16:00:00Z',
]
```

**Example AREA**:
- **When**: My stream title changes
- **Then**: Send Telegram notification with new title

### Reactions (Responses)

#### 1. Update Stream Title
**Reaction Name**: `update_stream_title`

Changes the title of your current stream.

**Parameters**:
- `title` (required): New stream title (max 140 characters)

**Example**:
```php
[
    'title' => 'Playing Minecraft - Viewer challenges!'
]
```

**Example AREA**:
- **When**: I like a YouTube video
- **Then**: Update Twitch stream title with video name

#### 2. Update Stream Category
**Reaction Name**: `update_stream_category`

Changes the game/category of your stream.

**Parameters**:
- `game_name` (required): Name of the game or category

**Example**:
```php
[
    'game_name' => 'Just Chatting'
]
```

**Implementation Note**: The service automatically searches for the game ID using the Twitch API before updating.

**Example AREA**:
- **When**: Stream title contains "minecraft"
- **Then**: Change category to "Minecraft"

#### 3. Create Stream Marker
**Reaction Name**: `create_stream_marker`

Adds a marker to your current stream's VOD at the current timestamp.

**Parameters**:
- `description` (optional): Marker description (max 140 characters)

**Example**:
```php
[
    'description' => 'Epic moment!'
]
```

**Example AREA**:
- **When**: I get a new follower
- **Then**: Create stream marker with "New follower!"

## Authentication

### OAuth 2.0 Flow

1. **User Initiates Connection**:
   ```bash
   GET /api/oauth/twitch
   Authorization: Bearer {user_token}
   ```

2. **Redirect to Twitch**:
   User is redirected to:
   ```
   https://id.twitch.tv/oauth2/authorize?
     client_id={CLIENT_ID}&
     redirect_uri={REDIRECT_URI}&
     response_type=code&
     scope=user:read:email channel:read:stream_key channel:manage:broadcast user:read:follows channel:manage:videos&
     state={STATE}
   ```

3. **User Authorizes**:
   User approves the application on Twitch

4. **Callback Received**:
   ```bash
   GET /api/oauth/twitch/callback?code={CODE}&state={STATE}
   ```

5. **Token Exchange**:
   Backend exchanges authorization code for access token:
   ```bash
   POST https://id.twitch.tv/oauth2/token
   Content-Type: application/x-www-form-urlencoded

   client_id={CLIENT_ID}&
   client_secret={CLIENT_SECRET}&
   code={CODE}&
   grant_type=authorization_code&
   redirect_uri={REDIRECT_URI}
   ```

6. **Token Storage**:
   Tokens are encrypted and stored in `user_service_tokens` table

### Required Scopes

- `user:read:email` - Read user email address
- `channel:read:stream_key` - Read stream information
- `channel:manage:broadcast` - Modify stream title and category
- `user:read:follows` - Read follower list
- `channel:manage:videos` - Create stream markers

### Token Refresh

Twitch tokens expire after approximately 60 days. The system automatically refreshes tokens when they expire:

```php
POST https://id.twitch.tv/oauth2/token
Content-Type: application/x-www-form-urlencoded

client_id={CLIENT_ID}&
client_secret={CLIENT_SECRET}&
refresh_token={REFRESH_TOKEN}&
grant_type=refresh_token
```

This happens automatically in the `CheckAreas` command when checking AREAs.

## API Endpoints Used

### Get Stream Information
```
GET https://api.twitch.tv/helix/streams?user_id={user_id}
Headers:
  Authorization: Bearer {access_token}
  Client-Id: {client_id}
```

### Get Followers
```
GET https://api.twitch.tv/helix/channels/followers?broadcaster_id={user_id}&first=20
Headers:
  Authorization: Bearer {access_token}
  Client-Id: {client_id}
```

### Get Channel Information
```
GET https://api.twitch.tv/helix/channels?broadcaster_id={user_id}
Headers:
  Authorization: Bearer {access_token}
  Client-Id: {client_id}
```

### Update Channel
```
PATCH https://api.twitch.tv/helix/channels?broadcaster_id={user_id}
Headers:
  Authorization: Bearer {access_token}
  Client-Id: {client_id}
  Content-Type: application/json
Body:
  {
    "title": "New Title",
    "game_id": "123456"
  }
```

### Search Games
```
GET https://api.twitch.tv/helix/games?name={game_name}
Headers:
  Authorization: Bearer {access_token}
  Client-Id: {client_id}
```

### Create Stream Marker
```
POST https://api.twitch.tv/helix/streams/markers
Headers:
  Authorization: Bearer {access_token}
  Client-Id: {client_id}
  Content-Type: application/json
Body:
  {
    "user_id": "{user_id}",
    "description": "Optional description"
  }
```

## Rate Limiting

Twitch imposes the following rate limits:

- **800 requests per minute** per Client ID
- The integration uses a buffer of 750 requests/minute to stay safe
- Rate limit tracking uses Laravel Cache with 60-second TTL
- When rate limit is reached, checks are skipped with warning logs

### Rate Limit Management

```php
private const RATE_LIMIT_PER_MINUTE = 750; // Buffer from 800

private function canMakeRequest(): bool
{
    $currentUsage = Cache::get('twitch_api_rate_limit', 0);
    return $currentUsage < self::RATE_LIMIT_PER_MINUTE;
}

private function incrementRateLimit(): void
{
    $currentUsage = Cache::get('twitch_api_rate_limit', 0);
    Cache::put('twitch_api_rate_limit', $currentUsage + 1, 60);
}
```

### Best Practices

1. **Check frequency**: Don't check streams more than once per minute
2. **Batch requests**: Group multiple checks when possible
3. **Cache user IDs**: User ID is cached for 1 hour to reduce API calls
4. **Monitor usage**: Logs include rate limit information

## Configuration

### Environment Variables

Add to your `.env` file:

```env
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
TWITCH_REDIRECT_URI=http://localhost:8000/api/oauth/twitch/callback
```

### Get Twitch API Credentials

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console)
2. Click "Register Your Application"
3. Fill in details:
   - **Name**: AREA Development
   - **OAuth Redirect URLs**: `http://localhost:8000/api/oauth/twitch/callback`
   - **Category**: Application Integration
4. Copy **Client ID** and **Client Secret**
5. Add to your `.env` file

### Service Registration

The service is automatically registered in `AppServiceProvider.php`:

```php
$manager->register(new \App\Services\Implementations\TwitchService());
```

## Example AREA Configurations

### 1. Stream Alert to Telegram

**Action**: `stream_started`
**Reaction**: `send_message` (Telegram)

```json
{
  "action_service": "Twitch",
  "action_type": "stream_started",
  "reaction_service": "Telegram",
  "reaction_type": "send_message",
  "reaction_config": {
    "message_template": "🔴 {user_name} is now LIVE!\n\n{title}\nGame: {game_name}\nViewers: {viewer_count}\n\nWatch: https://twitch.tv/{user_name}"
  }
}
```

### 2. New Follower Thank You

**Action**: `new_follower` (Twitch)
**Reaction**: `update_stream_title` (Twitch)

```json
{
  "action_service": "Twitch",
  "action_type": "new_follower",
  "reaction_service": "Twitch",
  "reaction_type": "update_stream_title",
  "reaction_config": {
    "title": "Thanks {follower_name} for the follow! ❤️"
  }
}
```

### 3. YouTube Like → Twitch Marker

**Action**: `video_liked` (YouTube)
**Reaction**: `create_stream_marker` (Twitch)

```json
{
  "action_service": "YouTube",
  "action_type": "video_liked",
  "reaction_service": "Twitch",
  "reaction_type": "create_stream_marker",
  "reaction_config": {
    "description": "Liked: {title}"
  }
}
```

### 4. Stream Title Change Alert

**Action**: `stream_title_changed` (Twitch)
**Reaction**: `send_message` (Telegram)

```json
{
  "action_service": "Twitch",
  "action_type": "stream_title_changed",
  "reaction_service": "Telegram",
  "reaction_type": "send_message",
  "reaction_config": {
    "message_template": "📝 Stream title updated!\n\nOld: {old_title}\nNew: {new_title}"
  }
}
```

## Testing

### 1. Service Registration Test

```bash
php artisan tinker
>>> $manager = app(\App\Services\ServiceManager::class);
>>> $twitch = $manager->get('Twitch');
>>> $twitch->getName(); // Should return "Twitch"
>>> $twitch->getAvailableActions(); // Should list 3 actions
>>> $twitch->getAvailableReactions(); // Should list 3 reactions
```

### 2. OAuth Flow Test

```bash
# Start Laravel server
php artisan serve

# In another terminal, authenticate as a user
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get OAuth URL
curl -X GET http://localhost:8000/api/oauth/twitch \
  -H "Authorization: Bearer {token}"

# Visit the returned auth_url in browser
# After authorizing, check database for token
```

### 3. Action Test (Stream Detection)

```bash
# Create an AREA with stream_started action
# Start a stream on Twitch
# Wait 1-2 minutes
php artisan areas:check

# Check logs for:
# - "Twitch: New stream detected"
# - "Reaction executed successfully"
```

### 4. Reaction Test (Update Title)

```bash
# From Artisan Tinker
php artisan tinker

>>> $manager = app(\App\Services\ServiceManager::class);
>>> $twitch = $manager->get('Twitch');
>>> $token = \App\Models\UserServiceToken::where('service_name', 'Twitch')->first();
>>> $twitch->authenticate(['access_token' => $token->getDecryptedAccessToken()]);
>>> $twitch->executeReaction('update_stream_title', ['title' => 'Test Title from AREA!']);
// Should return true and update your stream title
```

## Troubleshooting

### Token Expired

**Symptom**: Actions stop working after ~60 days

**Solution**: The system automatically refreshes tokens. Check logs for:
```
[2025-10-15 10:30:00] local.INFO: 🔄 Token expired, attempting refresh...
[2025-10-15 10:30:01] local.INFO: ✅ Token refreshed successfully
```

If refresh fails, user needs to reconnect Twitch.

### Rate Limit Reached

**Symptom**: Logs show "Twitch API rate limit reached"

**Solution**:
- Reduce check frequency (default is every minute via cron)
- The rate limit resets every minute
- Consider increasing buffer in `RATE_LIMIT_PER_MINUTE` constant

### Stream Not Detected

**Symptom**: AREA doesn't trigger when going live

**Checklist**:
1. Verify AREA is active: `php artisan areas:check`
2. Check if token is valid: Look for authentication errors in logs
3. Ensure cron job is running: `* * * * * cd /path && php artisan schedule:run >> /dev/null 2>&1`
4. Manual test: `php artisan areas:check` immediately after going live

### Category Update Fails

**Symptom**: "Game not found" error when updating category

**Solution**:
- Use exact game name as shown on Twitch
- Common names: "Just Chatting", "Minecraft", "League of Legends"
- Check spelling and capitalization

### No Chat ID for Telegram

**Symptom**: "No chat_id found" warning

**Solution**: User must send `/start` to the Telegram bot before reactions can be sent.

## Error Handling

All errors are logged with context:

```php
Log::error('Failed to check Twitch stream', [
    'user_id' => $userId,
    'error' => $e->getMessage(),
]);
```

Check `storage/logs/laravel.log` for detailed error information.

## Security Considerations

1. **Token Storage**: Access tokens are encrypted using Laravel's encryption
2. **State Parameter**: Includes user_id and timestamp to prevent CSRF
3. **Scopes**: Only request necessary permissions
4. **Token Expiration**: Tokens are automatically refreshed before expiration
5. **API Credentials**: Never commit `.env` file with real credentials

## Performance

- **User ID Caching**: Cached for 1 hour to reduce API calls
- **Rate Limit Tracking**: Uses Laravel Cache with minimal overhead
- **Efficient Queries**: Only fetches last 20 followers, recent streams
- **State Management**: Tracks changes to avoid redundant API calls

## Future Enhancements

Possible additions to Twitch integration:

1. **Actions**:
   - Stream ended
   - Raid received
   - Subscription received
   - Cheer/bits received

2. **Reactions**:
   - Create clip
   - Start commercial
   - Update stream tags
   - Send chat message (via bot)

3. **Features**:
   - Webhook support instead of polling
   - EventSub integration
   - Chat integration
   - Clip management

## Support

For issues or questions:

1. Check logs: `storage/logs/laravel.log`
2. Test connection: `php artisan tinker` → test service methods
3. Review Twitch API docs: https://dev.twitch.tv/docs/api/
4. Check rate limits: Monitor cache key `twitch_api_rate_limit`

## References

- [Twitch API Reference](https://dev.twitch.tv/docs/api/)
- [Twitch Authentication](https://dev.twitch.tv/docs/authentication)
- [Twitch OAuth Scopes](https://dev.twitch.tv/docs/authentication/scopes)
- [Twitch Rate Limits](https://dev.twitch.tv/docs/api/guide#rate-limits)
