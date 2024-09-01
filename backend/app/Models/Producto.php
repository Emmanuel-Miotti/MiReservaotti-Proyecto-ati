<?php

// app/Models/Producto.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;

    protected $fillable = [
        'empresa_id',
        'nombre',
        'descripcion',
        'precio',
        'stock',
        'estado',
        'foto',
    ];

    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    public function compras()
    {
        return $this->belongsToMany(Compra::class, 'compra_productos')
            ->withPivot('cantidad', 'precio');
    }
}
