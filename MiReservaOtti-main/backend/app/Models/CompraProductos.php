<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class CompraProducto extends Pivot
{
    protected $table = 'compra_productos'; 

    // Si la tabla tiene timestamps, déjalo, de lo contrario puedes desactivarlos
    public $timestamps = true;

    protected $fillable = [
        'compra_id',
        'producto_id',
        'cantidad',
        'precio'
    ];

    // Opcionalmente, define más relaciones si necesitas acceder a detalles del producto o de la compra directamente desde aquí
    public function compra()
    {
        return $this->belongsTo(Compra::class);
    }

    public function producto()
    {
        return $this->belongsTo(Producto::class);
    }
}
