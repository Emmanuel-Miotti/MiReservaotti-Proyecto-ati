<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ServiciosSeeder extends Seeder
{
    public function run()
    {
        DB::table('servicios')->insert([
            [
                'empresa_id' => 1, // Asume que ya tienes una empresa con ID 1
                'nombre' => 'Servicio 1',
                'descripcion' => 'Descripción del servicio 1',
                'duracion' => 60, // Duración en minutos
                'estado' => 'activo',
                'precio' => 50.00,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'empresa_id' => 2, // Asume que ya tienes una empresa con ID 2
                'nombre' => 'Servicio 2',
                'descripcion' => 'Descripción del servicio 2',
                'duracion' => 45, // Duración en minutos
                'estado' => 'activo',
                'precio' => 40.00,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Agregar más registros según sea necesario
        ]);
    }
}