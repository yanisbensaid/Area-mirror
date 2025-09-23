<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reactions extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'name',
        'description',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Services::class, 'service_id');
    }
}
