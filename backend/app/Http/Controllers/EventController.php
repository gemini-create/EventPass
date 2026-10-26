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

    public function index()
    {
        return Event::withCount('attendees')->orderBy('event_date')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());
        $data['slug'] = $this->makeSlug($data['title']);
        $data['user_id'] = $request->user()->id;

        return response()->json(Event::create($data), 201);
    }

    public function show(string $id)
    {
        return Event::withCount('attendees')->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $event = Event::findOrFail($id);
        $event->update($request->validate($this->rules()));

        return $event;
    }

    public function destroy(string $id)
    {
        Event::findOrFail($id)->delete();

        return response()->json(['message' => 'Event deleted.']);
    }
}