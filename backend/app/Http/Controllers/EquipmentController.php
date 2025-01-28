<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{
   // EquipmentController.php

// EquipmentController.php

public function index(Request $request)
{
    $eventId = $request->query('event_id'); // Get event_id from query parameters
    if ($eventId) {
        // Filter equipment by event_id
        $equipment = Equipment::where('event_id', $eventId)->get();
    } else {
        // Return all equipment if no event_id is provided
        $equipment = Equipment::all();
    }

    return response()->json($equipment);
}


    

public function store(Request $request)
{
    // Validate the incoming data
    $validatedData = $request->validate([
        'item' => 'required|string',
        'number_of_items' => 'required|integer',
        'number_of_sort_items' => 'required|integer',
        'status' => 'nullable|string',
        'event_id' => 'required|exists:events,id'
    ]);

    // Create a new equipment entry
    $equipment = Equipment::create($validatedData);

    // Return the newly created item
    return response()->json($equipment, 201);
}

    

    public function update(Request $request, $id)
    {
        $equipment = Equipment::findOrFail($id);
        $equipment->update($request->all());
        $validatedData = $request->validate([
            'number_of_sort_items' => 'required|integer'
        ]);
        $equipment->update($validatedData);

        return response()->json($equipment, 200);
    }

    public function destroy($id)
{
    try {
        $equipment = Equipment::findOrFail($id);
        $equipment->delete();
        return response()->json(['message' => 'Item deleted successfully.']);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Item not found.'], 404);
    }
}

}
