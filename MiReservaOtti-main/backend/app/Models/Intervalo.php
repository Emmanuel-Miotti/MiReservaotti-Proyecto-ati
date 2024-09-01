<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Intervalo extends Model
{

    use HasFactory;
    protected $table = 'intervalos';

    protected $fillable = [
        'agenda_id', 'dias_semanas', 'hora_inicio', 'hora_fin'
    ];

    protected $casts = [
        'dias_semanas' => 'array', // Indicar que se debe tratar como un array
    ];

    public function agenda()
    {
        return $this->belongsTo(Agenda::class);
    }
}