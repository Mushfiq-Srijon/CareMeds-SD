<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'medicine_id',
        'quantity',
        'price'
    ];

    // An order item belongs to a medicine
    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }

    // An order item belongs to an order
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}