<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('table_no');
            $table->string('time_acquired');
            $table->timestamp('time_starts');
            $table->timestamp('time_ends')->nullable();
            $table->string('status');
            $table->boolean('archive')->default(false);
            $table->timestamps();
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
