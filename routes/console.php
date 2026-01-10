<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('db:tables', function () {
    // For Laravel 11, use getTables() if available, or just raw SQL
    try {
        $tables = Schema::getTables(); // Returns array of arrays/objects
        foreach($tables as $t) {
            // print_r($t); 
            // Usually 'name' property
            echo $t['name'] ?? $t->name ?? json_encode($t);
            echo "\n";
        }
    } catch (\Exception $e) {
        echo $e->getMessage();
    }
});

Artisan::command('db:columns {table}', function ($table) {
    print_r(Schema::getColumnListing($table));
});
