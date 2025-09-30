<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'status',
        'auth_type',
        'icon_url',
    ];

    public function actions()
    {
        return $this->hasMany(Action::class);
    }

    public function reactions()
    {
        return $this->hasMany(Reaction::class);
    }

    public function triggerAutomations()
    {
        return $this->hasMany(Automation::class, 'trigger_service_id');
    }

    public function actionAutomations()
    {
        return $this->hasMany(Automation::class, 'action_service_id');
    }

    public function automations()
    {
        return $this->triggerAutomations()->union($this->actionAutomations());
    }
}
