<?php

namespace App\Services;

use App\Models\Reserva;

class ReservaService
{
    public function obtenerClienteDeReserva($reservaId)
    {
        $reserva = Reserva::find($reservaId);
        if ($reserva) {
            return $reserva->cliente;
        }
        return null;
    }
}
