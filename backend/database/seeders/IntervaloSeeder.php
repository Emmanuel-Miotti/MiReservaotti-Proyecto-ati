<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class IntervaloSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $intervalos = [
            [
                'agenda_id' => 1,
                'dias_semanas' => json_encode("[\"lunes\",\"martes\",\"miercoles\"]"),
                'hora_inicio' => '09:00',
                'hora_fin' => '12:00',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'agenda_id' => 1,
                'dias_semanas' => json_encode("[\"jueves\",\"viernes\",\"sabado\"]"),
                'hora_inicio' => '16:00',
                'hora_fin' => '22:00',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Agregar más registros según sea necesario
        ];

        foreach ($intervalos as $intervalo) {
            DB::table('intervalos')->insert($intervalo);
        }
    }
}
