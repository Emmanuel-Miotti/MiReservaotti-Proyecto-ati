<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReservasUsuarioNoRegistrado;
use App\Models\Reserva;
use App\Models\Agenda;
use GuzzleHttp\Client;
use App\Models\Empresa;
use App\Models\Servicio;
use App\Models\Conversation;
use App\Models\Intervalo;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Jobs\CheckUserInactivity;
use Carbon\Carbon;
use DateTime;
use DateInterval;

class WhatsAppController extends Controller
{
    public function recibe(Request $request)
    {
        try {
            $input = $request->getContent();

            if (empty($input)) {
                Log::error('No se recibieron datos en la solicitud.');
                return response('No se recibieron datos', 400);
            }

            $data = json_decode($input, true);

            if (
                isset($data['entry'][0]['changes'][0]['value']['messages'][0]['from']) &&
                isset($data['entry'][0]['changes'][0]['value']['messages'][0]['text']['body'])
            ) {
                $from = $data['entry'][0]['changes'][0]['value']['messages'][0]['from'];
                $message = $data['entry'][0]['changes'][0]['value']['messages'][0]['text']['body'];

                Log::info("Mensaje recibido de: $from con cuerpo: $message");

                // Manejar la conversación con el usuario
                $this->handleConversation($from, $message);

                return response('Mensaje recibido', 200);
            } elseif (isset($data['entry'][0]['changes'][0]['value']['messages'][0]['button'])) {
                $from = $data['entry'][0]['changes'][0]['value']['messages'][0]['from'];
                $payload = $data['entry'][0]['changes'][0]['value']['messages'][0]['button']['payload'];

                Log::info("Respuesta de botón recibida de: $from con payload: $payload");

                // Manejar la respuesta del botón
                $this->handleButtonReply($from, $payload);

                return response('Respuesta de botón recibida', 200);
            } elseif (isset($data['entry'][0]['changes'][0]['value']['statuses'][0])) {
                Log::info('Notificación de estado recibida: ' . json_encode($data));
                // Manejar la notificación de estado si es necesario
                return response('Notificación de estado recibida', 200);
            }

            Log::error('Estructura de datos inválida en la solicitud: ' . json_encode($data));
            return response('Datos inválidos', 400);
        } catch (\Exception $e) {
            Log::error('Error en el método recibe: ' . $e->getMessage());
            return response('Error Interno del Servidor', 500);
        }
    }

    protected function handleButtonReply($from, $payload)
    {
        if ($payload == 'confirmar_asistencia') {
            Log::info("Asistencia confirmada para el cliente: $from");
            $this->sendMessage($from, "Gracias por confirmar tu asistencia.");
        } elseif ($payload == 'Cancelar') {
            Log::info("Cancelación de reserva para el cliente: $from");
            $this->cancelReservation($from);
            $this->sendMessage($from, "Tu reserva ha sido cancelada.");
        }
    }

    protected function cancelReservation($from)
    {
        // Buscar la reserva activa del cliente y actualizar su estado a cancelado
        $reserva = ReservasUsuarioNoRegistrado::where('telefono_cliente', $from)
            ->where('estado', 'reservado')
            ->orderBy('fecha_reserva', 'desc')
            ->first();

        if ($reserva) {
            $reserva->estado = 'cancelado';
            $reserva->save();
            Log::info("Reserva cancelada: " . json_encode($reserva));
        } else {
            Log::info("No se encontró una reserva activa para cancelar para el cliente: $from");
        }
    }

    protected function handleConversation($from, $message)
    {
        try {
            $conversation = Conversation::firstOrCreate(['user_phone' => $from], ['data' => ['step' => 0]]);

            $data = $conversation->data; // Asumimos que $data ya es un array

            // Mostrar comandos disponibles al inicio de la conversación
            if ($conversation->wasRecentlyCreated || $data['step'] == 0) {
                $this->sendHelpMessage($from);
                $this->sendCompaniesList($from);
                $data['step'] = 1;
                $conversation->data = $data;
                $conversation->save();
                return;
            }

            // Convertir el mensaje a mayúsculas para manejo de comandos
            switch (strtoupper($message)) {
                case 'PARAR':
                    $this->sendMessage($from, "La conversación ha sido detenida. Envía 'REINICIAR' para comenzar de nuevo.");
                    $conversation->delete();
                    return;

                case 'REINICIAR':
                    $this->sendMessage($from, "La conversación ha sido reiniciada. Selecciona una empresa para comenzar.");
                    $conversation->delete();
                    $conversation = Conversation::firstOrCreate(['user_phone' => $from], ['data' => ['step' => 0]]);
                    $this->sendCompaniesList($from);
                    return;
            }

            // Obtener el paso actual de la conversación
            $step = $data['step'];

            // Manejar cada paso de la conversación
            switch ($step) {
                case 0:
                    Log::info("Paso 0: Enviando lista de empresas");
                    $this->sendCompaniesList($from);
                    $data['step'] = 1;
                    break;

                case 1:
                    Log::info("Paso 1: Procesando selección de empresa");
                    $this->handleCompanySelection($from, $message, $data);
                    break;

                case 2:
                    Log::info("Paso 2: Procesando selección de servicio");
                    $this->handleServiceSelection($from, $message, $data);
                    break;

                case 3:
                    Log::info("Paso 3: Procesando nombre del cliente");
                    $data['name'] = $message;
                    $this->askForDate($from);
                    $data['step'] = 4;
                    break;

                case 4:
                    Log::info("Paso 4: Procesando fecha de reserva");
                    $data['date'] = $message;
                    $this->sendAvailableTimes($from, $data);
                    $data['step'] = 5;
                    break;

                case 5:
                    Log::info("Paso 5: Procesando hora de reserva");
                    $data['time'] = $message;
                    $data['datetime'] = $data['date'] . ' ' . $data['time'];
                    if ($this->isDateTimeAvailable($data['company_id'], $data['datetime'])) {
                        Log::info("Fecha y hora disponibles, confirmando reserva");
                        $this->confirmReservation($from, $data);
                        $data['step'] = 0; // Resetear conversación
                    } else {
                        Log::info("Fecha y hora no disponibles, solicitando otra hora");
                        $this->sendMessage($from, "La fecha y hora seleccionada no está disponible. Por favor, elige otra hora.");
                        $this->sendAvailableTimes($from, $data); // Mostrar horarios disponibles de nuevo
                    }
                    break;
            }

            // Guardar los datos actualizados de la conversación
            $conversation->data = $data;
            $conversation->save();
        } catch (\Exception $e) {
            Log::error('Error en el método handleConversation: ' . $e->getMessage());
        }
    }

