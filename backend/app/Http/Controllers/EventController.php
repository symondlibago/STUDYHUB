<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;

class EventController extends Controller
{
    public function index()
    {
        // Retrieve all events from the database
        $events = Event::all();

        // Return the events as a JSON response
        return response()->json($events);
    }

    public function store(Request $request)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'pax' => 'required|integer',
            'venue' => 'required|string',
            'providers' => 'array'
        ]);

        // Create a new event
        $event = Event::create($validatedData);

        // Return a response
        return response()->json(['message' => 'Event created successfully', 'event' => $event], 201);
    }
    public function eventsForDay($date)
{
    $events = Event::whereDate('date', $date)->get();
    return response()->json($events);
}

}
