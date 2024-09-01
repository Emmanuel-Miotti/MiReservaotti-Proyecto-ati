<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFidelizacionTable extends Migration
{
    public function up()
    {
        Schema::create('fidelizacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->constrained()->onDelete('cascade');
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->integer('puntos'); 
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('fidelizacion');
    }
}
