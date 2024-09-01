<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReservasUsuarioNoRegistrado extends Model
{
    protected $table = 'reservas_usuario_no_registrado';

    protected $fillable = [
        'agenda_id', 'nombre_cliente', 'email_cliente', 'telefono_cliente', 'fecha', 'hora', 'duracion', 'precio', 'estado', 'observaciones', 'fecha_reserva', 'servicios'
    ];

    protected $casts = [
        'servicios' => 'array',
    ];

    public function agenda()
    {
        return $this->belongsTo(Agenda::class);
    }
}
