<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;


class Fidelizacion extends Model
{
    protected $table = 'fidelizacion';

    protected $fillable = [
        'empresa_id', 'nombre', 'descripcion', 'puntos'
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }
}
