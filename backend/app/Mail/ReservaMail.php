<?php

namespace App\Mail;

use Faker\Provider\Address;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address as MailablesAddress;

use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use App\Models\Cliente;

class ReservaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $cliente;
    public $reserva;
    public $servicios;


    public function __construct($cliente, $reserva, $servicios)
    {
        $this->cliente = $cliente;
        $this->reserva = $reserva;
        $this->servicios = $servicios;
    }

    public function build()
    {
    

    return $this->from('luciano@mireservaotti.online', 'MiReservaOtti')
               ->subject('Confirmación de Reserva')
               ->view('emails.reservaMail')
               ->with([
                'cliente' => $this->cliente,
                'reserva' => $this->reserva,
                'servicios' => $this->servicios
            ]);
    }   

    public function envelope(): Envelope
    {
        return new Envelope(

            from: new MailablesAddress('luciano@mireservaotti.online', 'MiReservaOtti'),
            subject: 'Confirmación de Reserva', //asunto del mail
        );
    }

    public function content(): Content
    {
        return new Content(

            view: 'emails.reservaMail',

        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
