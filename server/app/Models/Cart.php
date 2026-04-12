<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'medicine_id',
        'quantity'
    ];
    public $timestamps = false;

    // A cart item belongs to a medicine
    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    // A cart item belongs to a user
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}