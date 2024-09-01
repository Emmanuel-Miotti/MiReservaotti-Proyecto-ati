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
                'url' => 'empresa1',
                'role' => 'empresa',
                'departamento_id' => 1, // Asume que tienes un departamento con ID 1
                'ciudad_id' => 1, // Asume que tienes una ciudad con ID 1
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
                'url' => 'empresa2',
                'role' => 'empresa',
                'departamento_id' => 2, // Asume que tienes un departamento con ID 2
                'ciudad_id' => 2, // Asume que tienes una ciudad con ID 2
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Agregar más registros según sea necesario
        ]);
    }
}
