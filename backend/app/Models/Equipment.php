<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    use HasFactory;

    protected $fillable = ['item', 'number_of_items', 'number_of_sort_items', 'status', 'event_id']; // Include event_id

    // Relationship: Equipment belongs to an event
    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }
}

