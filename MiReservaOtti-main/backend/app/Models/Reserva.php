<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reserva extends Model
{
    protected $table = 'reservas';

    protected $fillable = [
        'cliente_id', 'agenda_id', 'fecha', 'hora', 'duracion', 'precio', 'estado', 'observaciones', 'fecha_reserva', 'servicios'
    ];

    protected $casts = [
        'servicios' => 'array',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function agenda()
    {
        return $this->belongsTo(Agenda::class);
    }
}
