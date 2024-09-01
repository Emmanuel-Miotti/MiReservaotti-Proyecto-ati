<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Intervalo;
use App\Models\Reserva;
use App\Models\ReservasUsuarioNoRegistrado;
use App\Models\Agenda;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use DateTime;
use DateInterval;
use Illuminate\Support\Facades\DB; 

class IntervaloController extends Controller
{

    public function getIntervalosPorEmpresa($id)
    {
        $intervalos = Intervalo::whereHas('agenda', function ($query) use ($id) {
            $query->where('empresa_id', $id);
        })->get();

        return response()->json([
            'success' => true,
            'data' => $intervalos,
        ]);
    }

    public function store(Request $request)
{
    // Validar la solicitud
    $validator = Validator::make($request->all(), [
        'agenda_id' => 'required|exists:agendas,id',
        'dias_semanas' => 'required|array',
        'dias_semanas.*' => 'in:lunes,martes,miercoles,jueves,viernes,sabado,domingo',
        'hora_inicio' => 'required|date_format:H:i',
        'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
    ], [
        'agenda_id.required' => 'El campo agenda_id es obligatorio.',
        'agenda_id.exists' => 'La agenda especificada no existe.',
        'dias_semanas.required' => 'El campo dias_semanas es obligatorio.',
        'dias_semanas.array' => 'El campo dias_semanas debe ser un array.',
        'dias_semanas.*.in' => 'Cada día en dias_semanas debe ser un día de la semana válido.',
        'hora_inicio.required' => 'El campo hora_inicio es obligatorio.',
        'hora_inicio.date_format' => 'El campo hora_inicio debe tener el formato HH:MM.',
        'hora_fin.required' => 'El campo hora_fin es obligatorio.',
        'hora_fin.date_format' => 'El campo hora_fin debe tener el formato HH:MM.',
        'hora_fin.after' => 'El campo hora_fin debe ser posterior a hora_inicio.',
    ]);

    if ($validator->fails()) {
        return response()->json($validator->errors(), 400);
    }

    // Ordenar los días de la semana
    $dias_semanas_ordenados = $this->ordenarDiasSemana($request->dias_semanas);

    // Verificar solapamiento de intervalos
    $existingIntervals = Intervalo::where('agenda_id', $request->agenda_id)
        // ->where(function($query) use ($dias_semanas_ordenados) {
        //     foreach ($dias_semanas_ordenados as $dia) {
        //         $query->orWhereJsonContains('dias_semanas', $dia);
        //     }
        // })
        ->get();

        // return $existingIntervals;

    foreach ($existingIntervals as $interval) {
        $dias_existentes = json_decode($interval->dias_semanas, true);
        foreach ($dias_semanas_ordenados as $dia) {
            if (in_array($dia, $dias_existentes)) {
                if (
                    ($request->hora_inicio < $interval->hora_fin && $request->hora_inicio >= $interval->hora_inicio) ||
                    ($request->hora_fin > $interval->hora_inicio && $request->hora_fin <= $interval->hora_fin) ||
                    ($request->hora_inicio <= $interval->hora_inicio && $request->hora_fin >= $interval->hora_fin)
                ) {
                    return response()->json([
                        'success' => false,
                        'message' => "El intervalo propuesto se solapa con un intervalo existente el día $dia.",
                    ], 400);
                }
            }
        }
    }

    $dias_semanas_json = json_encode($dias_semanas_ordenados);

    try {
        $intervalo = Intervalo::create([
            'agenda_id' => $request->agenda_id,
            'dias_semanas' => $dias_semanas_json,
            'hora_inicio' => $request->hora_inicio,
            'hora_fin' => $request->hora_fin,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Intervalo creado exitosamente',
            'data' => $intervalo
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al crear el intervalo.',
            'error' => $e->getMessage()
        ], 500);
    }
}

private function ordenarDiasSemana($dias)
{
    $ordenDias = [
        'lunes' => 1,
        'martes' => 2,
        'miercoles' => 3,
        'jueves' => 4,
        'viernes' => 5,
        'sabado' => 6,
        'domingo' => 7,
    ];

    usort($dias, function($a, $b) use ($ordenDias) {
        return $ordenDias[$a] <=> $ordenDias[$b];
    });

    return $dias;
}

    


