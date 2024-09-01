<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ListaEspera extends Model
{
    protected $table = 'lista_espera';

    protected $fillable = [
        'cliente_id', 'agenda_id', 'fecha', 'hora'
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
