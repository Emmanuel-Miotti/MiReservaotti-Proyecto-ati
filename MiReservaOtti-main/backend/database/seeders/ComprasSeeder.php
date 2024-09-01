<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ComprasSeeder extends Seeder
{
    public function run()
    {
        // Datos ficticios para las compras
        $compras = [
            [
                'cliente_id' => 1,  // Asume un cliente existente
                'empresa_id' => 1,  // Asume una empresa existente
                'total' => 1500.00,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'cliente_id' => 2,
                'empresa_id' => 1,
                'total' => 3200.00,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ];

        DB::table('compras')->insert($compras);

        // // Ids de compras que se acaban de insertar, asumiendo que son los primeros registros
        // $firstCompraId = DB::getPdo()->lastInsertId();
        // $secondCompraId = $firstCompraId + 1;

        // // Datos ficticios para los productos en cada compra
        // $compraProductos = [
        //     // Primera compra con varios productos
        //     [
        //         'compra_id' => 1,
        //         'producto_id' => 1,  // Asume que estos productos existen
        //         'cantidad' => 2,
        //         'precio' => 750.00,
        //     ],
        //     [
        //         'compra_id' => 1,
        //         'producto_id' => 2,
        //         'cantidad' => 1,
        //         'precio' => 1200.00,
        //     ],
        //     // Segunda compra con varios productos
        //     [
        //         'compra_id' => 2,
        //         'producto_id' => 3,
        //         'cantidad' => 4,
        //         'precio' => 300.00,
        //     ],
        //     [
        //         'compra_id' => 2,
        //         'producto_id' => 4,
        //         'cantidad' => 2,
        //         'precio' => 800.00,
        //     ],
        // ];

        // DB::table('compra_productos')->insert($compraProductos);
    }
}
