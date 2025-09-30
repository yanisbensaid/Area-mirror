<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'role_assigned_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role_assigned_at' => 'datetime',
        ];
    }

    /**
     * Constants for user roles
     */
    const ROLE_USER = 'user';
    const ROLE_ADMIN = 'admin';

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Check if user is regular user
     */
    public function isUser(): bool
    {
        return $this->role === self::ROLE_USER;
    }

    /**
     * Assign admin role to user
     */
    public function makeAdmin(): void
    {
        $this->update([
            'role' => self::ROLE_ADMIN,
            'role_assigned_at' => now(),
        ]);
    }

    /**
     * Assign user role to user
     */
    public function makeUser(): void
    {
        $this->update([
            'role' => self::ROLE_USER,
            'role_assigned_at' => now(),
        ]);
    }

    /**
     * Get all admin users
     */
    public static function admins()
    {
        return static::where('role', self::ROLE_ADMIN);
    }

    /**
     * Get all regular users
     */
    public static function regularUsers()
    {
        return static::where('role', self::ROLE_USER);
    }

    /**
     * Get the service tokens for this user
     */
    public function serviceTokens(): HasMany
    {
        return $this->hasMany(UserServiceToken::class);
    }

    /**
     * Get active service tokens for this user
     */
    public function activeServiceTokens(): HasMany
    {
        return $this->serviceTokens()->active();
    }

    /**
     * Get a service token for a specific service
     */
    public function getServiceToken(string $serviceName): ?UserServiceToken
    {
        return $this->serviceTokens()
            ->forService($serviceName)
            ->active()
            ->first();
    }

    /**
     * Check if user has a valid token for a service
     */
    public function hasServiceToken(string $serviceName): bool
    {
        return $this->serviceTokens()
            ->forService($serviceName)
            ->valid()
            ->exists();
    }
}
