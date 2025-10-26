<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Action extends Model
{
    protected $fillable = [
        'service_name',
        'action_key',
        'name',
        'description',
        'parameters',
        'active',
    ];

    protected $casts = [
        'parameters' => 'array',
        'active' => 'boolean',
    ];

    /**
     * Get actions for a specific service
     */
    public static function forService(string $serviceName)
    {
        return self::where('service_name', $serviceName)
            ->where('active', true)
            ->get();
    }

    /**
     * Get all active actions grouped by service
     */
    public static function allGroupedByService()
    {
        return self::where('active', true)
            ->get()
            ->groupBy('service_name');
    }
}