    // Método para enviar el mensaje de ayuda
    protected function sendHelpMessage($to)
    {
        $helpMessage = "Bienvenido. Puedes usar los siguientes comandos en cualquier momento:\n";
        $helpMessage .= "PARAR: Detener la conversación.\n";
        $helpMessage .= "REINICIAR: Reiniciar la conversación desde el principio.";

        $this->sendMessage($to, $helpMessage);
    }

    protected function handleCompanySelection($from, $message, &$data)
    {
        $companyIndex = (int)$message - 1;
        $companies = Empresa::all();

        if (isset($companies[$companyIndex])) {
            $data['company_id'] = $companies[$companyIndex]->id;
            Log::info("Empresa seleccionada: " . $companies[$companyIndex]->name);
            $this->sendServicesList($from, $companies[$companyIndex]->id);
            $data['step'] = 2;
        } else {
            Log::info("Selección de empresa no válida: $message");
            $this->sendMessage($from, "Selección no válida. Por favor, selecciona una empresa válida.");
            $this->sendCompaniesList($from);
        }
    }

    protected function handleServiceSelection($from, $message, &$data)
    {
        $serviceIndex = (int)$message - 1;
        $companyId = $data['company_id'];
        $services = Servicio::where('empresa_id', $companyId)->get();

        if (isset($services[$serviceIndex])) {
            // Inicializar el array de servicios si no existe
            if (!isset($data['services'])) {
                $data['services'] = [];
            }

            // Agregar el servicio seleccionado al array
            $selectedService = $services[$serviceIndex]->id;
            if (!in_array($selectedService, $data['services'])) {
                $data['services'][] = $selectedService;
            }

            Log::info("Servicio seleccionado: " . $services[$serviceIndex]->nombre);
            // Pedir el nombre del cliente
            $this->askForName($from);
            $data['step'] = 3;
        } else {
            Log::info("Selección de servicio no válida: $message");
            $this->sendMessage($from, "Selección no válida. Por favor, selecciona un servicio válido.");
            $this->sendServicesList($from, $companyId);
        }
    }

    protected function sendCompaniesList($to)
    {
        try {
            $companies = Empresa::all();
            $message = "Selecciona una empresa:\n";
            foreach ($companies as $index => $company) {
                $message .= ($index + 1) . ". " . $company->name . "\n";
            }

            Log::info("Enviando lista de empresas: " . $message);
            $this->sendMessage($to, $message);
        } catch (\Exception $e) {
            Log::error('Error en el método sendCompaniesList: ' . $e->getMessage());
        }
    }

    protected function sendServicesList($to, $companyId)
    {
        try {
            $services = Servicio::where('empresa_id', $companyId)->get();
            if ($services->isEmpty()) {
                Log::info("No hay servicios disponibles para la empresa ID: $companyId");
                $this->sendMessage($to, "No hay servicios disponibles para esta empresa. Selecciona otra empresa.");
                $this->sendCompaniesList($to);
                $this->resetConversationStep($to, 1);
                return;
            }

            $message = "Selecciona un servicio:\n";
            foreach ($services as $index => $service) {
                $message .= ($index + 1) . ". " . $service->nombre . " - $" . $service->precio . "\n";
            }

            Log::info("Enviando lista de servicios: " . $message);
            $this->sendMessage($to, $message);
        } catch (\Exception $e) {
            Log::error('Error en el método sendServicesList: ' . $e->getMessage());
        }
    }

    protected function askForName($to)
    {
        $this->sendMessageWithLog($to, "Por favor, dime tu nombre.", 'askForName');
    }

    protected function askForDate($to)
    {
        $this->sendMessageWithLog($to, "Por favor, indícame la fecha para la reserva (YYYY-MM-DD).", 'askForDate');
    }

