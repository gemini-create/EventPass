<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Attendee extends Model
{
    protected $fillable = [
        'event_id', 'name', 'email', 'phone',
        'token', 'checked_in_at', 'checked_in_by',
    ];

    protected $casts = ['checked_in_at' => 'datetime'];

    protected static function booted()
    {
        static::creating(function ($attendee) {
            do {
                $token = 'TKT-' . strtoupper(Str::random(8));
            } while (static::where('token', $token)->exists());

            $attendee->token = $token;
        });
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}