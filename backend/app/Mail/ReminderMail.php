<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Content;


class ReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    protected $cliente;
    protected $reserva;
    protected $servicios
    ;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($cliente, $reserva, $servicios)
    {
        $this->cliente = $cliente;
        $this->reserva = $reserva;
        $this->servicios = $servicios;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->from('luciano@mireservaotti.online', 'MiReservaOtti')
                    ->subject('Recordatorio de Reserva')
                    ->view('emails.reminder')
                    ->with([
                        'cliente' => $this->cliente,
                        'reserva' => $this->reserva,
                        'servicios
                        ' => $this->servicios

                    ]);
    }

    public function content(): Content
    {
        return new Content(

            view: 'emails.reminder',

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
