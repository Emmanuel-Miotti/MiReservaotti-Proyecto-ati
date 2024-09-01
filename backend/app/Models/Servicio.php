<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;


class Servicio extends Model
{
    protected $table = 'servicios';

    protected $fillable = [
        'empresa_id', 'nombre', 'descripcion', 'duracion', 'estado', 'precio'
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function reservas()
    {
        return $this->belongsToMany(Reserva::class, 'reserva_servicio');
    }
}
