<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EventController extends Controller
{
    private function rules(): array
    {
        return [
            'title' => 'required|string|max:150',
            'description' => 'nullable|string',
            'venue' => 'required|string|max:150',
            'event_date' => 'required|date',
            'capacity' => 'nullable|integer|min:1',
        ];
    }

    private function makeSlug(string $title): string
    {
        $base = Str::slug($title);
        $slug = $base;

        while (Event::where('slug', $slug)->exists()) {
            $slug = $base . '-' . Str::lower(Str::random(4));
        }

        return $slug;
    }

    public function index(Request $request)
    {
        return $request->user()->events()
            ->withCount('attendees')
            ->orderBy('event_date')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());
        $data['slug'] = $this->makeSlug($data['title']);

        $event = $request->user()->events()->create($data);

        return response()->json($event, 201);
    }

    public function show(Request $request, string $id)
    {
        return $request->user()->events()->withCount('attendees')->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $event = $request->user()->events()->findOrFail($id);
        $event->update($request->validate($this->rules()));

        return $event;
    }

    public function destroy(Request $request, string $id)
    {
        $request->user()->events()->findOrFail($id)->delete();

        return response()->json(['message' => 'Event deleted.']);
    }
}