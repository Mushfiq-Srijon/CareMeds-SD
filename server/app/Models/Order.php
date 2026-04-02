<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'pharmacy_id',
        'delivery_type',
        'delivery_charge',
        'total_price',
        'rider_id',
        'status',
        'phone',
        'address'
    ];

    // An order belongs to a user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // An order has many order items
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // An order belongs to a rider
    public function rider()
    {
        return $this->belongsTo(Rider::class);
    }
}