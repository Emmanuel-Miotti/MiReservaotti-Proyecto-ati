<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ListaEspera extends Model
{
    use HasFactory;

    protected $table = 'lista_espera';

    protected $fillable = [
        'cliente_id',
        'agenda_id',
        'fecha_inicio',
        'fecha_fin',
        'hora_inicio',
        'hora_fin',
        'notificado',  
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
