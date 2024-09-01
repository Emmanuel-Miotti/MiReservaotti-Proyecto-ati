<?php

use Illuminate\Support\Facades\Route;
// use Spatie\Permission\Models\Role; NO VA MAS

// $role = Role::create(['name' => 'admin']);
// $role = Role::create(['name' => 'client']);

Route::get('{any}', function () {
    return view('welcome');
})->where('any', '.*');
