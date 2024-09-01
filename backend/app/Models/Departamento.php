<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departamento extends Model
{
    protected $table = 'departamentos';

    protected $fillable = [
        'name'
    ];

    public function ciudades()
    {
        return $this->hasMany(Ciudad::class, 'departamento_id');
    }
}
