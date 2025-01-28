<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    // Allow mass assignment for these columns
    protected $fillable = [
        'name',
        'table_no',
        'time_acquired',
        'time_starts',
        'time_ends',
        'status'
    ];
}

