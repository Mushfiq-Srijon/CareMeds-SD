<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordResetToken extends Model
{
    protected $fillable = [
        'email',
        'token',
        'expires_at'
    ];

    // Tell Laravel the primary key is email not id
    protected $primaryKey = 'email';

    // Primary key is a string not an integer
    protected $keyType = 'string';

    // No auto incrementing since primary key is email
    public $incrementing = false;

    public $timestamps = false;

    // Cast expires_at as a Carbon date automatically
    protected $casts = [
        'expires_at' => 'datetime'
    ];
}