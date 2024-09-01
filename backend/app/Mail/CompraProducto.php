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

class CompraProducto extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */

     public $compra;

    public function __construct($compra)
    {
        $this->compra = $compra;
    }


    public function build()
{

    $cliente = Cliente::findOrFail($this->compra->cliente_id);

    return $this->from('luciano@mireservaotti.online', 'MiReservaOtti')
               ->subject('Compra de producto')
               ->view('emails.compraProducto')
            //    ->to($this->compra->email)
               ->with([
                'name' => $cliente->name,
                'compra' => $this->compra,
                'total' => $this->compra->total
              ]);
}


    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(

            from: new MailablesAddress('luciano@mireservaotti.online', 'MiReservaOtti'),
            subject: 'Compra de prodcuto', //asunto del mail

        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(

            view: 'emails.compraProducto',

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
