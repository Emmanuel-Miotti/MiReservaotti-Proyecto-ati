<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmpresasTable extends Migration
{
    public function up()
    {
        Schema::create('empresas', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('cellphone')->nullable();
            $table->string('address');
            // $table->foreignId('categoria_id')->constrained()->onDelete('cascade')->nullable();
            $table->foreignId('categoria_id')->constrained('categorias')->onDelete('cascade');

                        // Nuevas columnas
                        $table->foreignId('departamento_id')->constrained('departamentos')->onDelete('cascade');
                        $table->foreignId('ciudad_id')->constrained('ciudades')->onDelete('cascade');
            
            $table->string('profile_picture')->nullable();
            $table->json('gallery')->nullable();
            $table->string('url')->unique()->nullable();
            $table->string('role')->default('empresa');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('empresas');
    }
}
