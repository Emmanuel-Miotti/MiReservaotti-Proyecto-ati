<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agenda extends Model
{
    protected $table = 'agendas';

    protected $fillable = [
        'empresa_id', 'estado' // cierto tiempo para mostar reservaciones 
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function intervalos()
    {
        return $this->hasMany(Intervalo::class);
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    public function reservasUsuarioNoRegistrado()
    {
        return $this->hasMany(ReservasUsuarioNoRegistrado::class);
    }

    public function listaDeEspera()
    {
            return $this->hasMany(ListaEspera::class);
    }
}
