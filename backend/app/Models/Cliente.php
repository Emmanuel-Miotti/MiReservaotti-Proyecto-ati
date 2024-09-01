<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Cliente extends User
{
    use HasFactory;
    use HasApiTokens;
    protected $table = 'clientes';

    protected $fillable = [
        'name', 'email', 'password', 'cellphone', 'profile_picture', 'role'
    ];

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    public function rol()
    {
        return $this->role;
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