    protected function sendAvailableTimes($to, $data)
    {
        try {
            $date = $data['date'];
            $companyId = $data['company_id'];
            $serviceId = $data['services'][0]; // Usa el primer servicio para obtener la duración
            $service = Servicio::find($serviceId);
            $duracionServicios = $service->duracion; // Duración del servicio
            $intervaloReserva = 30; // Puedes ajustar este valor según tus necesidades

            Log::info("Buscando horarios disponibles para la empresa ID: $companyId en la fecha: $date");

            $availableTimes = $this->getHorasDisponibles($companyId, $date, $duracionServicios, $intervaloReserva);

            if (empty($availableTimes)) {
                $this->sendMessage($to, "No hay horarios disponibles para la fecha seleccionada. Por favor, elige otra fecha.");
                $this->askForDate($to);
                return;
            }

            $message = "Horarios disponibles para $date:\n";
            foreach ($availableTimes as $time) {
                $message .= $time . "\n";
            }

            Log::info("Horarios disponibles enviados: " . $message);
            $this->sendMessage($to, $message);
        } catch (\Exception $e) {
            Log::error('Error en el método sendAvailableTimes: ' . $e->getMessage());
        }
    }

    protected function getHorasDisponibles($agendaId, $fecha, $duracionServicios, $intervaloReserva)
    {
        Log::info("Obteniendo horas disponibles para Agenda ID: $agendaId en la fecha: $fecha");
        try {
            // Obtener la agenda y sus intervalos
            $agenda = Agenda::findOrFail($agendaId);
            $intervalos = $agenda->intervalos;

            // Obtener Las reservas existentes para esa fecha de reservas con usuario
            $reservasExistentesConUsuario = Reserva::where('agenda_id', $agendaId)
                ->where('Fecha', $fecha)
                ->get();

            // Obtener las reservas existentes para esa fecha
            $reservasExistentes = ReservasUsuarioNoRegistrado::where('agenda_id', $agendaId)
                ->where('Fecha', $fecha)
                ->get();

            // Crear una lista de bloques de tiempo ocupados por reservas
            $bloquesOcupados = [];
            foreach ($reservasExistentes as $reserva) {
                $horaInicioReserva = new DateTime($reserva->hora);
                $horaFinReserva = (clone $horaInicioReserva)->add(new DateInterval('PT' . $reserva->duracion . 'M'))->format('H:i');
                $bloquesOcupados[] = [
                    'inicio' => $horaInicioReserva->format('H:i'),
                    'fin' => $horaFinReserva,
                ];
            }

            foreach ($reservasExistentesConUsuario as $reserva) {
                $horaInicioReserva = new DateTime($reserva->hora);
                $horaFinReserva = (clone $horaInicioReserva)->add(new DateInterval('PT' . $reserva->duracion . 'M'))->format('H:i');
                $bloquesOcupados[] = [
                    'inicio' => $horaInicioReserva->format('H:i'),
                    'fin' => $horaFinReserva,
                ];
            }

            // Crear objetos DateTime para la fecha de la reserva
            $fechaCarbon = Carbon::createFromFormat('Y-m-d', $fecha);
            $diaSemanaReserva = $this->quitarTilde($fechaCarbon->locale('es')->isoFormat('dddd'));

            $horasDisponibles = [];

            foreach ($intervalos as $intervalo) {
                $diasSemanaArray = json_decode($intervalo->dias_semanas);

                if (in_array($diaSemanaReserva, $diasSemanaArray)) {
                    $horaInicioIntervalo = new DateTime($intervalo->hora_inicio);
                    $horaFinIntervalo = new DateTime($intervalo->hora_fin);

                    $horaActual = $horaInicioIntervalo;

                    while ($horaActual < $horaFinIntervalo) {
                        $horaFinActual = (clone $horaActual)->add(new DateInterval('PT' . $duracionServicios . 'M'));

                        if ($horaFinActual > $horaFinIntervalo) {
                            break;
                        }

                        $horaInicioStr = $horaActual->format('H:i');
                        $horaFinStr = $horaFinActual->format('H:i');

                        $ocupado = false;
                        foreach ($bloquesOcupados as $bloque) {
                            if (!($horaFinStr <= $bloque['inicio'] || $horaInicioStr >= $bloque['fin'])) {
                                $ocupado = true;
                                break;
                            }
                        }

                        if (!$ocupado) {
                            $horasDisponibles[] = $horaInicioStr;
                        }

                        $horaActual->add(new DateInterval('PT' . $intervaloReserva . 'M'));
                    }
                }
            }

            Log::info("Horas disponibles calculadas: " . implode(", ", $horasDisponibles));
            return $horasDisponibles;
        } catch (\Exception $e) {
            Log::error('Error en el método getHorasDisponibles: ' . $e->getMessage());
            return [];
        }
    }

    private function quitarTilde($cadena)
    {
        $no_permitidas = array("á", "é", "í", "ó", "ú", "Á", "É", "Í", "Ó", "Ú");
        $permitidas = array("a", "e", "i", "o", "u", "A", "E", "I", "O", "U");
        $texto = str_replace($no_permitidas, $permitidas, $cadena);
        return $texto;
    }

