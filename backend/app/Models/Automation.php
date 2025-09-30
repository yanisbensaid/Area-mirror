<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Automation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'trigger_service_id',
        'action_service_id',
        'action_id',
        'reaction_id',
        'user_id',
        'is_active',
        'category',
        'tags',
        'popularity',
    ];

    protected $casts = [
        'tags' => 'array',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function triggerService()
    {
        return $this->belongsTo(Service::class, 'trigger_service_id');
    }

    public function actionService()
    {
        return $this->belongsTo(Service::class, 'action_service_id');
    }

    public function action()
    {
        return $this->belongsTo(Action::class);
    }

    public function reaction()
    {
        return $this->belongsTo(Reaction::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
};

