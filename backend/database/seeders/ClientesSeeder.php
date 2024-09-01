<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class ClientesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('clientes')->insert([
            [
                'name' => 'Juan Perez',
                'email' => 'juan.perez@example.com',
                'password' => Hash::make('password123'),
                'cellphone' => '123456789',
                // 'profile_picture' => 'path/to/profile_picture1.jpg',
                'role' => 'cliente',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Maria Gomez',
                'email' => 'maria.gomez@example.com',
                'password' => Hash::make('password456'),
                'cellphone' => '987654321',
                // 'profile_picture' => 'path/to/profile_picture2.jpg',
                'role' => 'cliente',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);

    }
}