    protected function confirmReservation($to, $data)
    {
        try {
            Log::info("Confirmando reserva para el cliente: " . $data['name']);
            $company = Empresa::find($data['company_id']);
            $services = Servicio::whereIn('id', $data['services'])->get(); // Obtener los servicios seleccionados
            $name = $data['name'];
            $datetime = $data['datetime'];
            $fechaActual = Carbon::now()->toDateTimeString();

            // Separar fecha y hora
            list($fecha, $hora) = explode(' ', $datetime);

            // Registrar los datos que se intentan insertar
            Log::info("Datos de la reserva: ", [
                'agenda_id' => $company->id,
                'nombre_cliente' => $name,
                'telefono_cliente' => $to,
                'fecha' => $fecha,
                'hora' => $hora,
                'duracion' => $services->first()->duracion, // Duración del primer servicio
                'precio' => $services->first()->precio, // Precio del primer servicio
                'fecha_reserva' => $fechaActual,
                'servicios' => $data['services']
            ]);

            // Convertir la lista de servicios a JSON
            $serviciosJson = json_encode($data['services']);

            // Guardar la reserva en la base de datos
            ReservasUsuarioNoRegistrado::create([
                'agenda_id' => $company->id,
                'nombre_cliente' => $name,
                'email_cliente' => null,
                'telefono_cliente' => $to,
                'fecha' => $fecha,
                'hora' => $hora,
                'duracion' => $services->first()->duracion,
                'precio' => $services->first()->precio,
                'estado' => 'reservado',
                'observaciones' => null,
                'fecha_reserva' => $fechaActual,
                'servicios' => $serviciosJson,
            ]);

            // Crear mensaje de confirmación
            $message = "Reserva confirmada:\n";
            $message .= "Empresa: " . $company->name . "\n";
            $message .= "Cliente: " . $name . "\n";
            $message .= "Fecha y Hora: " . $datetime . "\n";
            $message .= "Servicios:\n";
            foreach ($services as $service) {
                $message .= "- " . $service->nombre . "\n";
            }

            Log::info("Reserva confirmada: " . $message);
            $this->sendMessage($to, $message);

            // Enviar recordatorio de la reserva
            $this->sendReservationReminder($to, $name, $fecha, $hora, $company->name);
        } catch (\Exception $e) {
            Log::error('Error en el método confirmReservation: ' . $e->getMessage());
        }
    }

    protected function isDateTimeAvailable($companyId, $dateTime)
    {
        try {
            Log::info("Comprobando disponibilidad para Empresa ID: $companyId, Fecha y Hora: $dateTime");

            $availability = !ReservasUsuarioNoRegistrado::where('agenda_id', $companyId)
                ->where('Fecha', $dateTime)
                ->exists();

            Log::info("Disponibilidad: " . ($availability ? "Disponible" : "No Disponible"));

            return $availability;
        } catch (\Exception $e) {
            Log::error('Error en el método isDateTimeAvailable: ' . $e->getMessage());
            return false;
        }
    }

    protected function sendMessage($to, $message)
    {
        try {
            $accessToken = env('META_ACCESS_TOKEN');
            $fromPhoneNumberId = env('META_PHONE_NUMBER_ID');
            $url = "https://graph.facebook.com/v12.0/$fromPhoneNumberId/messages";

            Http::withToken($accessToken)->post($url, [
                'messaging_product' => 'whatsapp',
                'to' => $to,
                'text' => ['body' => $message]
            ]);

            Log::info("Mensaje enviado a $to: $message");
        } catch (\Exception $e) {
            Log::error('Error en el método sendMessage: ' . $e->getMessage());
        }
    }

    protected function sendMessageWithLog($to, $message, $methodName)
    {
        try {
            $this->sendMessage($to, $message);
            Log::info("Mensaje enviado en $methodName: $message");
        } catch (\Exception $e) {
            Log::error("Error en el método $methodName: " . $e->getMessage());
        }
    }

    protected function resetConversationStep($to, $step)
    {
        $conversation = Conversation::where('user_phone', $to)->first();
        if ($conversation) {
            $data = $conversation->data;
            $data['step'] = $step;
            $conversation->data = $data;
            $conversation->save();
            Log::info("Conversación reiniciada para $to en el paso $step");
        }
    }

    //------------------------------- NO  CAMBIAR ----------------------------------------------------

    protected function sendReservationReminder($to, $name, $date, $time, $company)
    {
        try {
            $client = new Client();
            $phoneNumberId = env('META_PHONE_NUMBER_ID');
            $accessToken = env('META_ACCESS_TOKEN');

            $response = $client->post("https://graph.facebook.com/v19.0/$phoneNumberId/messages", [
                'headers' => [
                    'Authorization' => "Bearer $accessToken",
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'messaging_product' => 'whatsapp',
                    'to' => $to,
                    'type' => 'template',
                    'template' => [
                        'name' => 'recordatorio',
                        'language' => [
                            'code' => 'es'
                        ],
                        'components' => [
                            [
                                'type' => 'body',
                                'parameters' => [
                                    ['type' => 'text', 'text' => $name],
                                    ['type' => 'text', 'text' => $date],
                                    ['type' => 'text', 'text' => $time],
                                    ['type' => 'text', 'text' => $company]
                                ]
                            ]
                        ]
                    ]
                ],
            ]);

            Log::info("Mensaje de recordatorio enviado a $to: " . json_encode($response->getBody()));
        } catch (\Exception $e) {
            Log::error('Error en el método sendReservationReminder: ' . $e->getMessage());
        }
    }

    //---------------------------------------------------------------------------------------------------------

    public function verify(Request $request)
    {
        $verifyToken = env('VERIFY_TOKEN');

        $mode = $request->input('hub_mode');
        $token = $request->input('hub_verify_token');
        $challenge = $request->input('hub_challenge');

        if ($mode && $token) {
            if ($mode === 'subscribe' && $token === $verifyToken) {
                return response($challenge, 200);
            } else {
                return response('Verification token mismatch', 403);
            }
        }

        return response('Bad Request', 400);
    }

    public function handle(Request $request)
    {
        $data = $request->all();

        // Procesar el mensaje recibido
        // Aquí puedes guardar los detalles de la reserva en la base de datos

        return response('EVENT_RECEIVED', 200);
    }

