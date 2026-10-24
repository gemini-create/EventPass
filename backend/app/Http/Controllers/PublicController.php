<?php

namespace App\Http\Controllers;

use App\Models\Attendee;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PublicController extends Controller
{
    public function showEvent(string $slug)
    {
        $event = Event::where('slug', $slug)->withCount('attendees')->firstOrFail();

        return [
            'title' => $event->title,
            'slug' => $event->slug,
            'description' => $event->description,
            'venue' => $event->venue,
            'event_date' => $event->event_date,
            'capacity' => $event->capacity,
            'seats_left' => $event->capacity
                ? max($event->capacity - $event->attendees_count, 0)
                : null,
            'is_full' => $event->capacity
                ? $event->attendees_count >= $event->capacity
                : false,
        ];
    }

    public function register(Request $request, string $slug)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150',
            'phone' => 'nullable|string|max:20',
        ]);

        $attendee = DB::transaction(function () use ($slug, $data) {
            $event = Event::where('slug', $slug)->lockForUpdate()->firstOrFail();

            if ($event->capacity && $event->attendees()->count() >= $event->capacity) {
                abort(422, 'This event is full.');
            }

            if ($event->attendees()->where('email', $data['email'])->exists()) {
                abort(422, 'This email is already registered for this event.');
            }

            return $event->attendees()->create($data);
        });

        return response()->json([
            'name' => $attendee->name,
            'email' => $attendee->email,
            'token' => $attendee->token,
        ], 201);
    }

    public function ticket(string $token)
    {
        $attendee = Attendee::where('token', $token)->with('event')->firstOrFail();

        return [
            'name' => $attendee->name,
            'email' => $attendee->email,
            'token' => $attendee->token,
            'checked_in_at' => $attendee->checked_in_at,
            'event' => [
                'title' => $attendee->event->title,
                'venue' => $attendee->event->venue,
                'event_date' => $attendee->event->event_date,
            ],
        ];
    }
}