    // Añadir método update al controlador IntervaloController
public function update(Request $request, $id)
{
    $validator = Validator::make($request->all(), [
        'agenda_id' => 'required|exists:agendas,id',
        'dias_semanas' => 'required|array',
        'dias_semanas.*' => 'in:lunes,martes,miercoles,jueves,viernes,sabado,domingo', // sin tildes
        'hora_inicio' => 'required|date_format:H:i',
        'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
    ], [
        'agenda_id.required' => 'El campo agenda_id es obligatorio.',
        'agenda_id.exists' => 'La agenda especificada no existe.',
        'dias_semanas.required' => 'El campo dias_semanas es obligatorio.',
        'dias_semanas.array' => 'El campo dias_semanas debe ser un array.',
        'dias_semanas.*.in' => 'Cada día en dias_semanas debe ser un día de la semana válido.',
        'hora_inicio.required' => 'El campo hora_inicio es obligatorio.',
        'hora_inicio.date_format' => 'El campo hora_inicio debe tener el formato HH:MM.',
        'hora_fin.required' => 'El campo hora_fin es obligatorio.',
        'hora_fin.date_format' => 'El campo hora_fin debe tener el formato HH:MM.',
        'hora_fin.after' => 'El campo hora_fin debe ser posterior a hora_inicio.',
    ]);

    if ($validator->fails()) {
        return response()->json($validator->errors(), 400);
    }

    // Convertir el array de días de la semana a JSON
    $dias_semanas_ordenados = $this->ordenarDiasSemana($request->dias_semanas);

        // Verificar solapamiento de intervalos
        $existingIntervals = Intervalo::where('agenda_id', $request->agenda_id)
        // ->where(function($query) use ($dias_semanas_ordenados) {
        //     foreach ($dias_semanas_ordenados as $dia) {
        //         $query->orWhereJsonContains('dias_semanas', $dia);
        //     }
        // })
        ->get();

        // return $existingIntervals;

    foreach ($existingIntervals as $interval) {
        if($interval->id != $id) {
            $dias_existentes = json_decode($interval->dias_semanas, true);
            foreach ($dias_semanas_ordenados as $dia) {
                if (in_array($dia, $dias_existentes)) {
                    if (
                        ($request->hora_inicio < $interval->hora_fin && $request->hora_inicio >= $interval->hora_inicio) ||
                        ($request->hora_fin > $interval->hora_inicio && $request->hora_fin <= $interval->hora_fin) ||
                        ($request->hora_inicio <= $interval->hora_inicio && $request->hora_fin >= $interval->hora_fin)
                    ) {
                        return response()->json([
                            'success' => false,
                            'message' => "El intervalo propuesto se solapa con un intervalo existente el día $dia.",
                        ], 400);
                    }
                }
            }
        }

    }

    $dias_semanas_json = json_encode($dias_semanas_ordenados);

    // Actualizar el intervalo con los datos validados y el JSON de días de la semana
    $intervalo = Intervalo::findOrFail($id);
    $intervalo->update([
        'agenda_id' => $request->agenda_id,
        'dias_semanas' => $dias_semanas_json,
        'hora_inicio' => $request->hora_inicio,
        'hora_fin' => $request->hora_fin,
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Intervalo actualizado exitosamente',
        'data' => $intervalo
    ]);
}

    