    /*
     * VERIFICACION DEL WEBHOOK
     */
    public function webhook()
    {
        //TOQUEN QUE QUERRAMOS PONER 
        $token = 'Hola';
        //RETO QUE RECIBIREMOS DE FACEBOOK
        $hub_challenge = isset($_GET['hub_challenge']) ? $_GET['hub_challenge'] : '';
        //TOQUEN DE VERIFICACION QUE RECIBIREMOS DE FACEBOOK
        $hub_verify_token = isset($_GET['hub_verify_token']) ? $_GET['hub_verify_token'] : '';
        //SI EL TOKEN QUE GENERAMOS ES EL MISMO QUE NOS ENVIA FACEBOOK RETORNAMOS EL RETO PARA VALIDAR QUE SOMOS NOSOTROS
        if ($token === $hub_verify_token) {
            echo $hub_challenge;
            exit;
        }
    }

    /*
     * RECEPCION DE MENSAJES
     */
}
?>

// class WhatsAppController extends Controller
// {
// public function recibe(Request $request)
// {
// try {
// $input = $request->getContent();

// if (empty($input)) {
// Log::error('No se recibieron datos en la solicitud.');
// return response('No se recibieron datos', 400);
// }

// $data = json_decode($input, true);

// if (
// isset($data['entry'][0]['changes'][0]['value']['messages'][0]['from']) &&
// isset($data['entry'][0]['changes'][0]['value']['messages'][0]['text']['body'])
// ) {

// $from = $data['entry'][0]['changes'][0]['value']['messages'][0]['from'];
// $message = $data['entry'][0]['changes'][0]['value']['messages'][0]['text']['body'];

// Log::info("Mensaje recibido de: $from con cuerpo: $message");

// // Manejar la conversación con el usuario
// $this->handleConversation($from, $message);

// return response('Mensaje recibido', 200);
// } elseif (isset($data['entry'][0]['changes'][0]['value']['statuses'][0])) {
// Log::info('Notificación de estado recibida: ' . json_encode($data));
// // Manejar la notificación de estado si es necesario
// return response('Notificación de estado recibida', 200);
// }

// Log::error('Estructura de datos inválida en la solicitud: ' . json_encode($data));
// return response('Datos inválidos', 400);
// } catch (\Exception $e) {
// Log::error('Error en el método recibe: ' . $e->getMessage());
// return response('Error Interno del Servidor', 500);
// }
// }

// protected function handleConversation($from, $message)
// {
// try {
// $conversation = Conversation::firstOrCreate(['user_phone' => $from], ['data' => ['step' => 0]]);

// $data = $conversation->data; // Asumimos que $data ya es un array

// // Mostrar comandos disponibles al inicio de la conversación
// if ($conversation->wasRecentlyCreated || $data['step'] == 0) {
// $this->sendHelpMessage($from);
// $this->sendCompaniesList($from);
// $data['step'] = 1;
// $conversation->data = $data;
// $conversation->save();
// return;
// }

// // Convertir el mensaje a mayúsculas para manejo de comandos
// switch (strtoupper($message)) {
// case 'PARAR':
// $this->sendMessage($from, "La conversación ha sido detenida. Envía 'REINICIAR' para comenzar de nuevo.");
// $conversation->delete();
// return;

// case 'REINICIAR':
// $this->sendMessage($from, "La conversación ha sido reiniciada. Selecciona una empresa para comenzar.");
// $conversation->delete();
// $conversation = Conversation::firstOrCreate(['user_phone' => $from], ['data' => ['step' => 0]]);
// $this->sendCompaniesList($from);
// return;
// }

// // Obtener el paso actual de la conversación
// $step = $data['step'];

// // Manejar cada paso de la conversación
// switch ($step) {
// case 0:
// Log::info("Paso 0: Enviando lista de empresas");
// $this->sendCompaniesList($from);
// $data['step'] = 1;
// break;

// case 1:
// Log::info("Paso 1: Procesando selección de empresa");
// $this->handleCompanySelection($from, $message, $data);
// break;

// case 2:
// Log::info("Paso 2: Procesando selección de servicio");
// $this->handleServiceSelection($from, $message, $data);
// break;

// case 3:
// Log::info("Paso 3: Procesando nombre del cliente");
// $data['name'] = $message;
// $this->askForDate($from);
// $data['step'] = 4;
// break;

// case 4:
// Log::info("Paso 4: Procesando fecha de reserva");
// $data['date'] = $message;
// $this->sendAvailableTimes($from, $data);
// $data['step'] = 5;
// break;

// case 5:
// Log::info("Paso 5: Procesando hora de reserva");
// $data['time'] = $message;
// $data['datetime'] = $data['date'] . ' ' . $data['time'];
// if ($this->isDateTimeAvailable($data['company_id'], $data['datetime'])) {
// Log::info("Fecha y hora disponibles, confirmando reserva");
// $this->confirmReservation($from, $data);
// $data['step'] = 0; // Resetear conversación
// } else {
// Log::info("Fecha y hora no disponibles, solicitando otra hora");
// $this->sendMessage($from, "La fecha y hora seleccionada no está disponible. Por favor, elige otra hora.");
// $this->sendAvailableTimes($from, $data); // Mostrar horarios disponibles de nuevo
// }
// break;
// }

// // Guardar los datos actualizados de la conversación
// $conversation->data = $data;
// $conversation->save();
// } catch (\Exception $e) {
// Log::error('Error en el método handleConversation: ' . $e->getMessage());
// }
// }


