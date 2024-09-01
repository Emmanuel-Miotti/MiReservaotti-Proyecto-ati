<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ComprasProductosSeeder extends Seeder
{
    public function run()
    {


        // Datos ficticios para los productos en cada compra
        $compraProductos = [
            // Primera compra con varios productos
            [
                'compra_id' => 1,
                'producto_id' => 1,  // Asume que estos productos existen
                'cantidad' => 2,
                'precio' => 750.00,
            ],
            [
                'compra_id' => 1,
                'producto_id' => 2,
                'cantidad' => 1,
                'precio' => 1200.00,
            ],
            // Segunda compra con varios productos
            [
                'compra_id' => 2,
                'producto_id' => 3,
                'cantidad' => 4,
                'precio' => 300.00,
            ],
            [
                'compra_id' => 2,
                'producto_id' => 4,
                'cantidad' => 2,
                'precio' => 800.00,
            ],
        ];

        DB::table('compra_productos')->insert($compraProductos);
    }
}
