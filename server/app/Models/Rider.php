<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rider extends Model
{
    protected $fillable = [
        'name',
        'phone'
    ];

    // A rider has many orders
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}