// // Método para enviar el mensaje de ayuda
// protected function sendHelpMessage($to)
// {
// $helpMessage = "Bienvenido. Puedes usar los siguientes comandos en cualquier momento:\n";
// $helpMessage .= "PARAR: Detener la conversación.\n";
// $helpMessage .= "REINICIAR: Reiniciar la conversación desde el principio.";

// $this->sendMessage($to, $helpMessage);
// }

// protected function handleCompanySelection($from, $message, &$data)
// {
// $companyIndex = (int)$message - 1;
// $companies = Empresa::all();

// if (isset($companies[$companyIndex])) {
// $data['company_id'] = $companies[$companyIndex]->id;
// Log::info("Empresa seleccionada: " . $companies[$companyIndex]->name);
// $this->sendServicesList($from, $companies[$companyIndex]->id);
// $data['step'] = 2;
// } else {
// Log::info("Selección de empresa no válida: $message");
// $this->sendMessage($from, "Selección no válida. Por favor, selecciona una empresa válida.");
// $this->sendCompaniesList($from);
// }
// }

// protected function handleServiceSelection($from, $message, &$data)
// {
// $serviceIndex = (int)$message - 1;
// $companyId = $data['company_id'];
// $services = Servicio::where('empresa_id', $companyId)->get();

// if (isset($services[$serviceIndex])) {
// // Inicializar el array de servicios si no existe
// if (!isset($data['services'])) {
// $data['services'] = [];
// }

// // Agregar el servicio seleccionado al array
// $selectedService = $services[$serviceIndex]->id;
// if (!in_array($selectedService, $data['services'])) {
// $data['services'][] = $selectedService;
// }

// Log::info("Servicio seleccionado: " . $services[$serviceIndex]->nombre);
// // Pedir el nombre del cliente
// $this->askForName($from);
// $data['step'] = 3;
// } else {
// Log::info("Selección de servicio no válida: $message");
// $this->sendMessage($from, "Selección no válida. Por favor, selecciona un servicio válido.");
// $this->sendServicesList($from, $companyId);
// }
// }

// protected function sendCompaniesList($to)
// {
// try {
// $companies = Empresa::all();
// $message = "Selecciona una empresa:\n";
// foreach ($companies as $index => $company) {
// $message .= ($index + 1) . ". " . $company->name . "\n";
// }

// Log::info("Enviando lista de empresas: " . $message);
// $this->sendMessage($to, $message);
// } catch (\Exception $e) {
// Log::error('Error en el método sendCompaniesList: ' . $e->getMessage());
// }
// }

// protected function sendServicesList($to, $companyId)
// {
// try {
// $services = Servicio::where('empresa_id', $companyId)->get();
// if ($services->isEmpty()) {
// Log::info("No hay servicios disponibles para la empresa ID: $companyId");
// $this->sendMessage($to, "No hay servicios disponibles para esta empresa. Selecciona otra empresa.");
// $this->sendCompaniesList($to);
// $this->resetConversationStep($to, 1);
// return;
// }

// $message = "Selecciona un servicio:\n";
// foreach ($services as $index => $service) {
// $message .= ($index + 1) . ". " . $service->nombre . " - $" . $service->precio . "\n";
// }

// Log::info("Enviando lista de servicios: " . $message);
// $this->sendMessage($to, $message);
// } catch (\Exception $e) {
// Log::error('Error en el método sendServicesList: ' . $e->getMessage());
// }
// }

// protected function askForName($to)
// {
// $this->sendMessageWithLog($to, "Por favor, dime tu nombre.", 'askForName');
// }

// protected function askForDate($to)
// {
// $this->sendMessageWithLog($to, "Por favor, indícame la fecha para la reserva (YYYY-MM-DD).", 'askForDate');
// }

// protected function sendAvailableTimes($to, $data)
// {
// try {
// $date = $data['date'];
// $companyId = $data['company_id'];
// $serviceId = $data['services'][0]; // Usa el primer servicio para obtener la duración
// $service = Servicio::find($serviceId);
// $duracionServicios = $service->duracion; // Duración del servicio
// $intervaloReserva = 30; // Puedes ajustar este valor según tus necesidades

// Log::info("Buscando horarios disponibles para la empresa ID: $companyId en la fecha: $date");

// $availableTimes = $this->getHorasDisponibles($companyId, $date, $duracionServicios, $intervaloReserva);

// if (empty($availableTimes)) {
// $this->sendMessage($to, "No hay horarios disponibles para la fecha seleccionada. Por favor, elige otra fecha.");
// $this->askForDate($to);
// return;
// }

// $message = "Horarios disponibles para $date:\n";
// foreach ($availableTimes as $time) {
// $message .= $time . "\n";
// }

// Log::info("Horarios disponibles enviados: " . $message);
// $this->sendMessage($to, $message);
// } catch (\Exception $e) {
// Log::error('Error en el método sendAvailableTimes: ' . $e->getMessage());
// }
// }

// protected function getHorasDisponibles($agendaId, $fecha, $duracionServicios, $intervaloReserva)
// {
// Log::info("Obteniendo horas disponibles para Agenda ID: $agendaId en la fecha: $fecha");
// try {
// // Obtener la agenda y sus intervalos
// $agenda = Agenda::findOrFail($agendaId);
// $intervalos = $agenda->intervalos;

// // Obtener Las reservas existentes para esa fecha de reservas con usuario
// $reservasExistentesConUsuario = Reserva::where('agenda_id', $agendaId)
// ->where('Fecha', $fecha)
// ->get();

