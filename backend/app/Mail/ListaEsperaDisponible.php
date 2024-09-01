<?php

namespace App\Mail;

use App\Models\ListaEspera;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ListaEsperaDisponible extends Mailable
{
    use Queueable, SerializesModels;

    public $inscripcion;
    public $fechaCancelada;
    public $horaCancelada;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($inscripcion, $fechaCancelada, $horaCancelada)
    {
        $this->inscripcion = $inscripcion;
        $this->fechaCancelada = $fechaCancelada;
        $this->horaCancelada = $horaCancelada;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('¡Un lugar se ha liberado!')
        ->from('luciano@mireservaotti.online', 'MiReservaOtti')
        ->view('emails.lista_espera_disponible')
        ->to($this->inscripcion->cliente->email)
        ->with([
            'cliente' => $this->inscripcion->cliente,
            'agenda' => $this->inscripcion->agenda,
            'fecha_inicio' => $this->inscripcion->fecha_inicio,
            'hora_inicio' => $this->inscripcion->hora_inicio,
            'fecha_fin' => $this->inscripcion->fecha_fin,
            'hora_fin' => $this->inscripcion->hora_fin,
            'fechaCancelada' => $this->fechaCancelada,
            'horaCancelada' => $this->horaCancelada,
        ]);
    }

    // public function build()
    // {
    //     return $this->from('luciano@mireservaotti.online', 'MiReservaOtti')
    //                ->subject('Bienvenido a MiReservaOtti')
    //                ->view('emails.bienvenidos')
    //                ->to($this->user->email)
    //                ->with([
    //                 'name' => $this->user->name
    //               ]);
    // }
}


// namespace App\Mail;

// use App\Models\ListaEspera;
// use Illuminate\Bus\Queueable;
// use Illuminate\Mail\Mailable;
// use Illuminate\Queue\SerializesModels;

// class ListaEsperaDisponible extends Mailable
// {
//     use Queueable, SerializesModels;

//     public $inscripcion;

//     public function __construct(ListaEspera $inscripcion)
//     {
//         $this->inscripcion = $inscripcion;
//     }

//     public function build()
//     {
//         return $this->subject('Un lugar se ha liberado para tu reserva')
//                     ->view('emails.lista_espera_disponible')
//                     ->with('inscripcion', $this->inscripcion);
//     }
// }
