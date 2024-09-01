<?php

namespace App\Jobs;

use App\Mail\ReminderMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use App\Models\Reserva;

class SendReminderEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $reserva;
    protected $cliente;
    protected $serviciosDetails;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($cliente, $reserva, $serviciosDetails)
    {
        $this->reserva = $reserva;
        $this->cliente = $cliente;
        $this->serviciosDetails = $serviciosDetails;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        Mail::to($this->cliente->email)->send(new ReminderMail($this->cliente, $this->reserva, $this->serviciosDetails));
    }
}