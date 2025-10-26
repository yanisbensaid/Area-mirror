<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reaction extends Model
{
    protected $fillable = [
        'service_name',
        'reaction_key',
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
     * Get reactions for a specific service
     */
    public static function forService(string $serviceName)
    {
        return self::where('service_name', $serviceName)
            ->where('active', true)
            ->get();
    }

    /**
     * Get all active reactions grouped by service
     */
    public static function allGroupedByService()
    {
        return self::where('active', true)
            ->get()
            ->groupBy('service_name');
    }
}