// // Obtener las reservas existentes para esa fecha
// $reservasExistentes = ReservasUsuarioNoRegistrado::where('agenda_id', $agendaId)
// ->where('Fecha', $fecha)
// ->get();

// // Crear una lista de bloques de tiempo ocupados por reservas
// $bloquesOcupados = [];
// foreach ($reservasExistentes as $reserva) {
// $horaInicioReserva = new DateTime($reserva->hora);
// $horaFinReserva = (clone $horaInicioReserva)->add(new DateInterval('PT' . $reserva->duracion . 'M'))->format('H:i');
// $bloquesOcupados[] = [
// 'inicio' => $horaInicioReserva->format('H:i'),
// 'fin' => $horaFinReserva,
// ];
// }

// foreach ($reservasExistentesConUsuario as $reserva) {
// $horaInicioReserva = new DateTime($reserva->hora);
// $horaFinReserva = (clone $horaInicioReserva)->add(new DateInterval('PT' . $reserva->duracion . 'M'))->format('H:i');
// $bloquesOcupados[] = [
// 'inicio' => $horaInicioReserva->format('H:i'),
// 'fin' => $horaFinReserva,
// ];
// }

// // Crear objetos DateTime para la fecha de la reserva
// $fechaCarbon = Carbon::createFromFormat('Y-m-d', $fecha);
// $diaSemanaReserva = $this->quitarTilde($fechaCarbon->locale('es')->isoFormat('dddd'));

// $horasDisponibles = [];

// foreach ($intervalos as $intervalo) {
// $diasSemanaArray = json_decode($intervalo->dias_semanas);

// if (in_array($diaSemanaReserva, $diasSemanaArray)) {
// $horaInicioIntervalo = new DateTime($intervalo->hora_inicio);
// $horaFinIntervalo = new DateTime($intervalo->hora_fin);

// $horaActual = $horaInicioIntervalo;

