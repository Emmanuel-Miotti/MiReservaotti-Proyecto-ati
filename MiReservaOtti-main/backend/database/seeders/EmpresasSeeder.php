<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class EmpresasSeeder extends Seeder
{
    public function run()
    {
        DB::table('empresas')->insert([
            [
                'name' => 'Empresa 1',
                'email' => 'empresa1@example.com',
                'password' => Hash::make('password1'),
                'cellphone' => '123456789',
                'address' => 'Direccion 1',
                'categoria_id' => 1, // Asume que ya tienes una categoría con ID 1
                'profile_picture' => null,
                // 'gallery' => json_encode(['gallery1.jpg', 'gallery2.jpg']),
                'url' => 'empresa1',
                'role' => 'empresa',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Empresa 2',
                'email' => 'empresa2@example.com',
                'password' => Hash::make('password2'),
                'cellphone' => '987654321',
                'address' => 'Direccion 2',
                'categoria_id' => 2, // Asume que ya tienes una categoría con ID 2
                'profile_picture' => null,
                // 'gallery' => json_encode(['gallery3.jpg', 'gallery4.jpg']),
                'url' => 'empresa2',
                'role' => 'empresa',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Agregar más registros según sea necesario
        ]);
    }
}
