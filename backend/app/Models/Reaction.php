<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'name',
        'description',
        'action_type',
        'action_config',
    ];

    protected $casts = [
        'action_config' => 'array',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function automations()
    {
        return $this->hasMany(Automation::class);
    }
}
