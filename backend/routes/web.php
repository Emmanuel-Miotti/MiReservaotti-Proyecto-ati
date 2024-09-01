<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WhatsAppController;

// Rutas para el webhook
Route::get('/webhook', [WhatsAppController::class, 'webhook']);
Route::post('/webhook', [WhatsAppController::class, 'recibe']);

// Ruta predeterminada
Route::get('/', function () {
    return view('welcome');
});

// use Illuminate\Support\Facades\Route;
// use App\Mail\WelcomeMail;
// use Illuminate\Support\Facades\Mail;
// use App\Http\Controllers\WhatsAppController;

// // $role = Role::create(['name' => 'admin']);
// // $role = Role::create(['name' => 'client']);

// Route::get('{any}', function () {
//     return view('welcome');
// })->where('any', '.*');



// Route::get('bienvenido', function () {
//     Mail::to('mireservaotti@gmail.com')
//         ->send(new App\Mail\WelcomeMail());

//     // return "Mensaje enviado";
// })->name('bienvenido');

// Route::options('{any}', function() {
//     return response('', 200)->header('Access-Control-Allow-Origin', '*')
//                               ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
//                               ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
// })->where('any', '.*');

// Route::get('/webhook', [WhatsAppController::class, 'webhook']);
// Route::post('/webhook', [WhatsAppController::class, 'recibe']);

// // Ruta predeterminada
// Route::get('/', function () {
//     return view('welcome');
// });