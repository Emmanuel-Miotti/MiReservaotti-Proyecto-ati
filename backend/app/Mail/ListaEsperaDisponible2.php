<?php

namespace App\Mail;

use App\Models\ListaEspera;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ListaEsperaDisponible2 extends Mailable
{
    use Queueable, SerializesModels;

    public $inscripcion;

    public function __construct(ListaEspera $inscripcion)
    {
        $this->inscripcion = $inscripcion;
    }

    public function build()
    {
        return $this->subject('¡Hay un espacio disponible en tu rango de tiempo solicitado!')
                    ->view('emails.lista_espera_disponible');
    }
}
