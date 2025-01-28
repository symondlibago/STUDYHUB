<?php

namespace App\Console\Commands;

use App\Models\Customer;
use Illuminate\Console\Command;
use Carbon\Carbon;

class UpdateCustomerStatus extends Command
{
    protected $signature = 'customers:update-status';
    protected $description = 'Update status of customers whose time has ended';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $customers = Customer::where('status', 'Active')
                            ->where('time_ends', '<', Carbon::now('Asia/Manila'))
                            ->get();

        $this->info("Current Time: " . Carbon::now('Asia/Manila'));
        $this->info("Customers to update: " . $customers->count());

        foreach ($customers as $customer) {
            $this->info("Customer: {$customer->name}, Time Ends: {$customer->time_ends}");
            $customer->status = 'Times up!';
            $customer->save();
            $this->info("Updated status for customer {$customer->name}");
        }
    }
}
