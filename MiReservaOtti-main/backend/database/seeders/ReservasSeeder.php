<?php

// database/seeders/ReservasSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ReservasSeeder extends Seeder
{
    public function run()
    {
        // Aquí se insertan registros de ejemplo en la tabla 'reservas'
        DB::table('reservas')->insert([
            [
                'cliente_id' => 1, // Asume que ya tienes un cliente con ID 1
                'agenda_id' => 1,  // Asume que ya tienes una agenda con ID 1
                'fecha' => '2024-06-14',
                'hora' => '09:00:00',
                'duracion' => 60, // Duración en minutos
                'precio' => 100.00,
                'estado' => 'reservado',
                'observaciones' => 'Reserva para prueba',
                'fecha_reserva' => Carbon::now(),
                'servicios' => json_encode([1]),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'cliente_id' => 2, // Asume que ya tienes un cliente con ID 2
                'agenda_id' => 2,  // Asume que ya tienes una agenda con ID 2
                'fecha' => '2024-06-15',
                'hora' => '10:00:00',
                'duracion' => 30, // Duración en minutos
                'precio' => 200.00,
                'estado' => 'reservado',
                'observaciones' => 'Otra reserva de prueba',
                'fecha_reserva' => Carbon::now(),
                'servicios' => json_encode([1, 2]),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Puedes añadir más registros según sea necesario
        ]);
    }
}
