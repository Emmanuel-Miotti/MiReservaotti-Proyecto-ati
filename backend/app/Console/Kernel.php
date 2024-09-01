<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Jobs\CheckUserInactivity;
use App\Jobs\SendReminderEmail;
use App\Models\Reserva;
use Carbon\Carbon;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
//<<<<<<< Sprint5-Emmanuel2.0
        // $schedule->command('inspire')->hourly();
      //  $schedule->call(function () {
        //    CheckUserInactivity::dispatch();
        //})->everyFiveMinutes();
//=======
        $schedule->call(function () {
            $reservas = Reserva::where('fecha', '=', Carbon::tomorrow()->toDateString())->get();
            foreach ($reservas as $reserva) {
                SendReminderEmail::dispatch($reserva);
            }
        })->everyMinute(); //->dailyAt('09:00');
//>>>>>>> main
    }

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
