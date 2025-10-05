<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Area extends Model
{
    protected $fillable = [
        'user_id', 'name', 'description', 'active',
        'action_service', 'action_type', 'action_config',
        'reaction_service', 'reaction_type', 'reaction_config',
        'last_checked_at', 'last_triggered_at', 'trigger_count'
    ];

    protected $casts = [
        'active' => 'boolean',
        'action_config' => 'array',
        'reaction_config' => 'array',
        'last_checked_at' => 'datetime',
        'last_triggered_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function canExecute(): bool
    {
        // Check if user has both services connected
        $hasActionService = UserServiceToken::where('user_id', $this->user_id)
            ->where('service_name', $this->action_service)
            ->exists();

        $hasReactionService = UserServiceToken::where('user_id', $this->user_id)
            ->where('service_name', $this->reaction_service)
            ->exists();

        return $hasActionService && $hasReactionService;
    }

    public function getLastCheckedVideoIds(): array
    {
        return $this->action_config['last_video_ids'] ?? [];
    }

    public function updateLastCheckedVideoIds(array $videoIds): void
    {
        $config = $this->action_config ?? [];
        $config['last_video_ids'] = $videoIds;
        $this->action_config = $config;
        $this->save();
    }
}
