<?php

namespace App\Http\Controllers;

use App\Models\Attendee;
use Illuminate\Http\Request;

class CheckInController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate(['token' => 'required|string|max:40']);
        $user = $request->user();

        $attendee = Attendee::where('token', strtoupper(trim($data['token'])))->first();

        if (! $attendee) {
            return response()->json(['status' => 'invalid'], 404);
        }

        // Only one request can change checked_in_at from null, so duplicates can't both succeed.
        $updated = Attendee::where('id', $attendee->id)
            ->whereNull('checked_in_at')
            ->update(['checked_in_at' => now(), 'checked_in_by' => $user->id]);

        if ($updated === 0) {
            return response()->json([
                'status' => 'duplicate',
                'name' => $attendee->name,
                'checked_in_at' => $attendee->fresh()->checked_in_at,
            ], 409);
        }

        return response()->json([
            'status' => 'success',
            'name' => $attendee->name,
            'checked_in_at' => $attendee->fresh()->checked_in_at,
        ]);
    }
}