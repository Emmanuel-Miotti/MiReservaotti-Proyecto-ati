<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Conversation;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CheckUserInactivity implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $userPhone;

    /**
     * Create a new job instance.
     */
    public function __construct($userPhone)
    {
        $this->userPhone = $userPhone;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        try {
            $conversation = Conversation::where('user_phone', $this->userPhone)->first();

            if ($conversation) {
                $lastInteraction = $conversation->updated_at;
                $currentTime = now();
                $diffInMinutes = $currentTime->diffInMinutes($lastInteraction);

                if ($diffInMinutes >= 5) {
                    $this->sendMessage($this->userPhone, "¿Deseas continuar con la reserva? Responde 'SI' para continuar o 'NO' para cancelar.");
                    $conversation->data = ['step' => 'waiting_continue_or_cancel'];
                    $conversation->save();
                }
            }
        } catch (\Exception $e) {
            Log::error('Error in CheckUserInactivity job: ' . $e->getMessage());
        }
    }

    protected function sendMessage($to, $message)
    {
        try {
            $accessToken = env('META_ACCESS_TOKEN');
            $fromPhoneNumberId = env('META_PHONE_NUMBER_ID');
            $url = "https://graph.facebook.com/v12.0/$fromPhoneNumberId/messages";

            $response = Http::withToken($accessToken)->post($url, [
                'messaging_product' => 'whatsapp',
                'to' => $to,
                'text' => [
                    'body' => $message
                ]
            ]);

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Error in sendMessage method: ' . $e->getMessage());
        }
    }
}

