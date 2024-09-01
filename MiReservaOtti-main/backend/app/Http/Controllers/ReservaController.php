<?php

namespace App\Http\Controllers;

use App\Models\Reserva;
use App\Models\Agenda;
use App\Models\Cliente;
use App\Models\Intervalo;
use App\Models\ReservasUsuarioNoRegistrado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use DateTime;
use DateInterval;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class ReservaController extends Controller
{

    public function misReservas()
    {
        try {
            $clienteId = Auth::id(); // Obtiene el ID del cliente autenticado
            $reservas = Reserva::where('cliente_id', $clienteId)->get();

            return response()->json([
                'success' => true,
                'data' => $reservas
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener reservas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Método para actualizar una reserva de un usuario registrado
    public function updateReservaConCliente(Request $request, $id)
    {
        $reserva = Reserva::findOrFail($id);

        $reserva->update([
            'cliente_id' => $request->input('cliente_id'),
            'agenda_id' => $request->input('agenda_id'),
            'fecha' => $request->input('fecha'),
            'hora' => $request->input('hora'),
            'duracion' => $request->input('duracion'),
            'precio' => $request->input('precio'),
            'estado' => $request->input('estado'),
            'observaciones' => $request->input('observaciones'),
            'servicios' => $request->input('servicios'),
        ]);

        return response()->json(['message' => 'Reserva actualizada correctamente', 'data' => $reserva], 200);
    }

    public function updateReservaSinCliente(Request $request, $id)
    {
        $reserva = ReservasUsuarioNoRegistrado::findOrFail($id);

        $reserva->update([
            'nombre_cliente' => $request->input('nombre_cliente'),
            'email_cliente' => $request->input('email_cliente'),
            'telefono_cliente' => $request->input('telefono_cliente'),
            'agenda_id' => $request->input('agenda_id'),
            'fecha' => $request->input('fecha'),
            'hora' => $request->input('hora'),
            'duracion' => $request->input('duracion'),
            'precio' => $request->input('precio'),
            'estado' => $request->input('estado'),
            'observaciones' => $request->input('observaciones'),
            'servicios' => $request->input('servicios'),
        ]);

        return response()->json(['message' => 'Reserva actualizada correctamente', 'data' => $reserva], 200);
    }


    public function obtenerReservasSinUsuarioPorAgenda($agenda_id)
    {
        // Obtener todas las reservas para la empresa con el ID proporcionado
        $reservas = Reserva::whereHas('agenda', function ($query) use ($agenda_id) {
            $query->where('empresa_id', $agenda_id);
        })->get();

        return response()->json([
            'success' => true,
            'data' => $reservas
        ]);
    }

    public function obtenerReservasPorEmpresa($empresa_id)
    {
        // Obtener todas las reservas para la empresa con el ID proporcionado
        $reservas = Reserva::whereHas('agenda', function ($query) use ($empresa_id) {
            $query->where('empresa_id', $empresa_id);
        })->with('cliente')->get();

        return response()->json([
            'success' => true,
            'data' => $reservas
        ]);
    }

    public function obtenerReservasUsuarioNoRegistradoPorEmpresa($empresa_id)
    {
        // Obtener todas las reservas de usuarios no registrados para la empresa con el ID proporcionado
        $reservasNoRegistradas = ReservasUsuarioNoRegistrado::whereHas('agenda', function ($query) use ($empresa_id) {
            $query->where('empresa_id', $empresa_id);
        })->get();

        return response()->json([
            'success' => true,
            'data' => $reservasNoRegistradas
        ]);
    }

    public function obtenerReservasPorEmpresa2($empresa_id)
    {
        // Obtener todas las reservas para la empresa con el ID proporcionado
        $reservas = ReservasUsuarioNoRegistrado::whereHas('agenda', function ($query) use ($empresa_id) {
            $query->where('empresa_id', $empresa_id);
        });

        return response()->json([
            'success' => true,
            'data' => $reservas
        ]);
    }

    public function index()
    {
        return Reserva::with(['cliente', 'agenda', 'servicio'])->get();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cliente_id' => 'required|exists:clientes,id',
            'agenda_id' => 'required|exists:agendas,id',
            'fecha' => 'required|date',
            'hora' => 'required|date_format:H:i',
            'duracion' => 'required|integer|min:1',
            'precio' => 'required|numeric|min:0',
            'estado' => 'required|in:reservado,cancelado,en espera',
            'observaciones' => 'nullable|string|max:1000',
            'servicios' => 'required|array',
            'servicios.*' => 'exists:servicios,id',
        ], [
            'cliente_id.required' => 'El campo cliente es obligatorio.',
            'cliente_id.exists' => 'El cliente seleccionado no existe.',
            'agenda_id.required' => 'El campo agenda es obligatorio.',
            'agenda_id.exists' => 'La agenda seleccionada no existe.',
            'fecha.required' => 'El campo fecha es obligatorio.',
            'fecha.date' => 'El campo fecha debe ser una fecha válida.',
            'hora.required' => 'El campo hora es obligatorio.',
            'hora.date_format' => 'El campo hora debe estar en el formato HH:MM.',
            'duracion.required' => 'El campo duración es obligatorio.',
            'duracion.integer' => 'El campo duración debe ser un número entero.',
            'duracion.min' => 'El campo duración debe ser al menos 1 minuto.',
            'precio.required' => 'El campo precio es obligatorio.',
            'precio.numeric' => 'El campo precio debe ser un número.',
            'precio.min' => 'El campo precio debe ser un valor positivo.',
            'estado.required' => 'El campo estado es obligatorio.',
            'estado.in' => 'El campo estado debe ser uno de los siguientes valores: reservado, cancelado, en espera.',
            'observaciones.string' => 'El campo observaciones debe ser una cadena de texto.',
            'observaciones.max' => 'El campo observaciones no debe exceder los 1000 caracteres.',
            'servicios.required' => 'El campo servicios es obligatorio.',
            'servicios.array' => 'El campo servicios debe ser un arreglo.',
            'servicios.*.exists' => 'Uno o más servicios seleccionados no existen.',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // Obtener la agenda y sus intervalos
        $agenda = Agenda::findOrFail($request->agenda_id);
        $intervalos = $agenda->intervalos;

        // Crear objetos DateTime para la fecha y hora de la reserva
        $fechaReserva = new DateTime($request->fecha . ' ' . $request->hora);
        $fechaHoraActual = new DateTime();

        // me devuelve el día de la reserva (miércoles)
        $fecha = Carbon::createFromFormat('Y-m-d', $request->fecha);
        $diaSemanaReserva = $this->quitarTilde($fecha->locale('es')->isoFormat('dddd'));

        if ($fechaReserva < $fechaHoraActual) {
            return response()->json([
                'error' => 'La fecha y hora de la reserva deben ser iguales o posteriores a la fecha y hora actuales.'
            ], 422);
        }

        // Validar si ya existe una reserva en el mismo intervalo de tiempo
        $horaInicioReserva = new DateTime($request->hora);
        $horaFinReserva = (clone $horaInicioReserva)->add(new DateInterval('PT' . $request->duracion . 'M'))->format('H:i');

        $reservaExistente = Reserva::where('agenda_id', $request->agenda_id)
            ->where('fecha', $request->fecha)
            ->where(function ($query) use ($request, $horaFinReserva) {
                $query->where(function ($query) use ($request, $horaFinReserva) {
                    $query->where('hora', '<', $horaFinReserva)
                        ->whereRaw('ADDTIME(hora, SEC_TO_TIME(duracion * 60)) > ?', [$request->hora]);
                });
            })
            ->first();

        if ($reservaExistente) {
            return response()->json([
                'error' => 'Ya existe una reserva en el mismo intervalo de tiempo.'
            ], 422);
        }

        foreach ($intervalos as $intervalo) {
            $diasSemanaArray = json_decode($intervalo->dias_semanas);

            if (in_array($diaSemanaReserva, $diasSemanaArray)) {
                $horaInicioIntervalo = new DateTime($intervalo->hora_inicio);
                $horaFinIntervalo = new DateTime($intervalo->hora_fin);

                if ($request->hora >= $horaInicioIntervalo->format('H:i') && $request->hora <= $horaFinIntervalo->format('H:i')) {
                    $horaInicioIntervalo = $horaInicioIntervalo->format('H:i');
                    $horaFinIntervalo = $horaFinIntervalo->format('H:i');

                    if ($horaInicioIntervalo <= $request->hora) {
                        $duracionReserva = $request->duracion;
                        $horaFinMasDuracion = new DateTime($request->hora);
                        $horaFinMasDuracion->add(new DateInterval('PT' . $duracionReserva . 'M'));
                        $horaFinMasDuracion2 = $horaFinMasDuracion->format('H:i');

                        if ($horaFinMasDuracion2 <= $horaFinIntervalo) {
                            $reserva = Reserva::create([
                                'cliente_id' => $request->cliente_id,
                                'agenda_id' => $request->agenda_id,
                                'fecha' => $request->fecha,
                                'hora' => $request->hora,
                                'duracion' => $request->duracion,
                                'precio' => $request->precio,
                                'estado' => $request->estado,
                                'observaciones' => $request->observaciones,
                                'fecha_reserva' => (new DateTime())->format('Y-m-d H:i'),
                                'servicios' => json_encode($request->servicios), // Guardar los servicios como JSON
                            ]);

                            return response()->json([
                                'success' => true,
                                'message' => 'Reserva creada exitosamente',
                                'data' => $reserva
                            ]);
                        }
                    }
                }
            }
        }

        return response()->json([
            'error' => 'La fecha y hora seleccionadas no están dentro del rango de ningún intervalo de la agenda seleccionada.'
        ], 422);
    }

    public function storeUsuarioNoRegistrado(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre_cliente' => 'required|string|max:255',
            'email_cliente' => 'nullable|email|required_without:telefono_cliente',
            'telefono_cliente' => 'nullable|string|required_without:email_cliente',
            'agenda_id' => 'required|exists:agendas,id',
            'fecha' => 'required|date',
            'hora' => 'required|date_format:H:i',
            'duracion' => 'required|integer|min:1',
            'precio' => 'required|numeric|min:0',
            'estado' => 'required|in:reservado,cancelado,en espera',
            'observaciones' => 'nullable|string|max:1000',
            'servicios' => 'required|array',
            'servicios.*' => 'exists:servicios,id',
        ], [
            'nombre_cliente.required' => 'El campo nombre del cliente es obligatorio.',
            'email_cliente.email' => 'El campo email del cliente debe ser un email válido.',
            'email_cliente.required_without' => 'El campo email del cliente es obligatorio si el campo teléfono del cliente no está presente.',
            'telefono_cliente.string' => 'El campo teléfono del cliente debe ser una cadena de texto.',
            'telefono_cliente.required_without' => 'El campo teléfono del cliente es obligatorio si el campo email del cliente no está presente.',
            'agenda_id.required' => 'El campo agenda es obligatorio.',
            'agenda_id.exists' => 'La agenda seleccionada no existe.',
            'fecha.required' => 'El campo fecha es obligatorio.',
            'fecha.date' => 'El campo fecha debe ser una fecha válida.',
            'hora.required' => 'El campo hora es obligatorio.',
            'hora.date_format' => 'El campo hora debe estar en el formato HH:MM.',
            'duracion.required' => 'El campo duración es obligatorio.',
            'duracion.integer' => 'El campo duración debe ser un número entero.',
            'duracion.min' => 'El campo duración debe ser al menos 1 minuto.',
            'precio.required' => 'El campo precio es obligatorio.',
            'precio.numeric' => 'El campo precio debe ser un número.',
            'precio.min' => 'El campo precio debe ser un valor positivo.',
            'estado.required' => 'El campo estado es obligatorio.',
            'estado.in' => 'El campo estado debe ser uno de los siguientes valores: reservado, cancelado, en espera.',
            'observaciones.string' => 'El campo observaciones debe ser una cadena de texto.',
            'observaciones.max' => 'El campo observaciones no debe exceder los 1000 caracteres.',
            'servicios.required' => 'El campo servicios es obligatorio.',
            'servicios.array' => 'El campo servicios debe ser un arreglo.',
            'servicios.*.exists' => 'Uno o más servicios seleccionados no existen.',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // Reutilizar la lógica del método store para crear la reserva
        return $this->crearReserva($request, false);
    }

    private function crearReserva(Request $request, $esRegistrado = true)
    {
        $agenda = Agenda::findOrFail($request->agenda_id);
        $intervalos = $agenda->intervalos;

        $fechaReserva = new DateTime($request->fecha . ' ' . $request->hora);
        $fechaHoraActual = new DateTime();

        $fecha = Carbon::createFromFormat('Y-m-d', $request->fecha);
        $diaSemanaReserva = $this->quitarTilde($fecha->locale('es')->isoFormat('dddd'));

        if ($fechaReserva < $fechaHoraActual) {
            return response()->json([
                'error' => 'La fecha y hora de la reserva deben ser iguales o posteriores a la fecha y hora actuales.'
            ], 422);
        }

        $horaInicioReserva = new DateTime($request->hora);
        $horaFinReserva = (clone $horaInicioReserva)->add(new DateInterval('PT' . $request->duracion . 'M'))->format('H:i');

        $reservaExistente = ($esRegistrado ? Reserva::class : ReservasUsuarioNoRegistrado::class)::where('agenda_id', $request->agenda_id)
            ->where('fecha', $request->fecha)
            ->where(function ($query) use ($request, $horaFinReserva) {
                $query->where('hora', '<', $horaFinReserva)
                    ->whereRaw('ADDTIME(hora, SEC_TO_TIME(duracion * 60)) > ?', [$request->hora]);
            })
            ->first();

        if ($reservaExistente) {
            return response()->json([
                'error' => 'Ya existe una reserva en el mismo intervalo de tiempo.'
            ], 422);
        }

        foreach ($intervalos as $intervalo) {
            $diasSemanaArray = json_decode($intervalo->dias_semanas);

            if (in_array($diaSemanaReserva, $diasSemanaArray)) {
                $horaInicioIntervalo = new DateTime($intervalo->hora_inicio);
                $horaFinIntervalo = new DateTime($intervalo->hora_fin);

                if ($request->hora >= $horaInicioIntervalo->format('H:i') && $request->hora <= $horaFinIntervalo->format('H:i')) {
                    $horaInicioIntervalo = $horaInicioIntervalo->format('H:i');
                    $horaFinIntervalo = $horaFinIntervalo->format('H:i');

                    if ($horaInicioIntervalo <= $request->hora) {
                        $duracionReserva = $request->duracion;
                        $horaFinMasDuracion = new DateTime($request->hora);
                        $horaFinMasDuracion->add(new DateInterval('PT' . $duracionReserva . 'M'));
                        $horaFinMasDuracion2 = $horaFinMasDuracion->format('H:i');

                        if ($horaFinMasDuracion2 <= $horaFinIntervalo) {
                            $reserva = ($esRegistrado ? Reserva::class : ReservasUsuarioNoRegistrado::class)::create([
                                'agenda_id' => $request->agenda_id,
                                'nombre_cliente' => $request->nombre_cliente ?? null,
                                'email_cliente' => $request->email_cliente ?? null,
                                'telefono_cliente' => $request->telefono_cliente ?? null,
                                'fecha' => $request->fecha,
                                'hora' => $request->hora,
                                'duracion' => $request->duracion,
                                'precio' => $request->precio,
                                'estado' => $request->estado,
                                'observaciones' => $request->observaciones,
                                'fecha_reserva' => (new DateTime())->format('Y-m-d H:i'),
                                'servicios' => json_encode($request->servicios),
                            ]);

                            return response()->json([
                                'success' => true,
                                'message' => 'Reserva creada exitosamente',
                                'data' => $reserva
                            ]);
                        }
                    }
                }
            }
        }

        return response()->json([
            'error' => 'La fecha y hora seleccionadas no están dentro del rango de ningún intervalo de la agenda seleccionada.'
        ], 422);
    }
    public function storeUsuarioNoRegistradoPocosDatos(Request $request)
        {
    
    
            $validator = Validator::make($request->all(), [
                'nombre_cliente' => 'required|string|max:255',
                'email_cliente' => 'nullable|email',
                'telefono_cliente' => 'nullable|string',
                'agenda_id' => 'required|exists:agendas,id',
                'fecha' => 'required|date',
                'hora' => 'required|date_format:H:i',
                'duracion' => 'required|integer|min:1',
                'precio' => 'required|numeric|min:0',
                'estado' => 'required|in:reservado,cancelado,en espera',
                'observaciones' => 'nullable|string|max:1000',
                'servicios' => 'required|array',
                'servicios.*' => 'exists:servicios,id',
            ], [
                'nombre_cliente.required' => 'El campo nombre del cliente es obligatorio.',
                // 'email_cliente.email' => 'El campo email debe ser una dirección de correo válida.',
                // 'email_cliente.required_without' => 'El campo email es obligatorio cuando el teléfono no está presente.',
                // 'telefono_cliente.required_without' => 'El campo teléfono es obligatorio cuando el email no está presente.',
                'agenda_id.required' => 'El campo agenda es obligatorio.',
                'agenda_id.exists' => 'La agenda seleccionada no existe.',
                'fecha.required' => 'El campo fecha es obligatorio.',
                'fecha.date' => 'El campo fecha debe ser una fecha válida.',
                'hora.required' => 'El campo hora es obligatorio.',
                'hora.date_format' => 'El campo hora debe estar en el formato HH:MM.',
                'duracion.required' => 'El campo duración es obligatorio.',
                'duracion.integer' => 'El campo duración debe ser un número entero.',
                'duracion.min' => 'El campo duración debe ser al menos 1 minuto.',
                'precio.required' => 'El campo precio es obligatorio.',
                'precio.numeric' => 'El campo precio debe ser un número.',
                'precio.min' => 'El campo precio debe ser un valor positivo.',
                'estado.required' => 'El campo estado es obligatorio.',
                'estado.in' => 'El campo estado debe ser uno de los siguientes valores: reservado, cancelado, en espera.',
                'observaciones.string' => 'El campo observaciones debe ser una cadena de texto.',
                'observaciones.max' => 'El campo observaciones no debe exceder los 1000 caracteres.',
                'servicios.required' => 'El campo servicios es obligatorio.',
                'servicios.array' => 'El campo servicios debe ser un arreglo.',
                'servicios.*.exists' => 'Uno o más servicios seleccionados no existen.',
            ]);
    
            if ($validator->fails()) {
                return response()->json($validator->errors(), 400);
            }
    
            // Obtener la agenda y sus intervalos
            $agenda = Agenda::findOrFail($request->agenda_id);
            $intervalos = $agenda->intervalos;
    
            // Crear objetos DateTime para la fecha y hora de la reserva
            $fechaReserva = new DateTime($request->fecha . ' ' . $request->hora);
            $fechaHoraActual = new DateTime();
    
    
            // me devuelve el día de la reserva (miércoles)
            $fecha = Carbon::createFromFormat('Y-m-d', $request->fecha);
            $diaSemanaReserva = $this->quitarTilde($fecha->locale('es')->isoFormat('dddd'));
    
            if ($fechaReserva < $fechaHoraActual) {
                return response()->json([
                    'error' => 'La fecha y hora de la reserva deben ser iguales o posteriores a la fecha y hora actuales.'
                ], 422);
            }
    
    
    
            // Validar si ya existe una reserva en el mismo intervalo de tiempo
            $horaInicioReserva = new DateTime($request->hora);
            $horaFinReserva = (clone $horaInicioReserva)->add(new DateInterval('PT' . $request->duracion . 'M'))->format('H:i');
    
            $reservaExistente = Reserva::where('agenda_id', $request->agenda_id)
                ->where('fecha', $request->fecha)
                ->where(function ($query) use ($request, $horaFinReserva) {
                    $query->where(function ($query) use ($request, $horaFinReserva) {
                        $query->where('hora', '<', $horaFinReserva)
                            ->whereRaw('ADDTIME(hora, SEC_TO_TIME(duracion * 60)) > ?', [$request->hora]);
                    });
                })
                ->first();
    
    
            if ($reservaExistente) {
                return response()->json([
                    'error' => 'Ya existe una reserva en el mismo intervalo de tiempo.'
                ], 422);
            }
    
            $reservaExistente = ReservasUsuarioNoRegistrado::where('agenda_id', $request->agenda_id)
                ->where('fecha', $request->fecha)
                ->where(function ($query) use ($request, $horaFinReserva) {
                    $query->where(function ($query) use ($request, $horaFinReserva) {
                        $query->where('hora', '<', $horaFinReserva)
                            ->whereRaw('ADDTIME(hora, SEC_TO_TIME(duracion * 60)) > ?', [$request->hora]);
                    });
                })
                ->first();
    
            if ($reservaExistente) {
                return response()->json([
                    'error' => 'Ya existe una reserva en el mismo intervalo de tiempo.'
                ], 422);
            }
    
    
    
            $reserva = ReservasUsuarioNoRegistrado::create([
                'agenda_id' => $request->agenda_id,
                'nombre_cliente' => $request->nombre_cliente,
                'email_cliente' => $request->email_cliente,
                'telefono_cliente' => $request->telefono_cliente,
                'fecha' => $request->fecha,
                'hora' => $request->hora,
                'duracion' => $request->duracion,
                'precio' => $request->precio,
                'estado' => $request->estado,
                'observaciones' => $request->observaciones,
                'fecha_reserva' => (new DateTime())->format('Y-m-d H:i'),
                'servicios' => json_encode($request->servicios), // Guardar los servicios como JSON
            ]);
    
            return response()->json([
                'success' => true,
                'message' => 'Reserva creada exitosamente',
                'data' => $reserva
            ]);
        }
    
    
    
        function quitarTilde($cadena)
        {
            $originales = ['á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú', 'ñ', 'Ñ'];
            $sustitutos = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U', 'n', 'N'];
            return str_replace($originales, $sustitutos, $cadena);
        }
    

    public function show($id)
    {
        $reserva = Reserva::with(['cliente', 'agenda', 'servicio'])->findOrFail($id);
        return response()->json($reserva);
    }

    public function update(Request $request, $id)
    {
        $reserva = Reserva::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'cliente_id' => 'required|exists:clientes,id',
            'agenda_id' => 'required|exists:agendas,id',
            'fecha' => 'required|date',
            'hora' => 'required|date_format:H:i',
            'duracion' => 'required|integer|min:1',
            'precio' => 'required|numeric|min:0',
            'estado' => 'required|in:reservado,cancelado,en espera',
            'observaciones' => 'nullable|string|max:1000',
            'servicios' => 'required|array',
            'servicios.*' => 'exists:servicios,id',
        ], [
            'cliente_id.required' => 'El campo cliente es obligatorio.',
            'cliente_id.exists' => 'El cliente seleccionado no existe.',
            'agenda_id.required' => 'El campo agenda es obligatorio.',
            'agenda_id.exists' => 'La agenda seleccionada no existe.',
            'fecha.required' => 'El campo fecha es obligatorio.',
            'fecha.date' => 'El campo fecha debe ser una fecha válida.',
            'hora.required' => 'El campo hora es obligatorio.',
            'hora.date_format' => 'El campo hora debe estar en el formato HH:MM.',
            'duracion.required' => 'El campo duración es obligatorio.',
            'duracion.integer' => 'El campo duración debe ser un número entero.',
            'duracion.min' => 'El campo duración debe ser al menos 1 minuto.',
            'precio.required' => 'El campo precio es obligatorio.',
            'precio.numeric' => 'El campo precio debe ser un número.',
            'precio.min' => 'El campo precio debe ser un valor positivo.',
            'estado.required' => 'El campo estado es obligatorio.',
            'estado.in' => 'El campo estado debe ser uno de los siguientes valores: reservado, cancelado, en espera.',
            'observaciones.string' => 'El campo observaciones debe ser una cadena de texto.',
            'observaciones.max' => 'El campo observaciones no debe exceder los 1000 caracteres.',
            'servicios.required' => 'El campo servicios es obligatorio.',
            'servicios.array' => 'El campo servicios debe ser un arreglo.',
            'servicios.*.exists' => 'Uno o más servicios seleccionados no existen.',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $reserva->cliente_id = $request->input('cliente_id');
        $reserva->agenda_id = $request->input('agenda_id');
        $reserva->fecha = $request->input('fecha');
        $reserva->hora = $request->input('hora');
        $reserva->duracion = $request->input('duracion');
        $reserva->precio = $request->input('precio');
        $reserva->estado = $request->input('estado');
        $reserva->observaciones = $request->input('observaciones');
        $reserva->servicios = json_encode($request->input('servicios')); // Guardar los servicios como JSON

        $reserva->save();

        return response()->json([
            'success' => true,
            'message' => 'Reserva actualizada exitosamente',
            'data' => $reserva
        ]);
    }

    public function destroy($id)
    {
        $reserva = Reserva::findOrFail($id);
        $reserva->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reserva eliminada exitosamente'
        ]);
    }

     // Obtener reservas por ID de usuario
     public function getReservasByCliente(Request $request)
     {
         // Validar que el user_id se pasa como parámetro de la consulta
         $userId = $request->query('cliente_id');
 
         if (!$userId) {
             return response()->json(['message' => 'User ID es requerido'], 400);
         }
 
         // Obtener las reservas del usuario
         $reservas = Reserva::where('cliente_id', $userId)->get();
 
         return response()->json(['data' => $reservas]);
     }
}






// class ReservaController extends Controller
// {

//     public function obtenerReservasSinUsuarioPorAgenda($agenda_id)
//     {
//          // Obtener todas las reservas para la empresa con el ID proporcionado
//          $reservas = Reserva::whereHas('agenda', function ($query) use ($agenda_id) {
//             $query->where('empresa_id', $agenda_id);
//         })->get();

//         return response()->json([
//             'success' => true,
//             'data' => $reservas
//         ]);
//     }

//     public function obtenerReservasPorEmpresa($empresa_id)
//     {
//         // Obtener todas las reservas para la empresa con el ID proporcionado
//         $reservas = Reserva::whereHas('agenda', function ($query) use ($empresa_id) {
//             $query->where('empresa_id', $empresa_id);
//         })->with('cliente')->get();

//         return response()->json([
//             'success' => true,
//             'data' => $reservas
//         ]);
//     }

//     //Empresa::where('url', $url)->firstOrFail();

//     public function obtenerReservasUsuarioNoRegistradoPorEmpresa($empresa_id)
// {
//     // Obtener todas las reservas de usuarios no registrados para la empresa con el ID proporcionado
//     $reservasNoRegistradas = ReservasUsuarioNoRegistrado::whereHas('agenda', function ($query) use ($empresa_id) {
//         $query->where('empresa_id', $empresa_id);
//     })->get();

//     return response()->json([
//         'success' => true,
//         'data' => $reservasNoRegistradas
//     ]);
// }

//     public function obtenerReservasPorEmpresa2($empresa_id)
//     {
        
//         // Obtener todas las reservas para la empresa con el ID proporcionado
//         $reservas = ReservasUsuarioNoRegistrado::whereHas('agenda', function ($query) use ($empresa_id) {
//             $query->where('empresa_id', $empresa_id);
//         });

//         return response()->json([
//             'success' => true,
//             'data' => $reservas
//         ]);
//     }
    

//     public function index()
//     {
//         return Reserva::with(['cliente', 'agenda', 'servicio'])->get();
//     }

//     public function store(Request $request)
//     {
//         $validator = Validator::make($request->all(), [
//             'cliente_id' => 'required|exists:clientes,id',
//             'agenda_id' => 'required|exists:agendas,id',
//             'fecha' => 'required|date',
//             'hora' => 'required|date_format:H:i',
//             'duracion' => 'required|integer|min:1',
//             'precio' => 'required|numeric|min:0',
//             'estado' => 'required|in:reservado,cancelado,en espera',
//             'observaciones' => 'nullable|string|max:1000',
//             'servicios' => 'required|array',
//             'servicios.*' => 'exists:servicios,id',
//         ], [
//             'cliente_id.required' => 'El campo cliente es obligatorio.',
//             'cliente_id.exists' => 'El cliente seleccionado no existe.',
//             'agenda_id.required' => 'El campo agenda es obligatorio.',
//             'agenda_id.exists' => 'La agenda seleccionada no existe.',
//             'fecha.required' => 'El campo fecha es obligatorio.',
//             'fecha.date' => 'El campo fecha debe ser una fecha válida.',
//             'hora.required' => 'El campo hora es obligatorio.',
//             'hora.date_format' => 'El campo hora debe estar en el formato HH:MM.',
//             'duracion.required' => 'El campo duración es obligatorio.',
//             'duracion.integer' => 'El campo duración debe ser un número entero.',
//             'duracion.min' => 'El campo duración debe ser al menos 1 minuto.',
//             'precio.required' => 'El campo precio es obligatorio.',
//             'precio.numeric' => 'El campo precio debe ser un número.',
//             'precio.min' => 'El campo precio debe ser un valor positivo.',
//             'estado.required' => 'El campo estado es obligatorio.',
//             'estado.in' => 'El campo estado debe ser uno de los siguientes valores: reservado, cancelado, en espera.',
//             'observaciones.string' => 'El campo observaciones debe ser una cadena de texto.',
//             'observaciones.max' => 'El campo observaciones no debe exceder los 1000 caracteres.',
//             'servicios.required' => 'El campo servicios es obligatorio.',
//             'servicios.array' => 'El campo servicios debe ser un arreglo.',
//             'servicios.*.exists' => 'Uno o más servicios seleccionados no existen.',
//         ]);

//         if ($validator->fails()) {
//             return response()->json($validator->errors(), 400);
//         }

//         // Obtener la agenda y sus intervalos
//         $agenda = Agenda::findOrFail($request->agenda_id);
//         $intervalos = $agenda->intervalos;

//         // Crear objetos DateTime para la fecha y hora de la reserva
//         $fechaReserva = new DateTime($request->fecha . ' ' . $request->hora);
//         $fechaHoraActual = new DateTime();

//         // me devulve el dia de la reserva (miercoles)
//         $fecha = Carbon::createFromFormat('Y-m-d', $request->fecha);
//         $diaSemanaReserva = $this->quitarTilde($fecha->locale('es')->isoFormat('dddd'));

//         if ($fechaReserva < $fechaHoraActual) {
//             return response()->json([
//                 'error' => 'La fecha y hora de la reserva deben ser iguales o posteriores a la fecha y hora actuales.'
//             ], 422);
//         }

//         // Validar si ya existe una reserva en el mismo intervalo de tiempo
//         $horaInicioReserva = new DateTime($request->hora);
//         $horaFinReserva = (clone $horaInicioReserva)->add(new DateInterval('PT' . $request->duracion . 'M'))->format('H:i');
      
//         $reservaExistente = Reserva::where('agenda_id', $request->agenda_id)
//             ->where('fecha', $request->fecha)
//             ->where(function ($query) use ($request, $horaFinReserva) {
//                 $query->where(function ($query) use ($request, $horaFinReserva) {
//                     $query->where('hora', '<', $horaFinReserva)
//                         ->whereRaw('ADDTIME(hora, SEC_TO_TIME(duracion * 60)) > ?', [$request->hora]);
//                 });
//             })
//             ->first();

//         if ($reservaExistente) {
//             return response()->json([
//                 'error' => 'Ya existe una reserva en el mismo intervalo de tiempo.'
//             ], 422);
//         }

//         foreach ($intervalos as $intervalo) {
//             $diasSemanaArray = json_decode($intervalo->dias_semanas);

//             if (in_array($diaSemanaReserva, $diasSemanaArray)) {
//                 $horaInicioIntervalo = new DateTime($intervalo->hora_inicio);
//                 $horaFinIntervalo = new DateTime($intervalo->hora_fin);

//                 if ($request->hora >= $horaInicioIntervalo->format('H:i') && $request->hora <= $horaFinIntervalo->format('H:i')) {
//                     $horaInicioIntervalo = $horaInicioIntervalo->format('H:i');
//                     $horaFinIntervalo = $horaFinIntervalo->format('H:i');

//                     if ($horaInicioIntervalo <= $request->hora) {
//                         $duracionReserva = $request->duracion;
//                         $horaFinMasDuracion = new DateTime($request->hora);
//                         $horaFinMasDuracion->add(new DateInterval('PT' . $duracionReserva . 'M'));
//                         $horaFinMasDuracion2 = $horaFinMasDuracion->format('H:i');

//                         if ($horaFinMasDuracion2 <= $horaFinIntervalo) {
//                             $reserva = Reserva::create([
//                                 'cliente_id' => $request->cliente_id,
//                                 'agenda_id' => $request->agenda_id,
//                                 'fecha' => $request->fecha,
//                                 'hora' => $request->hora,
//                                 'duracion' => $request->duracion,
//                                 'precio' => $request->precio,
//                                 'estado' => $request->estado,
//                                 'observaciones' => $request->observaciones,
//                                 'fecha_reserva' => (new DateTime())->format('Y-m-d H:i'),
//                                 'servicios' => json_encode($request->servicios), // Guardar los servicios como JSON
//                             ]);

//                             return response()->json([
//                                 'success' => true,
//                                 'message' => 'Reserva creada exitosamente',
//                                 'data' => $reserva
//                             ]);
//                         }
//                     }
//                 }
//             }
//         }

//         return response()->json([
//             'error' => 'La fecha y hora seleccionadas no están dentro del rango de ningún intervalo de la agenda seleccionada.'
//         ], 422);
//     }

//     public function storeUsuarioNoRegistrado(Request $request)
//     {
//         $validator = Validator::make($request->all(), [
//             'nombre_cliente' => 'required|string|max:255',
//             'email_cliente' => 'nullable|email|required_without:telefono_cliente',
//             'telefono_cliente' => 'nullable|string|required_without:email_cliente',
//             'agenda_id' => 'required|exists:agendas,id',
//             'fecha' => 'required|date',
//             'hora' => 'required|date_format:H:i',
//             'duracion' => 'required|integer|min:1',
//             'precio' => 'required|numeric|min:0',
//             'estado' => 'required|in:reservado,cancelado,en espera',
//             'observaciones' => 'nullable|string|max:1000',
//             'servicios' => 'required|array',
//             'servicios.*' => 'exists:servicios,id',
//         ], [
//             'nombre_cliente.required' => 'El campo nombre del cliente es obligatorio.',
//             'email_cliente.email' => 'El campo email debe ser una dirección de correo válida.',
//             'email_cliente.required_without' => 'El campo email es obligatorio cuando el teléfono no está presente.',
//             'telefono_cliente.required_without' => 'El campo teléfono es obligatorio cuando el email no está presente.',
//             'agenda_id.required' => 'El campo agenda es obligatorio.',
//             'agenda_id.exists' => 'La agenda seleccionada no existe.',
//             'fecha.required' => 'El campo fecha es obligatorio.',
//             'fecha.date' => 'El campo fecha debe ser una fecha válida.',
//             'hora.required' => 'El campo hora es obligatorio.',
//             'hora.date_format' => 'El campo hora debe estar en el formato HH:MM.',
//             'duracion.required' => 'El campo duración es obligatorio.',
//             'duracion.integer' => 'El campo duración debe ser un número entero.',
//             'duracion.min' => 'El campo duración debe ser al menos 1 minuto.',
//             'precio.required' => 'El campo precio es obligatorio.',
//             'precio.numeric' => 'El campo precio debe ser un número.',
//             'precio.min' => 'El campo precio debe ser un valor positivo.',
//             'estado.required' => 'El campo estado es obligatorio.',
//             'estado.in' => 'El campo estado debe ser uno de los siguientes valores: reservado, cancelado, en espera.',
//             'observaciones.string' => 'El campo observaciones debe ser una cadena de texto.',
//             'observaciones.max' => 'El campo observaciones no debe exceder los 1000 caracteres.',
//             'servicios.required' => 'El campo servicios es obligatorio.',
//             'servicios.array' => 'El campo servicios debe ser un arreglo.',
//             'servicios.*.exists' => 'Uno o más servicios seleccionados no existen.',
//         ]);

//         if ($validator->fails()) {
//             return response()->json($validator->errors(), 400);
//         }



//         // Obtener la agenda y sus intervalos
//         $agenda = Agenda::findOrFail($request->agenda_id);
//         $intervalos = $agenda->intervalos;

//         // Crear objetos DateTime para la fecha y hora de la reserva
//         $fechaReserva = new DateTime($request->fecha . ' ' . $request->hora);
//         $fechaHoraActual = new DateTime();


//         // me devuelve el día de la reserva (miércoles)
//         $fecha = Carbon::createFromFormat('Y-m-d', $request->fecha);
//         $diaSemanaReserva = $this->quitarTilde($fecha->locale('es')->isoFormat('dddd'));

//         if ($fechaReserva < $fechaHoraActual) {
//             return response()->json([
//                 'error' => 'La fecha y hora de la reserva deben ser iguales o posteriores a la fecha y hora actuales.'
//             ], 422);
//         }



//         // Validar si ya existe una reserva en el mismo intervalo de tiempo
//         $horaInicioReserva = new DateTime($request->hora);
//         $horaFinReserva = (clone $horaInicioReserva)->add(new DateInterval('PT' . $request->duracion . 'M'))->format('H:i');

//         $reservaExistente = Reserva::where('agenda_id', $request->agenda_id)
//             ->where('fecha', $request->fecha)
//             ->where(function ($query) use ($request, $horaFinReserva) {
//                 $query->where(function ($query) use ($request, $horaFinReserva) {
//                     $query->where('hora', '<', $horaFinReserva)
//                         ->whereRaw('ADDTIME(hora, SEC_TO_TIME(duracion * 60)) > ?', [$request->hora]);
//                 });
//             })
//             ->first();


//         if ($reservaExistente) {
//             return response()->json([
//                 'error' => 'Ya existe una reserva en el mismo intervalo de tiempo.'
//             ], 422);
//         }


//         foreach ($intervalos as $intervalo) {
//             // $diasSemanaArray = json_decode($intervalo->dias_semanas);

//             // if (in_array($diaSemanaReserva, $diasSemanaArray)) {
//             //     $horaInicioIntervalo = new DateTime($intervalo->hora_inicio);
//             //     $horaFinIntervalo = new DateTime($intervalo->hora_fin);

//             //     if ($request->hora >= $horaInicioIntervalo->format('H:i') && $request->hora <= $horaFinIntervalo->format('H:i')) {
//             //         $horaInicioIntervalo = $horaInicioIntervalo->format('H:i');
//             //         $horaFinIntervalo = $horaFinIntervalo->format('H:i');

//             //         if ($horaInicioIntervalo <= $request->hora) {
//             //             $duracionReserva = $request->duracion;
//             //             $horaFinMasDuracion = new DateTime($request->hora);
//             //             $horaFinMasDuracion->add(new DateInterval('PT' . $duracionReserva . 'M'));
//             //             $horaFinMasDuracion2 = $horaFinMasDuracion->format('H:i');


//             //             if ($horaFinMasDuracion2 <= $horaFinIntervalo) {


//                             $reserva = ReservasUsuarioNoRegistrado::create([
//                                 'agenda_id' => $request->agenda_id,
//                                 'nombre_cliente' => $request->nombre_cliente,
//                                 'email_cliente' => $request->email_cliente,
//                                 'telefono_cliente' => $request->telefono_cliente,
//                                 'fecha' => $request->fecha,
//                                 'hora' => $request->hora,
//                                 'duracion' => $request->duracion,
//                                 'precio' => $request->precio,
//                                 'estado' => $request->estado,
//                                 'observaciones' => $request->observaciones,
//                                 'fecha_reserva' => (new DateTime())->format('Y-m-d H:i'),
//                                 'servicios' => json_encode($request->servicios), // Guardar los servicios como JSON
//                             ]);

//                             return response()->json([
//                                 'success' => true,
//                                 'message' => 'Reserva creada exitosamente',
//                                 'data' => $reserva
//                             ]);
//             //             }
//             //         }
//             //     }
//             // }
//         }

//         return response()->json([
//             'error' => 'La fecha y hora seleccionadas no están dentro del rango de ningún intervalo de la agenda seleccionada.'
//         ], 422);
//     }

//         $reservaExistente = ReservasUsuarioNoRegistrado::where('agenda_id', $request->agenda_id)
//             ->where('fecha', $request->fecha)
//             ->where(function ($query) use ($request, $horaFinReserva) {
//                 $query->where(function ($query) use ($request, $horaFinReserva) {
//                     $query->where('hora', '<', $horaFinReserva)
//                         ->whereRaw('ADDTIME(hora, SEC_TO_TIME(duracion * 60)) > ?', [$request->hora]);
//                 });
//             })
//             ->first();



//         if ($reservaExistente) {
//             return response()->json([
//                 'error' => 'Ya existe una reserva en el mismo intervalo de tiempo.'
//             ], 422);
//         }



//         foreach ($intervalos as $intervalo) {
//             $diasSemanaArray = json_decode($intervalo->dias_semanas);

//             if (in_array($diaSemanaReserva, $diasSemanaArray)) {
//                 $horaInicioIntervalo = new DateTime($intervalo->hora_inicio);
//                 $horaFinIntervalo = new DateTime($intervalo->hora_fin);

//                 if ($request->hora >= $horaInicioIntervalo->format('H:i') && $request->hora <= $horaFinIntervalo->format('H:i')) {
//                     $horaInicioIntervalo = $horaInicioIntervalo->format('H:i');
//                     $horaFinIntervalo = $horaFinIntervalo->format('H:i');

//                     if ($horaInicioIntervalo <= $request->hora) {
//                         $duracionReserva = $request->duracion;
//                         $horaFinMasDuracion = new DateTime($request->hora);
//                         $horaFinMasDuracion->add(new DateInterval('PT' . $duracionReserva . 'M'));
//                         $horaFinMasDuracion2 = $horaFinMasDuracion->format('H:i');


//                         if ($horaFinMasDuracion2 <= $horaFinIntervalo) {


//                             $reserva = ReservasUsuarioNoRegistrado::create([
//                                 'agenda_id' => $request->agenda_id,
//                                 'nombre_cliente' => $request->nombre_cliente,
//                                 'email_cliente' => $request->email_cliente,
//                                 'telefono_cliente' => $request->telefono_cliente,
//                                 'fecha' => $request->fecha,
//                                 'hora' => $request->hora,
//                                 'duracion' => $request->duracion,
//                                 'precio' => $request->precio,
//                                 'estado' => $request->estado,
//                                 'observaciones' => $request->observaciones,
//                                 'fecha_reserva' => (new DateTime())->format('Y-m-d H:i'),
//                                 'servicios' => json_encode($request->servicios), // Guardar los servicios como JSON
//                             ]);

//                             return response()->json([
//                                 'success' => true,
//                                 'message' => 'Reserva creada exitosamente',
//                                 'data' => $reserva
//                             ]);
//                         }
//                     }
//                 }
//             }
//         }

//         return response()->json([
//             'error' => 'La fecha y hora seleccionadas no están dentro del rango de ningún intervalo de la agenda seleccionada.'
//         ], 422);
//     }


//     public function storeUsuarioNoRegistradoPocosDatos(Request $request)
//     {


//         $validator = Validator::make($request->all(), [
//             'nombre_cliente' => 'required|string|max:255',
//             'email_cliente' => 'nullable|email',
//             'telefono_cliente' => 'nullable|string',
//             'agenda_id' => 'required|exists:agendas,id',
//             'fecha' => 'required|date',
//             'hora' => 'required|date_format:H:i',
//             'duracion' => 'required|integer|min:1',
//             'precio' => 'required|numeric|min:0',
//             'estado' => 'required|in:reservado,cancelado,en espera',
//             'observaciones' => 'nullable|string|max:1000',
//             'servicios' => 'required|array',
//             'servicios.*' => 'exists:servicios,id',
//         ], [
//             'nombre_cliente.required' => 'El campo nombre del cliente es obligatorio.',
//             // 'email_cliente.email' => 'El campo email debe ser una dirección de correo válida.',
//             // 'email_cliente.required_without' => 'El campo email es obligatorio cuando el teléfono no está presente.',
//             // 'telefono_cliente.required_without' => 'El campo teléfono es obligatorio cuando el email no está presente.',
//             'agenda_id.required' => 'El campo agenda es obligatorio.',
//             'agenda_id.exists' => 'La agenda seleccionada no existe.',
//             'fecha.required' => 'El campo fecha es obligatorio.',
//             'fecha.date' => 'El campo fecha debe ser una fecha válida.',
//             'hora.required' => 'El campo hora es obligatorio.',
//             'hora.date_format' => 'El campo hora debe estar en el formato HH:MM.',
//             'duracion.required' => 'El campo duración es obligatorio.',
//             'duracion.integer' => 'El campo duración debe ser un número entero.',
//             'duracion.min' => 'El campo duración debe ser al menos 1 minuto.',
//             'precio.required' => 'El campo precio es obligatorio.',
//             'precio.numeric' => 'El campo precio debe ser un número.',
//             'precio.min' => 'El campo precio debe ser un valor positivo.',
//             'estado.required' => 'El campo estado es obligatorio.',
//             'estado.in' => 'El campo estado debe ser uno de los siguientes valores: reservado, cancelado, en espera.',
//             'observaciones.string' => 'El campo observaciones debe ser una cadena de texto.',
//             'observaciones.max' => 'El campo observaciones no debe exceder los 1000 caracteres.',
//             'servicios.required' => 'El campo servicios es obligatorio.',
//             'servicios.array' => 'El campo servicios debe ser un arreglo.',
//             'servicios.*.exists' => 'Uno o más servicios seleccionados no existen.',
//         ]);

//         if ($validator->fails()) {
//             return response()->json($validator->errors(), 400);
//         }

//         // Obtener la agenda y sus intervalos
//         $agenda = Agenda::findOrFail($request->agenda_id);
//         $intervalos = $agenda->intervalos;

//         // Crear objetos DateTime para la fecha y hora de la reserva
//         $fechaReserva = new DateTime($request->fecha . ' ' . $request->hora);
//         $fechaHoraActual = new DateTime();


//         // me devuelve el día de la reserva (miércoles)
//         $fecha = Carbon::createFromFormat('Y-m-d', $request->fecha);
//         $diaSemanaReserva = $this->quitarTilde($fecha->locale('es')->isoFormat('dddd'));

//         if ($fechaReserva < $fechaHoraActual) {
//             return response()->json([
//                 'error' => 'La fecha y hora de la reserva deben ser iguales o posteriores a la fecha y hora actuales.'
//             ], 422);
//         }



//         // Validar si ya existe una reserva en el mismo intervalo de tiempo
//         $horaInicioReserva = new DateTime($request->hora);
//         $horaFinReserva = (clone $horaInicioReserva)->add(new DateInterval('PT' . $request->duracion . 'M'))->format('H:i');

//         $reservaExistente = Reserva::where('agenda_id', $request->agenda_id)
//             ->where('fecha', $request->fecha)
//             ->where(function ($query) use ($request, $horaFinReserva) {
//                 $query->where(function ($query) use ($request, $horaFinReserva) {
//                     $query->where('hora', '<', $horaFinReserva)
//                         ->whereRaw('ADDTIME(hora, SEC_TO_TIME(duracion * 60)) > ?', [$request->hora]);
//                 });
//             })
//             ->first();


//         if ($reservaExistente) {
//             return response()->json([
//                 'error' => 'Ya existe una reserva en el mismo intervalo de tiempo.'
//             ], 422);
//         }

//         $reservaExistente = ReservasUsuarioNoRegistrado::where('agenda_id', $request->agenda_id)
//             ->where('fecha', $request->fecha)
//             ->where(function ($query) use ($request, $horaFinReserva) {
//                 $query->where(function ($query) use ($request, $horaFinReserva) {
//                     $query->where('hora', '<', $horaFinReserva)
//                         ->whereRaw('ADDTIME(hora, SEC_TO_TIME(duracion * 60)) > ?', [$request->hora]);
//                 });
//             })
//             ->first();

//         if ($reservaExistente) {
//             return response()->json([
//                 'error' => 'Ya existe una reserva en el mismo intervalo de tiempo.'
//             ], 422);
//         }



//         $reserva = ReservasUsuarioNoRegistrado::create([
//             'agenda_id' => $request->agenda_id,
//             'nombre_cliente' => $request->nombre_cliente,
//             'email_cliente' => $request->email_cliente,
//             'telefono_cliente' => $request->telefono_cliente,
//             'fecha' => $request->fecha,
//             'hora' => $request->hora,
//             'duracion' => $request->duracion,
//             'precio' => $request->precio,
//             'estado' => $request->estado,
//             'observaciones' => $request->observaciones,
//             'fecha_reserva' => (new DateTime())->format('Y-m-d H:i'),
//             'servicios' => json_encode($request->servicios), // Guardar los servicios como JSON
//         ]);

//         return response()->json([
//             'success' => true,
//             'message' => 'Reserva creada exitosamente',
//             'data' => $reserva
//         ]);
//     }



//     function quitarTilde($cadena)
//     {
//         $originales = ['á', 'é', 'í', 'ó', 'ú', 'Á', 'É', 'Í', 'Ó', 'Ú', 'ñ', 'Ñ'];
//         $sustitutos = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U', 'n', 'N'];
//         return str_replace($originales, $sustitutos, $cadena);
//     }


//     public function getReservasPorDia(Request $request)
//     {

//         // Validar la entrada
//         $request->validate([
//             'agenda_id' => 'required|exists:agendas,id',
//             'fecha' => 'required|date_format:Y-m-d',
//         ], [
//             'agenda_id.required' => 'El campo agenda_id es obligatorio.',
//             'agenda_id.exists' => 'La agenda seleccionada no existe.',
//             'fecha.required' => 'El campo fecha es obligatorio.',
//             'fecha.date_format' => 'El campo fecha debe estar en el formato YYYY-MM-DD.',
//         ]);

//         $reservas = Reserva::where('agenda_id', $request->agenda_id)
//             ->where('fecha', $request->fecha)
//             ->get();

//         return response()->json([
//             'success' => true,
//             'data' => $reservas
//         ]);
//     }


//     public function cancelarReserva($id)
//     {
//         $reserva = Reserva::findOrFail($id);

//         if ($reserva->estado === 'cancelado') {
//             return response()->json([
//                 'error' => 'La reserva ya está cancelada.'
//             ], 400);
//         }

//         $reserva->estado = 'cancelado';
//         $reserva->save();

//         return response()->json([
//             'success' => true,
//             'message' => 'Reserva cancelada exitosamente.',
//             'data' => $reserva
//         ]);
//     }

//     public function obtenerReservasPorCliente($cliente_id)
//     {
//         // Verifica si el cliente existe
//         $cliente = Cliente::findOrFail($cliente_id);

//         // Obtiene todas las reservas del cliente
//         $reservas = Reserva::where('cliente_id', $cliente_id)->get();

//         return response()->json([
//             'success' => true,
//             'data' => $reservas
//         ]);
//     }


//     function obtenerNumeroDiaSemanaDesdeNombre($nombreDia)
//     {
//         // Convertir el nombre del día a minúsculas para hacer coincidir con las claves del array
//         $nombreDia = mb_strtolower($nombreDia, 'UTF-8');

//         // Array asociativo que mapea los nombres de los días de la semana a sus números correspondientes
//         $diasSemana = [
//             'domingo' => 0,
//             'lunes' => 1,
//             'martes' => 2,
//             'miércoles' => 3,
//             'jueves' => 4,
//             'viernes' => 5,
//             'sábado' => 6,
//         ];

//         // Verificar si el nombre del día existe en el array y devolver su número correspondiente
//         if (array_key_exists($nombreDia, $diasSemana)) {
//             return $diasSemana[$nombreDia];
//         } else {
//             // En caso de que el nombre del día no esté en el array, puedes manejar el error o devolver un valor predeterminado
//             return -1; // Por ejemplo, devolver -1 si no se encuentra el día
//         }
//     }

//     public function show($id)
//     {
//         $reserva = Reserva::with(['cliente', 'agenda', 'servicio'])->findOrFail($id);

//         return response()->json($reserva);
//     }

//     public function update(Request $request, $id)
//     {
//         $request->validate([
//             'cliente_id' => 'required|exists:clientes,id',
//             'agenda_id' => 'required|exists:agendas,id',
//             'servicio_id' => 'required|exists:servicios,id',
//             'hora' => 'required',
//             'fecha' => 'required|date',
//             'estado' => 'required|in:pendiente,confirmada,cancelada',
//             'observaciones' => 'nullable|string',
//             'fecha_confirmacion' => 'nullable|date',
//             'fecha_cancelacion' => 'nullable|date',
//             'fecha_atencion' => 'nullable|date',
//             'fecha_no_atencion' => 'nullable|date',
//         ]);

//         $reserva = Reserva::findOrFail($id);
//         $reserva->update($request->all());

//         return response()->json($reserva, 200);
//     }

//     public function destroy($id)
//     {
//         $reserva = Reserva::findOrFail($id);
//         $reserva->delete();

//         return response()->json(null, 204);
//     }
    
//     public function destroyreservasUsuarioNoRegistrado($id)
//     {
//         $reserva = ReservasUsuarioNoRegistrado::findOrFail($id);
//         $reserva->delete();

//         return response()->json(null, 204);
//     }


// } -->
