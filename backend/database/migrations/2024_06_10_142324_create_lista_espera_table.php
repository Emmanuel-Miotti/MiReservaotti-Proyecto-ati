<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateListaEsperaTable extends Migration
{
    public function up()
    {
        Schema::create('lista_espera', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->foreignId('agenda_id')->constrained('agendas')->onDelete('cascade');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->boolean('notificado')->default(false); 
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('lista_espera');
    }
}


// use Illuminate\Database\Migrations\Migration;
// use Illuminate\Database\Schema\Blueprint;
// use Illuminate\Support\Facades\Schema;

// class CreateListaEsperaTable extends Migration
// {
//     public function up()
//     {
//         Schema::create('lista_espera', function (Blueprint $table) {
//             $table->id();
//             $table->foreignId('cliente_id')->constrained()->onDelete('cascade');
//             $table->foreignId('agenda_id')->constrained()->onDelete('cascade');
//             $table->date('fecha');
//             $table->time('hora');
//             $table->timestamps();
//         });
//     }

//     public function down()
//     {
//         Schema::dropIfExists('lista_espera');
//     }
// } -->
