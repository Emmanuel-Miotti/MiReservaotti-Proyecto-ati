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

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */

     public $user;

    public function __construct($user)
    {
        $this->user = $user;
    }

    // public function __construct()
    // {
        // $this->user = $user;
    // }
    

    // public function build()
    // {
    //     return $this->view('emails.welcome')
    //                 ->with([
    //                   'name' => $this->user->name
    //                 ]);
    // }

    public function build()
{
    return $this->from('luciano@mireservaotti.online', 'MiReservaOtti')
               ->subject('Bienvenido a MiReservaOtti')
               ->view('emails.bienvenidos')
               ->to($this->user->email)
               ->with([
                'name' => $this->user->name
              ]);
}


//     public function build()
//     {
//         return $this->view('emails.welcome')
//                     ->with([
//                       'name' => $this->user->name
//                     ]);
//     }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(

            from: new MailablesAddress('luciano@mireservaotti.online', 'MiReservaOtti'),
            subject: 'Bienvenido', //asunto del mail

        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(

            view: 'emails.bienvenidos',

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
