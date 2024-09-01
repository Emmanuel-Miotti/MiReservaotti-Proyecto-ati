<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ProductosSeeder extends Seeder
{
    public function run()
    {
        DB::table('productos')->insert([
            [
                'empresa_id' => 1,  // Asegúrate de que esta peluquería exista
                'nombre' => 'Shampoo Profesional',
                'descripcion' => 'Shampoo de alta calidad para todo tipo de cabello.',
                'precio' => 15.99,
                'stock' => 50,
                'estado' => 'activo',
                'foto' => 'shampoo_profesional.jpg',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'empresa_id' => 1,
                'nombre' => 'Gel de Cabello Extra Fuerte',
                'descripcion' => 'Gel para cabello con fijación extra fuerte, ideal para estilos duraderos.',
                'precio' => 9.50,
                'stock' => 40,
                'estado' => 'activo',
                'foto' => 'gel_cabello.jpg',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'empresa_id' => 1,
                'nombre' => 'Cera para Cabello',
                'descripcion' => 'Cera moldeadora para definición y brillo sin apelmazar.',
                'precio' => 12.75,
                'stock' => 30,
                'estado' => 'activo',
                'foto' => 'cera_cabello.jpg',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'empresa_id' => 1,
                'nombre' => 'Acondicionador Nutritivo',
                'descripcion' => 'Acondicionador rico en nutrientes para suavizar y desenredar el cabello.',
                'precio' => 18.00,
                'stock' => 20,
                'estado' => 'activo',
                'foto' => 'acondicionador_nutritivo.jpg',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]
        ]);
    }
}
