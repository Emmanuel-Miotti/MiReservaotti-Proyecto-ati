<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class DepartamentosCiudadesSeeder extends Seeder
{
    public function run()
    {
        // Precargar Departamentos
        $departamentos = [
            'Artigas',
            'Canelones',
            'Cerro Largo',
            'Colonia',
            'Durazno',
            'Flores',
            'Florida',
            'Lavalleja',
            'Maldonado',
            'Montevideo',
            'Paysandú',
            'Río Negro',
            'Rivera',
            'Rocha',
            'Salto',
            'San José',
            'Soriano',
            'Tacuarembó',
            'Treinta y Tres',
        ];

        foreach ($departamentos as $departamento) {
            DB::table('departamentos')->insert([
                'name' => $departamento,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }

        // Precargar Ciudades por Departamento
        $ciudades = [
            'Artigas' => [
                'Artigas', 'Bella Unión', 'Tomás Gomensoro', 'Baltasar Brum', 'Javier de Viana',
                'Sequeira', 'Pintadito', 'Topador', 'Cuaro', 'Cerro Ejido'
            ],
            'Canelones' => [
                'Canelones', 'Las Piedras', 'Pando', 'Ciudad de la Costa', 'La Paz',
                'Santa Lucía', 'Sauce', 'Progreso', 'Empalme Olmos', 'Joaquín Suárez',
                'Parque del Plata', 'Atlántida', 'Solymar', 'Colonia Nicolich', 'Barros Blancos',
                'San Jacinto', 'Montes', 'Soca', 'Tala', 'San Bautista', 'Cuchilla Alta',
                'Las Toscas', 'Paso Carrasco', 'El Pinar', 'Salinas'
            ],
            'Cerro Largo' => [
                'Melo', 'Río Branco', 'Fraile Muerto', 'Tupambaé', 'Aceguá',
                'Noblía', 'Arévalo', 'Tres Islas', 'Plácido Rosas', 'Cañada Brava',
                'Ramón Trigo'
            ],
            'Colonia' => [
                'Colonia del Sacramento', 'Carmelo', 'Nueva Palmira', 'Juan Lacaze', 'Rosario',
                'Nueva Helvecia', 'Tarariras', 'Ombúes de Lavalle', 'Conchillas', 'Miguelete',
                'Colonia Valdense', 'Riachuelo', 'Santa Ana', 'La Paz', 'Cufré', 'Campana',
                'Florencio Sánchez', 'Colonia Suiza'
            ],
            'Durazno' => [
                'Durazno', 'Sarandí del Yí', 'La Paloma', 'Villa del Carmen', 'Carlos Reyles',
                'Blanquillo', 'Centenario', 'San Jorge', 'Feliciano', 'Aguas Buenas'
            ],
            'Flores' => [
                'Trinidad', 'Ismael Cortinas', 'Andresito', 'Cerro Colorado', 'Las Flores'
            ],
            'Florida' => [
                'Florida', 'Sarandí Grande', 'Casupá', 'Fray Marcos', 'Mendoza Grande',
                'Mendoza Chico', 'Cardal', 'Reboledo', '25 de Mayo', 'Chamizo', 
                'Capilla del Sauce', 'Cerro Colorado', 'Tala', 'Nico Pérez'
            ],
            'Lavalleja' => [
                'Minas', 'José Pedro Varela', 'Solís de Mataojo', 'Mariscala', 'Zapicán',
                'Batlle y Ordóñez', 'Pirarajá', 'Colón', 'Villa Serrana', 'Polanco'
            ],
            'Maldonado' => [
                'Maldonado', 'Punta del Este', 'San Carlos', 'Piriápolis', 'Pan de Azúcar',
                'Aiguá', 'Garzón', 'Gregorio Aznárez', 'Pueblo Obrero', 'Balneario Buenos Aires',
                'La Barra', 'José Ignacio', 'Pueblo Edén', 'Las Flores', 'Punta Colorada'
            ],
            'Montevideo' => [
                'Montevideo', 'Santiago Vázquez', 'Aguada', 'Aires Puros', 'Atahualpa',
                'Buceo', 'Carrasco', 'Centro', 'Cerrito de la Victoria', 'Cerro',
                'Ciudad Vieja', 'Colón', 'Cordón', 'Jacinto Vera', 'La Blanqueada',
                'La Comercial', 'La Teja', 'Malvín', 'Malvín Norte', 'Manga', 'Palermo',
                'Parque Batlle', 'Parque Rodó', 'Paso Molino', 'Peñarol', 'Pocitos',
                'Pocitos Nuevo', 'Prado', 'Punta Carretas', 'Punta Gorda', 'Sayago',
                'Tres Cruces', 'Unión', 'Villa Española'
            ],
            'Paysandú' => [
                'Paysandú', 'Guichón', 'Quebracho', 'Porvenir', 'Lorenzo Geyres',
                'Piedras Coloradas', 'Tambores', 'Chapicuy', 'Gallinal', 'Queguay',
                'Orgoroso', 'Constancia', 'Esperanza'
            ],
            'Río Negro' => [
                'Fray Bentos', 'Young', 'Nuevo Berlín', 'San Javier', 'Grecco',
                'Menafra', 'Paso de los Mellizos', 'Bellaco', 'Sarandí de Navarro'
            ],
            'Rivera' => [
                'Rivera', 'Tranqueras', 'Vichadero', 'Minas de Corrales', 'La Pedrera',
                'Masoller', 'Moirones', 'Amarillo', 'Cerro Pelado'
            ],
            'Rocha' => [
                'Rocha', 'Chuy', 'Lascano', 'Castillos', 'La Paloma',
                'La Pedrera', '19 de Abril', 'Velázquez', 'San Luis al Medio',
                'Cebollatí', 'Punta del Diablo', 'Aguas Dulces', 'Barra de Valizas',
                'Cabo Polonio'
            ],
            'Salto' => [
                'Salto', 'Constitución', 'Belén', 'San Antonio', 'Colonia Lavalleja',
                'Colonia Itapebí', 'Rincón de Valentín', 'Pueblo Fernández',
                'Villa Constitución', 'Pueblo Olivera'
            ],
            'San José' => [
                'San José de Mayo', 'Ciudad del Plata', 'Libertad', 'Ecilda Paullier',
                'Rodríguez', 'Rafael Perazza', 'Juan Soler', 'Ituzaingó', 'Raigón',
                'Puntas de Valdez', 'Mal Abrigo', 'Capurro'
            ],
            'Soriano' => [
                'Mercedes', 'Dolores', 'Cardona', 'Palmitas', 'José Enrique Rodó',
                'Egaña', 'Santa Catalina', 'Risso', 'Agraciada', 'Cañada Nieto',
                'Perseverano'
            ],
            'Tacuarembó' => [
                'Tacuarembó', 'Paso de los Toros', 'San Gregorio de Polanco', 'Ansina',
                'Curtina', 'Achar', 'Caraguatá', 'Clara', 'Cuchilla de Peralta',
                'Las Toscas de Caraguatá', 'Laureles'
            ],
            'Treinta y Tres' => [
                'Treinta y Tres', 'Vergara', 'Santa Clara de Olimar', 'Rincón', 
                'Cerro Chato', 'Valentines', 'Villa Sara', 'Ejido', 'El Oro', 'Mendizábal'
            ],
        ];

        foreach ($ciudades as $departamento => $ciudadesArray) {
            $departamento_id = DB::table('departamentos')->where('name', $departamento)->first()->id;
            foreach ($ciudadesArray as $ciudad) {
                DB::table('ciudades')->insert([
                    'name' => $ciudad,
                    'departamento_id' => $departamento_id,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
            }
        }
    }
}
