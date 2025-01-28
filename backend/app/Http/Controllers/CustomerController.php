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

    $customers = Customer::whereDate('created_at', $date)->get();

    return response()->json($customers);
}

public function getCustomersByMonth(Request $request)
{
    $request->validate([
        'month' => 'required|date_format:Y-m', // Ensure it's in 'YYYY-MM' format
    ]);

    $month = $request->query('month');

    $customers = Customer::whereMonth('created_at', Carbon::parse($month)->month)
                          ->whereYear('created_at', Carbon::parse($month)->year)
                          ->get();

    return response()->json($customers);
}

public function countCustomersToday(Request $request)
{
    // Get today's date in 'YYYY-MM-DD' format
    $today = now()->toDateString();  // You can also use 'Carbon::today()->toDateString()' if you prefer.

    // Count customers who were created today
    $customerCount = Customer::whereDate('created_at', $today)->count();

    return response()->json([
        'customer_count' => $customerCount,
    ]);
}

public function getDashboardData()
{
    // Get the total number of customers
    $totalCustomers = Customer::count();

    // Get the most occupied table with the count of customers
    $mostOccupiedTable = Customer::select('table_no')
                                ->selectRaw('count(*) as count')
                                ->groupBy('table_no')
                                ->orderByDesc('count')
                                ->first();

    // Get the most availed time with the count of customers
    $mostTimeAvail = Customer::select('time_acquired')
                             ->selectRaw('count(*) as count')
                             ->groupBy('time_acquired')
                             ->orderByDesc('count')
                             ->first();

    // Count customers for the most occupied table
    $customersAtMostOccupiedTable = Customer::where('table_no', $mostOccupiedTable->table_no)
                                            ->count();

    // Count customers for the most availed time
    $customersAtMostTimeAvail = Customer::where('time_acquired', $mostTimeAvail->time_acquired)
                                        ->count();

    // Get monthly customer count (Jan - Dec)
    $monthlyData = Customer::selectRaw('MONTH(created_at) as month, count(*) as customers')
                           ->groupBy('month')
                           ->orderBy('month')
                           ->get()
                           ->map(function ($item) {
                               // Map numerical months to month names (Jan - Dec)
                               $monthNames = [
                                   1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
                                   5 => 'May', 6 => 'Jun', 7 => 'Jul', 8 => 'Aug',
                                   9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dec'
                               ];
                               $item->month = $monthNames[$item->month];
                               return $item;
                           });

    // Returning data in a cleaner way
    return response()->json([
        'totalCustomers' => $totalCustomers,
        'mostOccupiedTable' => [
            'table_no' => $mostOccupiedTable->table_no,
            'count' => $mostOccupiedTable->count,
            'customers' => $customersAtMostOccupiedTable,
        ],
        'mostTimeAvail' => [
            'time_acquired' => $mostTimeAvail->time_acquired,
            'count' => $mostTimeAvail->count,
            'customers' => $customersAtMostTimeAvail,
        ],
        'monthlyData' => $monthlyData, // Add monthly data
    ]);
}



}
