<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(ClientesSeeder::class);
        $this->call(CategoriasSeeder::class);
        $this->call(EmpresasSeeder::class);
        $this->call(ServiciosSeeder::class);
        $this->call(AgendasSeeder::class);
        $this->call(IntervaloSeeder::class);
        $this->call(ReservasSeeder::class);
        $this->call(ReservaUsuarioNoRegistradoSeeder::class);
        $this->call(ProductosSeeder::class,);
        $this->call(ComprasSeeder::class,);
        $this->call(ComprasProductosSeeder::class,);
      
        
         

        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
