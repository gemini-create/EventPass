<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AttendeeController extends Controller
{
    public function index(Request $request, string $eventId)
    {
        $event = $request->user()->events()->findOrFail($eventId);

        return $event->attendees()
            ->when($request->query('search'), function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->query('status') === 'checked_in', fn ($q) => $q->whereNotNull('checked_in_at'))
            ->when($request->query('status') === 'pending', fn ($q) => $q->whereNull('checked_in_at'))
            ->orderBy('name')
            ->get();
    }

    public function stats(Request $request, string $eventId)
    {
        $event = $request->user()->events()->findOrFail($eventId);

        $registered = $event->attendees()->count();
        $checkedIn = $event->attendees()->whereNotNull('checked_in_at')->count();

        return [
            'registered' => $registered,
            'checked_in' => $checkedIn,
            'remaining' => $registered - $checkedIn,
            'attendance_percent' => $registered ? round($checkedIn / $registered * 100) : 0,
        ];
    }

    public function export(Request $request, string $eventId)
    {
        $event = $request->user()->events()->findOrFail($eventId);
        $filename = Str::slug($event->title) . '-attendees.csv';

        // stop spreadsheet apps from running cells that start with = + - @
        $safe = fn ($v) => preg_match('/^[=+\-@\t\r]/', (string) $v) ? "'" . $v : $v;

        $attendees = $event->attendees()->orderBy('name')->get();

        return response()->streamDownload(function () use ($attendees, $safe) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // lets Excel read the file as UTF-8

            $put = fn (array $row) => fputcsv($out, $row, ',', '"', '');

            $put(['Name', 'Email', 'Phone', 'Ticket code', 'Registered at', 'Status', 'Checked in at']);

            foreach ($attendees as $a) {
                $put([
                    $safe($a->name),
                    $safe($a->email),
                    $safe($a->phone),
                    $a->token,
                    $a->created_at?->format('Y-m-d H:i'),
                    $a->checked_in_at ? 'Checked in' : 'Pending',
                    $a->checked_in_at?->format('Y-m-d H:i'),
                ]);
            }

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}