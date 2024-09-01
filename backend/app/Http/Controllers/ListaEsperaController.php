<?php

namespace App\Http\Controllers;

use App\Models\ListaEspera;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Cliente;
use App\Models\Agenda;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\ListaEsperaDisponible;
use app\Http\Controllers\IntervaloController;


use DateTime;
use DateInterval;
use Illuminate\Support\Facades\DB; 

class ListaEsperaController extends Controller
{

    public function inscribirListaEspera2(Request $request)
{
    
    $validator = Validator::make($request->all(), [
        'cliente_id' => 'required|exists:clientes,id',
        'agenda_id' => 'required|exists:agendas,id',
        'fecha_inicio' => 'required|date|after_or_equal:today',
        'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
        'hora_inicio' => 'required|date_format:H:i',
        'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
    ], [
        'cliente_id.required' => 'El cliente es obligatorio.',
        'agenda_id.required' => 'La agenda es obligatoria.',
        'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
        'fecha_fin.required' => 'La fecha de fin es obligatoria.',
        'hora_inicio.required' => 'La hora de inicio es obligatoria.',
        'hora_fin.required' => 'La hora de fin es obligatoria.',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'errors' => $validator->errors(),
            'message' => 'Error de validación.'
        ], 400);
    }

    $fechaInicio = Carbon::parse($request->fecha_inicio);
    $fechaFin = Carbon::parse($request->fecha_fin);
    $horaInicio = $request->hora_inicio;
    $horaFin = $request->hora_fin;
    $agendaId = $request->agenda_id;
    // $duracionServicios = Carbon::parse($horaFin)->diffInMinutes(Carbon::parse($horaInicio));
    $duracionServicios = 15;
    $intervaloReserva = 15; // Intervalo fijo, puedes ajustarlo según tu necesidad

    
    // Recorrer cada día en el rango de fechas
    for ($fecha = $fechaInicio; $fecha->lte($fechaFin); $fecha->addDay()) {
        // return $duracionServicios;
        $response = $this->getHorasDisponibles(new Request([
            'agenda_id' => $agendaId,
            'fecha' => $fecha->format('Y-m-d'),
            'duracion_servicios' => $duracionServicios,
            'intervalo_reserva' => $intervaloReserva
        ]));

       
        
        $horasDisponibles = $response->getData()->horas_disponibles;

        // Comprobar si hay una hora disponible en el rango solicitado
        foreach ($horasDisponibles as $horaDisponible) {
            if ($horaDisponible >= $horaInicio && $horaDisponible <= $horaFin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya hay un lugar disponible en el rango seleccionado.',
                    'fecha' => $fecha->format('Y-m-d'),
                    'hora_disponible' => $horaDisponible
                ], 400);
            }
        }
    }

    // Si no se encontró disponibilidad, crear la inscripción en la lista de espera
    $listaEspera = ListaEspera::create([
        'cliente_id' => $request->cliente_id,
        'agenda_id' => $request->agenda_id,
        'fecha_inicio' => $request->fecha_inicio,
        'fecha_fin' => $request->fecha_fin,
        'hora_inicio' => $request->hora_inicio,
        'hora_fin' => $request->hora_fin,
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Inscripción en la lista de espera creada con éxito.',
        'data' => $listaEspera,
    ], 201);
}



    public function inscribirListaEspera(Request $request)
    {
        // Validar los datos de entrada
        $validator = Validator::make($request->all(), [
            'cliente_id' => 'required|exists:clientes,id',
            'agenda_id' => 'required|exists:agendas,id',
            'fecha_inicio' => 'required|date|after_or_equal:today',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
        ], [
            'cliente_id.required' => 'El cliente es obligatorio.',
            'agenda_id.required' => 'La agenda es obligatoria.',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_fin.required' => 'La fecha de fin es obligatoria.',
            'hora_inicio.required' => 'La hora de inicio es obligatoria.',
            'hora_fin.required' => 'La hora de fin es obligatoria.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 400);
        }

        // Crear la inscripción en la lista de espera
        $listaEspera = ListaEspera::create([
            'cliente_id' => $request->cliente_id,
            'agenda_id' => $request->agenda_id,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin' => $request->fecha_fin,
            'hora_inicio' => $request->hora_inicio,
            'hora_fin' => $request->hora_fin,
            'notificado' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Inscripción en la lista de espera creada con éxito.',
            'data' => $listaEspera,
        ], 201);
    }

    // Método para verificar la disponibilidad y notificar al cliente
    public function verificarDisponibilidad()
    {
        // Obtener todas las inscripciones en la lista de espera
        $inscripciones = ListaEspera::with('cliente', 'agenda')->get();

        foreach ($inscripciones as $inscripcion) {
            // Lógica para verificar si hay disponibilidad en el rango de fechas y horas seleccionadas
            $reservasExistentes = Reserva::where('agenda_id', $inscripcion->agenda_id)
                ->whereBetween('fecha', [$inscripcion->fecha_inicio, $inscripcion->fecha_fin])
                ->where(function ($query) use ($inscripcion) {
                    $query->where(function ($query) use ($inscripcion) {
                        $query->where('hora', '>=', $inscripcion->hora_inicio)
                            ->where('hora', '<=', $inscripcion->hora_fin);
                    });
                })
                ->count();

            // if ($reservasExistentes === 0) {
                // Enviar notificación al cliente
                // $cliente = $inscripcion->cliente;
                // Mail::to($cliente->email)->send(new \App\Mail\ListaEsperaDisponible($inscripcion));

                // Opcionalmente, eliminar la inscripción de la lista de espera después de notificar
                // $inscripcion->delete();
            // }
        }

        return response()->json([
            'success' => true,
            'reservas' => $reservasExistentes,
            'message' => 'Verificación de disponibilidad completada.',
        ], 200);
    }

    // public function verificarDisponibilidad()
    // {
    //     // return "dd";
    //     // Obtener todas las inscripciones en la lista de espera que aún no han sido notificadas
    //     $inscripciones = ListaEspera::with('cliente', 'agenda')
    //         ->where('notificado', false)
    //         ->get();  // ->get() asegura que obtenemos una colección de modelos ListaEspera
    
            
    //     foreach ($inscripciones as $inscripcion) {
    //         // Ahora $inscripcion es de tipo ListaEspera y no Builder
           
    //         // Lógica para verificar si hay disponibilidad en el rango de fechas y horas seleccionadas
    //         $reservasExistentes = Reserva::where('agenda_id', $inscripcion->agenda_id)
    //             ->whereBetween('fecha', [$inscripcion->fecha_inicio, $inscripcion->fecha_fin])
    //             ->where(function ($query) use ($inscripcion) {
    //                 $query->where(function ($query) use ($inscripcion) {
    //                     $query->where('hora', '>=', $inscripcion->hora_inicio)
    //                         ->where('hora', '<=', $inscripcion->hora_fin);
    //                 });
    //             })
    //             ->where('estado', 'reservado') // Ignorar las reservas canceladas
    //             ->count();
    
    //         if ($reservasExistentes === 0) {
    //             // Enviar notificación al cliente
    //             $cliente = $inscripcion->cliente;

    //             // return $inscripcion;
    //             $inscripcion2 = ListaEspera::where('cliente_id', $inscripcion['cliente_id'])
    //             ->where('agenda_id', $inscripcion['agenda_id'])
    //             ->where('fecha_inicio', $inscripcion['fecha_inicio'])
    //             ->where('fecha_fin', $inscripcion['fecha_fin'])
    //             ->where('hora_inicio', $inscripcion['hora_inicio'])
    //             ->where('hora_fin', $inscripcion['hora_fin'])
    //             ->first();

    //             // return $inscripcion2;
    //             Mail::to($cliente->email)->send(new ListaEsperaDisponible($inscripcion2));
    
    //             // Marcar al cliente como notificado y guardar el cambio en la base de datos
    //             $inscripcion2->notificado = true;
    //             $inscripcion2->save(); // Guardar el cambio en la base de datos
    
    //             // Opcionalmente, eliminar la inscripción de la lista de espera después de notificar
    //             // $inscripcion->delete();
    //         }
    //     }
    
    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Verificación de disponibilidad completada.',
    //     ], 200);
    // }
    

    public function getHorasDisponibles(Request $request)
    {
        
        $agendaId = $request->input('agenda_id');
        $fecha = $request->input('fecha'); // formato 'Y-m-d'
        $duracionServicios = $request->input('duracion_servicios'); // duracion total de los servicios en minutos
        $intervaloReserva = $request->input('intervalo_reserva'); // intervalo en minutos, ej: 30
    
        // Obtener la agenda y sus intervalos
        $agenda = Agenda::findOrFail($agendaId);
        $intervalos = $agenda->intervalos;
    
        // Obtener las reservas existentes para esa fecha que no estén canceladas
        $reservasExistentes = Reserva::where('agenda_id', $agendaId)
            ->where('fecha', $fecha)
            ->where('estado', '!=', 'cancelado') // Excluir reservas canceladas
            ->get();
    
        // Obtener las reservas de usuarios no registrados para esa fecha que no estén canceladas
        $reservasNoRegistradas = DB::table('reservas_usuario_no_registrado')
            ->where('agenda_id', $agendaId)
            ->where('fecha', $fecha)
            ->where('estado', '!=', 'cancelado') // Excluir reservas canceladas
            ->get();
    
        // Crear una lista de bloques de tiempo ocupados por reservas de usuarios registrados
        $bloquesOcupados = [];
        foreach ($reservasExistentes as $reserva) {
            $horaInicioReserva = new DateTime($reserva->hora);
            $horaFinReserva = (clone $horaInicioReserva)->add(new DateInterval('PT' . $reserva->duracion . 'M'))->format('H:i');
            $bloquesOcupados[] = [
                'inicio' => $horaInicioReserva->format('H:i'),
                'fin' => $horaFinReserva,
            ];
        }
    
        // Añadir bloques ocupados por reservas de usuarios no registrados
        foreach ($reservasNoRegistradas as $reserva) {
            $horaInicioReserva = new DateTime($reserva->hora);
            $horaFinReserva = (clone $horaInicioReserva)->add(new DateInterval('PT' . $reserva->duracion . 'M'))->format('H:i');
            $bloquesOcupados[] = [
                'inicio' => $horaInicioReserva->format('H:i'),
                'fin' => $horaFinReserva,
            ];
        }
        
        // Crear objetos DateTime para la fecha de la reserva
        $fechaCarbon = Carbon::createFromFormat('Y-m-d', $fecha);
        // $fechaCarbon = $fecha;
        $fecha = Carbon::parse($fecha);

    //    return $fecha;
        // return Carbon::createFromFormat('Y-m-d', $fecha);

        $diaSemanaReserva = $this->quitarTilde($fecha->locale('es')->isoFormat('dddd'));
        // return $diaSemanaReserva
        // return $diaSemanaReserva;
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
    
                    // Verificar si la fecha es hoy y filtrar horas pasadas
                    if ($fechaCarbon->isToday()) {
                        $horaActualCarbon = Carbon::createFromFormat('H:i', $horaInicioStr);
                        if ($horaActualCarbon->isPast()) {
                            $ocupado = true;
                        }
                    }
    
                    if (!$ocupado) {
                        $horasDisponibles[] = $horaInicioStr;
                    }
    
                    $horaActual->add(new DateInterval('PT' . $intervaloReserva . 'M'));
                }
            }
        }
    
        return response()->json([
            'horas_disponibles' => $horasDisponibles,
            'bloque' => $bloquesOcupados
        ]);
    }


    public function quitarTilde($cadena)
    {
        $no_permitidas = array("á", "é", "í", "ó", "ú", "Á", "É", "Í", "Ó", "Ú");
        $permitidas = array("a", "e", "i", "o", "u", "A", "E", "I", "O", "U");
        $texto = str_replace($no_permitidas, $permitidas, $cadena);
        return $texto;
    }
    

}
