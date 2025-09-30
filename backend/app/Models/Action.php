<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Action extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'name',
        'description',
        'trigger_type',
        'trigger_config',
    ];

    protected $casts = [
        'trigger_config' => 'array',
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
