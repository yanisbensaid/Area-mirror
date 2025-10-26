# AREA Service Integration Architecture

This document explains the architectural decisions and design patterns used in the AREA service integration system.

## Table of Contents

- [Overview](#overview)
- [Architecture Patterns](#architecture-patterns)
- [Design Decisions](#design-decisions)
- [Component Breakdown](#component-breakdown)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Scalability Considerations](#scalability-considerations)
- [Extension Guidelines](#extension-guidelines)

## Overview

The AREA service integration system is built using Laravel 12 and follows a modular, extensible architecture that allows for easy integration of external services (APIs) with actions and reactions.

### Core Principles

1. **Separation of Concerns**: Each service is independent and follows a consistent interface
2. **Security First**: All credentials are encrypted and securely stored
3. **Extensibility**: Easy to add new services without modifying existing code
4. **Consistency**: Standardized patterns across all service integrations
5. **Testability**: Clear interfaces and dependency injection for testing

## Architecture Patterns

### 1. Service Layer Pattern

All external service integrations follow a standardized service layer pattern:

```
ServiceInterface (Contract)
    ↓
BaseService (Abstract Implementation)
    ↓
ConcreteService (Specific Implementation)
    ↓
ServiceManager (Registry & Factory)
```

**Why this pattern?**
- Ensures consistency across all services
- Provides common functionality (HTTP client, error handling, logging)
- Makes testing easier through interface abstraction
- Allows for service swapping and mocking

### 2. Repository Pattern (Implicit)

Database interactions are handled through Eloquent models with specific relationships:

```
User ←→ UserServiceToken ←→ Services
```

**Benefits:**
- Clean separation between business logic and data access
- Consistent data handling across the application
- Easy to test and mock database interactions

### 3. Factory Pattern

The `ServiceManager` acts as a factory for service instances:

```php
$telegramService = $serviceManager->get('Telegram');
```

**Why Factory Pattern?**
- Centralized service creation and management
- Lazy loading of services (instantiated only when needed)
- Easy to add new services without changing existing code

### 4. Strategy Pattern

Each service implements different strategies for authentication:

- **API Key**: Simple token-based (Telegram)
- **OAuth2**: Authorization code flow (Gmail, GitHub, etc.)
- **Basic Auth**: Username/password combinations

## Design Decisions

### 1. Why Laravel Sanctum for Authentication?

**Decision**: Use Laravel Sanctum for API authentication
**Reasoning**:
- Lightweight and built for SPAs
- Token-based authentication fits API-first approach
- Easy integration with existing Laravel features
- Supports both session and token-based auth

### 2. Why PostgreSQL for Database?

**Decision**: Use PostgreSQL as the primary database
**Reasoning**:
- JSON column support for flexible service-specific data
- ACID compliance for financial/critical operations
- Better performance for complex queries
- Strong typing and constraints

### 3. Why Interface-Based Design?

**Decision**: All services implement `ServiceInterface`
**Reasoning**:
- **Consistency**: Ensures all services have the same basic methods
- **Testability**: Easy to mock services for unit testing
- **Extensibility**: New services just need to implement the interface
- **Maintainability**: Changes to one service don't affect others

### 4. Why Encrypted Token Storage?

**Decision**: Encrypt all service tokens in the database
**Reasoning**:
- **Security**: Protects user credentials even if database is compromised
- **Compliance**: Meets security standards for credential storage
- **Trust**: Users can trust that their tokens are secure

### 5. Why Service Manager Singleton?

**Decision**: ServiceManager is registered as a singleton
**Reasoning**:
- **Performance**: Services are instantiated once and reused
- **Memory**: Reduces memory usage by sharing instances
- **State**: Maintains service registry across requests

## Component Breakdown

### Core Components

#### 1. ServiceInterface
```php
interface ServiceInterface
{
    public function getName(): string;
    public function authenticate(array $credentials): bool;
    public function executeAction(string $actionName, array $params): mixed;
    public function executeReaction(string $reactionName, array $params): bool;
    // ... other methods
}
```

**Purpose**: Defines the contract that all services must implement
**Design Choice**: Minimal but complete interface that covers all essential operations

#### 2. BaseService
```php
abstract class BaseService implements ServiceInterface
{
    protected function makeRequest(string $method, string $url, array $data = []): Response;
    protected function handleApiError(Response $response): string;
    protected function validateParams(array $params, array $required): void;
    // ... common functionality
}
```

**Purpose**: Provides common functionality for all services
**Design Choice**: Abstract class instead of trait to enforce inheritance hierarchy

#### 3. ServiceManager
```php
class ServiceManager
{
    public function register(ServiceInterface $service): void;
    public function get(string $serviceName): ?ServiceInterface;
    public function getAll(): Collection;
    // ... registry management
}
```

**Purpose**: Central registry and factory for all services
**Design Choice**: Simple registry pattern with lazy loading

#### 4. UserServiceToken Model
```php
class UserServiceToken extends Model
{
    protected $casts = [
        'additional_data' => 'array',
        'expires_at' => 'datetime',
    ];

    public function getDecryptedAccessToken(): ?string;
    public function setAccessTokenAttribute(?string $value): void;
    // ... token management
}
```

**Purpose**: Secure storage and management of service credentials
**Design Choice**: Automatic encryption/decryption through accessors/mutators

### Service-Specific Components

#### TelegramService
```php
class TelegramService extends BaseService
{
    protected string $authType = 'api_key';

    public function getAvailableActions(): array;
    public function getAvailableReactions(): array;
    public function executeAction(string $actionName, array $params): mixed;
    public function executeReaction(string $reactionName, array $params): bool;
}
```

**Design Choices**:
- **API Key Auth**: Simplest authentication method for proof of concept
- **Bot API**: Used Telegram Bot API instead of MTProto for stability
- **Action/Reaction Separation**: Clear distinction between triggers and responses

## Data Flow

### 1. Service Connection Flow

```
User Request → ServiceConnectionController → ServiceManager → TelegramService
     ↓
Authentication Test → API Call → Store Encrypted Token → Response
```

1. User sends connection request with credentials
2. Controller validates input and gets service instance
3. Service attempts authentication with external API
4. If successful, credentials are encrypted and stored
5. Success response is returned to user

### 2. Action Execution Flow

```
Trigger Event → ServiceManager → Service Instance → External API
     ↓
Process Response → Return Structured Data → AREA Processing
```

1. AREA system triggers an action check
2. Service Manager provides authenticated service instance
3. Service makes API call to check for new data
4. Response is processed and structured
5. Data is returned for AREA rule processing

### 3. Reaction Execution Flow

```
AREA Rule Match → ServiceManager → Service Instance → External API
     ↓
Execute Action → Verify Success → Log Result → Complete
```

1. AREA rule matches and triggers reaction
2. Service Manager provides authenticated service instance
3. Service executes the reaction (e.g., send message)
4. Success/failure is verified and logged
5. Result is returned to AREA system

## Security Architecture

### 1. Token Management

**Encryption at Rest**:
```php
// Automatic encryption when storing
$token->access_token = 'plain_text_token';
// Stored as encrypted string in database

// Automatic decryption when retrieving
$plainToken = $token->getDecryptedAccessToken();
```

**Key Management**:
- Uses Laravel's `APP_KEY` for encryption
- Tokens are never logged or exposed in responses
- Automatic cleanup of expired tokens

### 2. API Security

**Request Authentication**:
```php
// All service endpoints require authentication
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/services/connect', [ServiceConnectionController::class, 'connectService']);
});
```

**Input Validation**:
```php
// Service-specific validation rules
$rules = match ($serviceName) {
    'Telegram' => [
        'bot_token' => 'required|string|regex:/^\d+:[A-Za-z0-9_-]{35}$/',
    ],
};
```

### 3. External API Security

**Rate Limiting**:
- Respect external service rate limits
- Implement exponential backoff for retries
- Log rate limit violations

**Error Handling**:
- Never expose internal errors to external APIs
- Sanitize error messages for user display
- Log detailed errors for debugging

## Scalability Considerations

### 1. Performance Optimizations

**Service Instance Caching**:
- ServiceManager uses singleton pattern
- Services are instantiated once per request
- Credentials are cached in service instances

**Database Optimizations**:
- Indexed foreign keys for fast lookups
- JSON columns for flexible service data
- Efficient queries using Eloquent relationships

### 2. Horizontal Scaling

**Stateless Design**:
- Services don't maintain state between requests
- Credentials are retrieved from database each time
- No in-memory caching that would break across servers

**Queue Support**:
- Ready for Laravel Queue integration
- Actions and reactions can be processed asynchronously
- Background processing for heavy operations

### 3. Monitoring and Observability

**Logging Strategy**:
```php
// Structured logging for monitoring
Log::info('Service connection tested', [
    'service' => $serviceName,
    'user_id' => $user->id,
    'result' => $isHealthy ? 'success' : 'failed',
]);
```

**Health Checks**:
- Built-in health check endpoints
- Service-specific status monitoring
- Overall system health aggregation

## Extension Guidelines

### Adding a New Service

1. **Create Service Class**:
```php
class NewService extends BaseService
{
    protected string $name = 'NewService';
    protected string $authType = 'oauth2'; // or 'api_key'

    // Implement required methods...
}
```

2. **Register in ServiceProvider**:
```php
$manager->register(new NewService());
```

3. **Add Configuration**:
```php
// config/services.php
'newservice' => [
    'client_id' => env('NEWSERVICE_CLIENT_ID'),
    'client_secret' => env('NEWSERVICE_CLIENT_SECRET'),
],
```

4. **Update Validation Rules**:
```php
// ServiceConnectionController
'NewService' => [
    'client_id' => 'required|string',
    'client_secret' => 'required|string',
],
```

### OAuth2 Service Implementation

For OAuth2 services, the pattern would be:

```php
class OAuth2Service extends BaseService
{
    protected string $authType = 'oauth2';

    public function getAuthorizationUrl(): string;
    public function handleCallback(string $code): array;
    public function refreshToken(string $refreshToken): array;
}
```

### Webhook Implementation

For services that support webhooks:

```php
// routes/api.php
Route::post('/webhooks/{service}', [WebhookController::class, 'handle']);

// WebhookController
public function handle(string $service, Request $request)
{
    $serviceInstance = $this->serviceManager->get($service);
    return $serviceInstance->handleWebhook($request);
}
```

## Testing Architecture

### 1. Unit Testing

**Service Testing**:
```php
// Mock external API calls
Http::fake([
    'api.telegram.org/*' => Http::response(['ok' => true]),
]);

$service = new TelegramService();
$result = $service->authenticate(['bot_token' => 'test_token']);
$this->assertTrue($result);
```

### 2. Integration Testing

**Database Integration**:
```php
// Test full flow with database
$user = User::factory()->create();
$response = $this->actingAs($user)
    ->postJson('/api/services/connect', [
        'service' => 'Telegram',
        'credentials' => ['bot_token' => 'valid_token']
    ]);
```

### 3. Feature Testing

**End-to-End Testing**:
```php
// Test complete user journey
$this->registerUser()
     ->connectService('Telegram')
     ->sendTestMessage()
     ->verifyMessageReceived();
```

## Future Enhancements

### 1. Planned Features

- **AREA Rules Engine**: Connect actions to reactions
- **Webhook Support**: Real-time event processing
- **Bulk Operations**: Process multiple actions efficiently
- **Service Analytics**: Track usage and performance metrics

### 2. Technical Improvements

- **Caching Layer**: Redis for service instance caching
- **Queue Processing**: Background job processing for actions
- **Event Sourcing**: Track all service interactions
- **API Versioning**: Support multiple API versions

### 3. Security Enhancements

- **Token Rotation**: Automatic refresh of expired tokens
- **Audit Logging**: Track all service access
- **Rate Limiting**: Per-user and per-service limits
- **Encryption Key Rotation**: Regular key updates

## Conclusion

This architecture provides a solid foundation for the AREA service integration system. The modular design allows for easy extension while maintaining security and performance. The use of established Laravel patterns ensures the codebase remains maintainable and follows framework conventions.

Key strengths:
- **Extensible**: Easy to add new services
- **Secure**: Encrypted credential storage
- **Testable**: Clear interfaces and dependency injection
- **Maintainable**: Consistent patterns and separation of concerns
- **Scalable**: Stateless design ready for horizontal scaling

The architecture successfully balances simplicity with functionality, providing a robust foundation for the AREA project's service integration needs.