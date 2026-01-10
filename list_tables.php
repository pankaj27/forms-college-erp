<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

// Load Laravel application
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = DB::select('SHOW TABLES');
foreach ($tables as $table) {
    foreach ($table as $key => $value)
        echo $value . "\n";
}
