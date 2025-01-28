<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'date', 'pax', 'venue'];

    // Relationship: An event can have many equipment items
    public function equipment()
    {
        return $this->hasMany(Equipment::class, 'event_id');
    }
}

