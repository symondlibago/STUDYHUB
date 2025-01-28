<?php

use App\Http\Controllers\CustomerController;

Route::post('customers', [CustomerController::class, 'store']);
Route::get('customers', [CustomerController::class, 'index']);
Route::put('/customers/{id}', [CustomerController::class, 'update']);
Route::put('/customers/{id}/stop', [CustomerController::class, 'stopCustomerTime']);
Route::put('customers/archive/{id}', [CustomerController::class, 'archive']);
Route::get('/customers-by-date', [CustomerController::class, 'getCustomersByDate']);
Route::get('/customers-by-month', [CustomerController::class, 'getCustomersByMonth']);
Route::get('/api/customers-count-today', [CustomerController::class, 'countCustomersToday']);
Route::get('/dashboard', [CustomerController::class, 'getDashboardData']);