// while ($horaActual < $horaFinIntervalo) { // $horaFinActual=(clone $horaActual)->add(new DateInterval('PT' . $duracionServicios . 'M'));

    // if ($horaFinActual > $horaFinIntervalo) {
    // break;
    // }

    // $horaInicioStr = $horaActual->format('H:i');
    // $horaFinStr = $horaFinActual->format('H:i');

    // $ocupado = false;
    // foreach ($bloquesOcupados as $bloque) {
    // if (!($horaFinStr <= $bloque['inicio'] || $horaInicioStr>= $bloque['fin'])) {
        // $ocupado = true;
        // break;
        // }
        // }

        // if (!$ocupado) {
        // $horasDisponibles[] = $horaInicioStr;
        // }

        // $horaActual->add(new DateInterval('PT' . $intervaloReserva . 'M'));
        // }
        // }
        // }

        // Log::info("Horas disponibles calculadas: " . implode(", ", $horasDisponibles));
        // return $horasDisponibles;
        // } catch (\Exception $e) {
        // Log::error('Error en el método getHorasDisponibles: ' . $e->getMessage());
        // return [];
        // }
        // }

        // private function quitarTilde($cadena)
        // {
        // $no_permitidas = array("á", "é", "í", "ó", "ú", "Á", "É", "Í", "Ó", "Ú");
        // $permitidas = array("a", "e", "i", "o", "u", "A", "E", "I", "O", "U");
        // $texto = str_replace($no_permitidas, $permitidas, $cadena);
        // return $texto;
        // }

        // protected function confirmReservation($to, $data)
        // {
        // try {
        // Log::info("Confirmando reserva para el cliente: " . $data['name']);
        // $company = Empresa::find($data['company_id']);
        // $services = Servicio::whereIn('id', $data['services'])->get(); // Obtener los servicios seleccionados
        // $name = $data['name'];
        // $datetime = $data['datetime'];
        // $fechaActual = Carbon::now()->toDateTimeString();

        // // Separar fecha y hora
        // list($fecha, $hora) = explode(' ', $datetime);

        // // Registrar los datos que se intentan insertar
        // Log::info("Datos de la reserva: ", [
        // 'agenda_id' => $company->id,
        // 'nombre_cliente' => $name,
        // 'telefono_cliente' => $to,
        // 'fecha' => $fecha,
        // 'hora' => $hora,
        // 'duracion' => $services->first()->duracion, // Duración del primer servicio
        // 'precio' => $services->first()->precio, // Precio del primer servicio
        // 'fecha_reserva' => $fechaActual,
        // 'servicios' => $data['services']
        // ]);

        // // Convertir la lista de servicios a JSON
        // $serviciosJson = json_encode($data['services']);

        // // Guardar la reserva en la base de datos
        // ReservasUsuarioNoRegistrado::create([
        // 'agenda_id' => $company->id,
        // 'nombre_cliente' => $name,
        // 'email_cliente' => null,
        // 'telefono_cliente' => $to,
        // 'fecha' => $fecha,
        // 'hora' => $hora,
        // 'duracion' => $services->first()->duracion,
        // 'precio' => $services->first()->precio,
        // 'estado' => 'reservado',
        // 'observaciones' => null,
        // 'fecha_reserva' => $fechaActual,
        // 'servicios' => $serviciosJson,
        // ]);

        // // Crear mensaje de confirmación
        // $message = "Reserva confirmada:\n";
        // $message .= "Empresa: " . $company->name . "\n";
        // $message .= "Cliente: " . $name . "\n";
        // $message .= "Fecha y Hora: " . $datetime . "\n";
        // $message .= "Servicios:\n";
        // foreach ($services as $service) {
        // $message .= "- " . $service->nombre . "\n";
        // }

        // Log::info("Reserva confirmada: " . $message);
        // $this->sendMessage($to, $message);
        // } catch (\Exception $e) {
        // Log::error('Error en el método confirmReservation: ' . $e->getMessage());
        // }
        // }


        // protected function isDateTimeAvailable($companyId, $dateTime)
        // {
        // try {
        // Log::info("Comprobando disponibilidad para Empresa ID: $companyId, Fecha y Hora: $dateTime");

        // $availability = !ReservasUsuarioNoRegistrado::where('agenda_id', $companyId)
        // ->where('Fecha', $dateTime)
        // ->exists();

        // Log::info("Disponibilidad: " . ($availability ? "Disponible" : "No Disponible"));

        // return $availability;
        // } catch (\Exception $e) {
        // Log::error('Error en el método isDateTimeAvailable: ' . $e->getMessage());
        // return false;
        // }
        // }

        // protected function sendMessage($to, $message)
        // {
        // try {
        // $accessToken = env('META_ACCESS_TOKEN');
        // $fromPhoneNumberId = env('META_PHONE_NUMBER_ID');
        // $url = "https://graph.facebook.com/v12.0/$fromPhoneNumberId/messages";

        // Http::withToken($accessToken)->post($url, [
        // 'messaging_product' => 'whatsapp',
        // 'to' => $to,
        // 'text' => ['body' => $message]
        // ]);

        // Log::info("Mensaje enviado a $to: $message");
        // } catch (\Exception $e) {
        // Log::error('Error en el método sendMessage: ' . $e->getMessage());
        // }
        // }

        // protected function sendMessageWithLog($to, $message, $methodName)
        // {
        // try {
        // $this->sendMessage($to, $message);
        // Log::info("Mensaje enviado en $methodName: $message");
        // } catch (\Exception $e) {
        // Log::error("Error en el método $methodName: " . $e->getMessage());
        // }
        // }

        // protected function resetConversationStep($to, $step)
        // {
        // $conversation = Conversation::where('user_phone', $to)->first();
        // if ($conversation) {
        // $data = $conversation->data;
        // $data['step'] = $step;
        // $conversation->data = $data;
        // $conversation->save();
        // Log::info("Conversación reiniciada para $to en el paso $step");
        // }
        // }

        // //------------------------------- NO CAMBIAR ----------------------------------------------------

        // protected function sendReservationReminder($to, $name, $date, $time, $company)
        // {
        // try {
        // $client = new Client();
        // $phoneNumberId = env('META_PHONE_NUMBER_ID');
        // $accessToken = env('META_ACCESS_TOKEN');

        // $response = $client->post("https://graph.facebook.com/v19.0/$phoneNumberId/messages", [
        // 'headers' => [
        // 'Authorization' => "Bearer $accessToken",
        // 'Content-Type' => 'application/json',
        // ],
        // 'json' => [
        // 'messaging_product' => 'whatsapp',
        // 'to' => $to,
        // 'type' => 'template',
        // 'template' => [
        // 'name' => 'recordatorio',
        // 'language' => [
        // 'code' => 'es'
        // ],
        // 'components' => [
        // [
        // 'type' => 'body',
        // 'parameters' => [
        // ['type' => 'text', 'text' => $name],
        // ['type' => 'text', 'text' => $date],
        // ['type' => 'text', 'text' => $time],
        // ['type' => 'text', 'text' => $company]
        // ]
        // ]
        // ]
        // ]
        // ],
        // ]);

        // Log::info("Mensaje de recordatorio enviado a $to: $response");
        // } catch (\Exception $e) {
        // Log::error('Error en el método sendReservationReminder: ' . $e->getMessage());
        // }
        // }


        // //---------------------------------------------------------------------------------------------------------

        // public function verify(Request $request)
        // {
        // $verifyToken = env('VERIFY_TOKEN');

        // $mode = $request->input('hub_mode');
        // $token = $request->input('hub_verify_token');
        // $challenge = $request->input('hub_challenge');

        // if ($mode && $token) {
        // if ($mode === 'subscribe' && $token === $verifyToken) {
        // return response($challenge, 200);
        // } else {
        // return response('Verification token mismatch', 403);
        // }
        // }

        // return response('Bad Request', 400);
        // }

        // public function handle(Request $request)
        // {
        // $data = $request->all();

        // // Procesar el mensaje recibido
        // // Aquí puedes guardar los detalles de la reserva en la base de datos

        // return response('EVENT_RECEIVED', 200);
        // }

        // /*
        // * VERIFICACION DEL WEBHOOK
        // */
        // public function webhook()
        // {
        // //TOQUEN QUE QUERRAMOS PONER
        // $token = 'Hola';
        // //RETO QUE RECIBIREMOS DE FACEBOOK
        // $hub_challenge = isset($_GET['hub_challenge']) ? $_GET['hub_challenge'] : '';
        // //TOQUEN DE VERIFICACION QUE RECIBIREMOS DE FACEBOOK
        // $hub_verify_token = isset($_GET['hub_verify_token']) ? $_GET['hub_verify_token'] : '';
        // //SI EL TOKEN QUE GENERAMOS ES EL MISMO QUE NOS ENVIA FACEBOOK RETORNAMOS EL RETO PARA VALIDAR QUE SOMOS NOSOTROS
        // if ($token === $hub_verify_token) {
        // echo $hub_challenge;
        // exit;
        // }
        // }
        // /*
        // * RECEPCION DE MENSAJES
        // */
        // }