    public function intervaloReserva(Request $request)
    {


        $validator = Validator::make($request->all(), [
            'fecha' => 'required|date_format:Y-m-d',
            'minutos' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $fecha = $request->input('fecha');
        $minutos = $request->input('minutos');

        // Obtener los intervalos para la agenda en el día específico
        // $diaSemana = strtolower(Carbon::parse($fecha)->format('l')); // Convertir a minúsculas


        $fecha = Carbon::createFromFormat('Y-m-d', $request->fecha);
        $diaSemana = $fecha->locale('es')->isoFormat('dddd');


        // return $diaSemana;



        $intervalos = Intervalo::where('agenda_id', $request->agenda_id)
            ->whereJsonContains('dias_semanas', $diaSemana)
            ->get();


        // Obtener las reservas existentes para la agenda en la fecha dada
        $reservas = Reserva::where('agenda_id', $request->agenda_id)
            ->where('fecha', $fecha)
            ->get();

        $horasDisponibles = [];

        // return $reservas;

        foreach ($intervalos as $intervalo) {


            $start = Carbon::createFromFormat('H:i', $intervalo->hora_inicio);
            $end = Carbon::createFromFormat('H:i', $intervalo->hora_fin);

            // $start = (new DateTime($intervalo->hora_inicio))->format('H:i');;
            // $end = (new DateTime($intervalo->hora_fin))->format('H:i');;


            while ($start->copy()->addMinutes($minutos)->lte($end)) {
                $endSegment = $start->copy()->addMinutes($minutos);
                $ocupado = false;

                foreach ($reservas as $reserva) {
                    $reservaStart = Carbon::createFromFormat('H:i', $reserva->hora_inicio);
                    $reservaEnd = Carbon::createFromFormat('H:i', $reserva->hora_fin);

                    if (
                        $start->between($reservaStart, $reservaEnd->subMinute()) ||
                        $endSegment->between($reservaStart->addMinute(), $reservaEnd)
                    ) {
                        $ocupado = true;
                        break;
                    }
                }

                if (!$ocupado) {
                    $horasDisponibles[] = $start->format('H:i');
                }

                $start->addMinutes($minutos);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $horasDisponibles
        ]);
    }


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
    



    // public function getHorasDisponibles(Request $request)
    // {
    //     $agendaId = $request->input('agenda_id');
    //     $fecha = $request->input('fecha'); // formato 'Y-m-d'
    //     $duracionServicios = $request->input('duracion_servicios'); // duracion total de los servicios en minutos
    //     $intervaloReserva = $request->input('intervalo_reserva'); // intervalo en minutos, ej: 30
    
    //     // Obtener la agenda y sus intervalos
    //     $agenda = Agenda::findOrFail($agendaId);
    //     $intervalos = $agenda->intervalos;
    
    //     // Obtener las reservas existentes para esa fecha
    //     $reservasExistentes = Reserva::where('agenda_id', $agendaId)
    //         ->where('fecha', $fecha)
    //         ->get();
    
    //     // Crear una lista de bloques de tiempo ocupados por reservas
    //     $bloquesOcupados = [];
    //     foreach ($reservasExistentes as $reserva) {
    //         $horaInicioReserva = new DateTime($reserva->hora);
    //         $horaFinReserva = (clone $horaInicioReserva)->add(new DateInterval('PT' . $reserva->duracion . 'M'))->format('H:i');
    //         $bloquesOcupados[] = [
    //             'inicio' => $horaInicioReserva->format('H:i'),
    //             'fin' => $horaFinReserva,
    //         ];
    //     }
    
    //     // Crear objetos DateTime para la fecha de la reserva
    //     $fechaCarbon = Carbon::createFromFormat('Y-m-d', $fecha);
    //     $diaSemanaReserva = $this->quitarTilde($fechaCarbon->locale('es')->isoFormat('dddd'));
    
    //     $horasDisponibles = [];
    
    //     foreach ($intervalos as $intervalo) {
    //         $diasSemanaArray = json_decode($intervalo->dias_semanas);
    
    //         if (in_array($diaSemanaReserva, $diasSemanaArray)) {
    //             $horaInicioIntervalo = new DateTime($intervalo->hora_inicio);
    //             $horaFinIntervalo = new DateTime($intervalo->hora_fin);
    
    //             $horaActual = $horaInicioIntervalo;
    
    //             while ($horaActual < $horaFinIntervalo) {
    //                 $horaFinActual = (clone $horaActual)->add(new DateInterval('PT' . $duracionServicios . 'M'));
    
    //                 if ($horaFinActual > $horaFinIntervalo) {
    //                     break;
    //                 }
    
    //                 $horaInicioStr = $horaActual->format('H:i');
    //                 $horaFinStr = $horaFinActual->format('H:i');
    
    //                 $ocupado = false;
    //                 foreach ($bloquesOcupados as $bloque) {
    //                     if (!($horaFinStr <= $bloque['inicio'] || $horaInicioStr >= $bloque['fin'])) {
    //                         $ocupado = true;
    //                         break;
    //                     }
    //                 }
    
    //                 // Verificar si la fecha es hoy y filtrar horas pasadas
    //                 if ($fechaCarbon->isToday()) {
    //                     $horaActualCarbon = Carbon::createFromFormat('H:i', $horaInicioStr);
    //                     if ($horaActualCarbon->isPast()) {
    //                         $ocupado = true;
    //                     }
    //                 }
    
    //                 if (!$ocupado) {
    //                     $horasDisponibles[] = $horaInicioStr;
    //                 }
    
    //                 $horaActual->add(new DateInterval('PT' . $intervaloReserva . 'M'));
    //             }
    //         }
    //     }
    
    //     return response()->json([
    //         'horas_disponibles' => $horasDisponibles,
    //         'bloque' => $bloquesOcupados
    //     ]);
    // }

    
    // public function getHorasDisponibles(Request $request)
    // {
    //     // return response()->json([
    //     //     'horas_disponibles' => $request->input('duracion_servicios'),
    //     // ]);

    //     $agendaId = $request->input('agenda_id');
    //     $fecha = $request->input('fecha'); // formato 'Y-m-d'
    //     $duracionServicios = $request->input('duracion_servicios'); // duracion total de los servicios en minutos
    //     $intervaloReserva = $request->input('intervalo_reserva'); // intervalo en minutos, ej: 30

    //     // Obtener la agenda y sus intervalos
    //     $agenda = Agenda::findOrFail($agendaId);
    //     $intervalos = $agenda->intervalos;

    //     // Obtener las reservas existentes para esa fecha
    //     $reservasExistentes = Reserva::where('agenda_id', $agendaId)
    //         ->where('fecha', $fecha)
    //         ->get();

    //     // Crear una lista de bloques de tiempo ocupados por reservas
    //     $bloquesOcupados = [];
    //     foreach ($reservasExistentes as $reserva) {
    //         $horaInicioReserva = new DateTime($reserva->hora);
    //         $horaFinReserva = (clone $horaInicioReserva)->add(new DateInterval('PT' . $reserva->duracion . 'M'))->format('H:i');
    //         $bloquesOcupados[] = [
    //             'inicio' => $horaInicioReserva->format('H:i'),
    //             'fin' => $horaFinReserva,
    //         ];
    //     }

    //     // return $reservasExistentes;

    //     // Crear objetos DateTime para la fecha de la reserva
    //     $fechaCarbon = Carbon::createFromFormat('Y-m-d', $fecha);
    //     $diaSemanaReserva = $this->quitarTilde($fechaCarbon->locale('es')->isoFormat('dddd'));

    //     $horasDisponibles = [];

    //     foreach ($intervalos as $intervalo) {
    //         $diasSemanaArray = json_decode($intervalo->dias_semanas);

    //         if (in_array($diaSemanaReserva, $diasSemanaArray)) {
    //             $horaInicioIntervalo = new DateTime($intervalo->hora_inicio);
    //             $horaFinIntervalo = new DateTime($intervalo->hora_fin);

    //             $horaActual = $horaInicioIntervalo;

    //             while ($horaActual < $horaFinIntervalo) {
    //                 $horaFinActual = (clone $horaActual)->add(new DateInterval('PT' . $duracionServicios . 'M'));

    //                 if ($horaFinActual > $horaFinIntervalo) {
    //                     break;
    //                 }

    //                 $horaInicioStr = $horaActual->format('H:i');
    //                 $horaFinStr = $horaFinActual->format('H:i');

    //                 $ocupado = false;
    //                 foreach ($bloquesOcupados as $bloque) {
    //                     if (!($horaFinStr <= $bloque['inicio'] || $horaInicioStr >= $bloque['fin'])) {
    //                         $ocupado = true;
    //                         break;
    //                     }
    //                 }

    //                 if (!$ocupado) {
    //                     $horasDisponibles[] = $horaInicioStr;
    //                 }

    //                 $horaActual->add(new DateInterval('PT' . $intervaloReserva . 'M'));
    //             }
    //         }
    //     }

    //     return response()->json([
    //         'horas_disponibles' => $horasDisponibles,
    //         'bloque' => $bloquesOcupados
    //     ]);
    // }

    private function quitarTilde($cadena)
    {
        $no_permitidas = array("á", "é", "í", "ó", "ú", "Á", "É", "Í", "Ó", "Ú");
        $permitidas = array("a", "e", "i", "o", "u", "A", "E", "I", "O", "U");
        $texto = str_replace($no_permitidas, $permitidas, $cadena);
        return $texto;
    }

    // Añadir método destroy al controlador IntervaloController

public function destroy($id)
{
    try {
        $intervalo = Intervalo::findOrFail($id);
        $intervalo->delete();

        return response()->json(['success' => true, 'message' => 'Intervalo eliminado correctamente.']);
    } catch (\Exception $e) {
        return response()->json(['success' => false, 'message' => 'Error al eliminar intervalo.', 'error' => $e->getMessage()], 500);
    }
}

}
