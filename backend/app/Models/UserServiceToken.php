<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

/**
 * User Service Token Model
 *
 * Stores encrypted authentication tokens for external services per user.
 * Supports both API key and OAuth2 token storage with automatic encryption.
 */
class UserServiceToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'service_name',
        'access_token',
        'refresh_token',
        'expires_at',
        'additional_data',
        'is_active',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'additional_data' => 'array',
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'access_token',
        'refresh_token',
    ];

    /**
     * Relationship: User who owns this token
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if the token is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Check if the token is valid (active and not expired)
     */
    public function isValid(): bool
    {
        return $this->is_active && !$this->isExpired();
    }

    /**
     * Get the decrypted access token
     */
    public function getDecryptedAccessToken(): ?string
    {
        if (!$this->access_token) {
            return null;
        }

        try {
            return Crypt::decryptString($this->access_token);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get the decrypted refresh token
     */
    public function getDecryptedRefreshToken(): ?string
    {
        if (!$this->refresh_token) {
            return null;
        }

        try {
            return Crypt::decryptString($this->refresh_token);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Set the access token (automatically encrypted)
     */
    public function setAccessTokenAttribute(?string $value): void
    {
        $this->attributes['access_token'] = $value ? Crypt::encryptString($value) : null;
    }

    /**
     * Set the refresh token (automatically encrypted)
     */
    public function setRefreshTokenAttribute(?string $value): void
    {
        $this->attributes['refresh_token'] = $value ? Crypt::encryptString($value) : null;
    }

    /**
     * Scope: Get active tokens only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Get valid (active and not expired) tokens only
     */
    public function scopeValid($query)
    {
        return $query->active()
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    /**
     * Scope: Get tokens for a specific service
     */
    public function scopeForService($query, string $serviceName)
    {
        return $query->where('service_name', $serviceName);
    }

    /**
     * Create or update a token for a user and service
     */
    public static function updateOrCreateToken(
        int $userId,
        string $serviceName,
        string $accessToken,
        ?string $refreshToken = null,
        ?\DateTime $expiresAt = null,
        ?array $additionalData = null
    ): self {
        return self::updateOrCreate(
            [
                'user_id' => $userId,
                'service_name' => $serviceName,
            ],
            [
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'expires_at' => $expiresAt,
                'additional_data' => $additionalData,
                'is_active' => true,
            ]
        );
    }

    /**
     * Get all credentials in a format suitable for service authentication
     */
    public function getCredentialsArray(): array
    {
        $credentials = [
            'access_token' => $this->getDecryptedAccessToken(),
        ];

        if ($this->refresh_token) {
            $credentials['refresh_token'] = $this->getDecryptedRefreshToken();
        }

        if ($this->expires_at) {
            $credentials['expires_at'] = $this->expires_at;
        }

        if ($this->additional_data) {
            $credentials = array_merge($credentials, $this->additional_data);
        }

        return array_filter($credentials, fn($value) => $value !== null);
    }
}
