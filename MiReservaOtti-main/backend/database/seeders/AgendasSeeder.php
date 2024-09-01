<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class AgendasSeeder extends Seeder
{
    public function run()
    {
        DB::table('agendas')->insert([
            [
                'empresa_id' => 1, // Asume que ya tienes una empresa con ID 1
                'estado' => 'abierta',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'empresa_id' => 2, // Asume que ya tienes una empresa con ID 2
                'estado' => 'abierta',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Agregar más registros según sea necesario
        ]);
    }
}
