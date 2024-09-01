<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReservasTable extends Migration
{
    public function up()
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained()->onDelete('cascade');
            $table->foreignId('agenda_id')->constrained()->onDelete('cascade');
            $table->date('fecha');
            $table->time('hora');
            $table->integer('duracion'); // duración en minutos
            $table->decimal('precio', 8, 2);
            $table->enum('estado', ['reservado', 'cancelado', 'en espera'])->default('reservado');
            $table->text('observaciones')->nullable();
            $table->timestamp('fecha_reserva');
            $table->json('servicios'); // Nuevo campo JSON
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('reservas');
    }
}
