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
        'recipient_name',
        'status',
        'phone',
        'address',
        'payment_type',
        'payment_status',
        'stripe_payment_intent_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

}