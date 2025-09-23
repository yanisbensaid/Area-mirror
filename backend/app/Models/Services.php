<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Services extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'status',
        'auth_type',
    ];

    public function actions(): HasMany
    {
        return $this->hasMany(Actions::class, 'service_id');
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(Reactions::class, 'service_id');
    }
}
