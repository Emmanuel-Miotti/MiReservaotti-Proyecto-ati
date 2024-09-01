<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Compra extends Model
{
    use HasFactory;

    protected $fillable = [
        'cliente_id',
        'empresa_id',
        'total', 
        // Otros campos fillable según tus necesidades
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function productos()
    {
        return $this->belongsToMany(Producto::class, 'compra_productos')->withPivot('cantidad')
        ->withPivot('cantidad');
        //->withPivot('precio');
    }
}
