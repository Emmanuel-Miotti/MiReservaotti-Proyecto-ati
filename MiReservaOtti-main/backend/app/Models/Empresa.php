<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;


class Empresa extends User
{
    use HasApiTokens;
    protected $table = 'empresas';

    protected $fillable = [
        'name', 'email', 'password', 'cellphone', 'address', 'categoria_id', 'profile_picture', 'gallery', 'url', 'role'
    ];

    public function rol()
    {
        return $this->role;
    }

    public function servicios()
    {
           return $this->hasMany(Servicio::class);
    }

    public function agendas()
    {
        return $this->hasMany(Agenda::class);
    }

    public function intervalos()
    {
        return $this->hasManyThrough(Intervalo::class, Agenda::class);
    }
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }
}
