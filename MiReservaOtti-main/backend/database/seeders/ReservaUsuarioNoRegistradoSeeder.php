<?php

// database/seeders/ReservaUsuarioNoRegistradoSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ReservaUsuarioNoRegistradoSeeder extends Seeder
{
    public function run()
    {
        // Aquí se insertan registros de ejemplo en la tabla 'reservas_usuario_no_registrado'
        DB::table('reservas_usuario_no_registrado')->insert([
            [
                'agenda_id' => 1,  // Asume que ya tienes una agenda con ID 3
                'nombre_cliente' => 'Juan Perez',
                'email_cliente' => 'juan.perez@example.com',
                'telefono_cliente' => '123456789',
                'fecha' => '2024-06-16',
                'hora' => '11:00:00',
                'duracion' => 45, // Duración en minutos
                'precio' => 150.00,
                'estado' => 'reservado',
                'observaciones' => 'Reserva para cliente no registrado',
                'fecha_reserva' => Carbon::now(),
                'servicios' => json_encode([2, 3]),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'agenda_id' => 2,  // Asume que ya tienes una agenda con ID 4
                'nombre_cliente' => 'Maria Lopez',
                'email_cliente' => null,
                'telefono_cliente' => '987654321',
                'fecha' => '2024-06-17',
                'hora' => '12:00:00',
                'duracion' => 90, // Duración en minutos
                'precio' => 250.00,
                'estado' => 'reservado',
                'observaciones' => 'Reserva para cliente no registrado sin email',
                'fecha_reserva' => Carbon::now(),
                'servicios' => json_encode([1, 3]),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Puedes añadir más registros según sea necesario
        ]);
    }
}
