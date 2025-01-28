<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Carbon\Carbon;

class CustomerController extends Controller
{
    public function index()
    {
        $currentTime = Carbon::now('Asia/Manila');

        $customers = Customer::where('status', 'Active')->get();

        foreach ($customers as $customer) {
            $timeEnds = Carbon::parse($customer->time_ends, 'Asia/Manila');
            if ($currentTime->greaterThanOrEqualTo($timeEnds)) {
                $customer->status = 'Complete';
                $customer->save();
            }
        }
        

        $allCustomers = Customer::all();

        return response()->json($allCustomers);
    }

    public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string',
        'table_no' => 'required|integer',
        'time_acquired' => 'required|string', 
    ]);

    $existingCustomer = Customer::where('table_no', $validated['table_no'])
                                ->where('status', 'Active')
                                ->first();

    if ($existingCustomer) {
        return response()->json(['message' => 'Table is already occupied'], 400);
    }

    $timeStarts = Carbon::now('Asia/Manila'); 

    $hoursToAdd = (int) filter_var($validated['time_acquired'], FILTER_SANITIZE_NUMBER_INT);
    $timeEnds = $timeStarts->copy()->addHours($hoursToAdd);

    $customer = Customer::create([
        'name' => $validated['name'],
        'table_no' => $validated['table_no'],
        'time_acquired' => $validated['time_acquired'],
        'time_starts' => $timeStarts,
        'time_ends' => $timeEnds,
        'status' => 'Active',
    ]);

    return response()->json($customer, 201);
}


public function update(Request $request, $id)
{
    $customer = Customer::find($id);

    if (!$customer) {
        return response()->json(['message' => 'Customer not found'], 404);
    }

    $validated = $request->validate([
        'name' => 'sometimes|required|string',
        'table_no' => 'sometimes|required|integer',
        'time_acquired' => 'sometimes|required|string', 
    ]);

    $timeStarts = Carbon::parse($customer->created_at)->timezone('Asia/Manila'); 

    if (isset($validated['time_acquired'])) {
        $hoursToAdd = (int) filter_var($validated['time_acquired'], FILTER_SANITIZE_NUMBER_INT);
        $customer->time_acquired = $validated['time_acquired'];
        $timeEnds = $timeStarts->copy()->addHours($hoursToAdd);
        $customer->time_ends = $timeEnds;
    }

    $customer->update(array_filter($validated, function($key) {
        return $key !== 'time_acquired'; 
    }, ARRAY_FILTER_USE_KEY));

    return response()->json($customer);
}

// In CustomerController.php

public function stopCustomerTime(Request $request, $id)
{
    $customer = Customer::find($id);

    if (!$customer) {
        return response()->json(['message' => 'Customer not found'], 404);
    }

    // Update the status to 'Complete'
    $customer->status = 'Complete';
    $customer->save();

    return response()->json(['message' => 'Customer status updated to Complete', 'customer' => $customer]);
}

public function archive($id)
{
    $customer = Customer::find($id);

    if (!$customer) {
        return response()->json(['message' => 'Customer not found'], 404);
    }

    $customer->archive = !$customer->archive;
    $customer->save();

    return response()->json($customer);
}

public function getCustomersByDate(Request $request)
{
    $request->validate([
        'date' => 'required|date',
    ]);

    $date = $request->query('date');

    // Use created_at to filter the customers by the specific day
    $customers = Customer::whereDate('created_at', $date)->get();

    return response()->json($customers);
}

public function getCustomersByMonth(Request $request)
{
    $request->validate([
        'month' => 'required|date_format:Y-m', // Ensure it's in 'YYYY-MM' format
    ]);

    $month = $request->query('month');

    // Use created_at to filter customers by the specific month
    $customers = Customer::whereMonth('created_at', Carbon::parse($month)->month)
                          ->whereYear('created_at', Carbon::parse($month)->year)
                          ->get();

    return response()->json($customers);
}





}
