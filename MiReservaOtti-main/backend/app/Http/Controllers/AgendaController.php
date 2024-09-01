<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Agenda;
use Illuminate\Support\Facades\Validator;

class AgendaController extends Controller
{
    public function index()
    {
        $agendas = Agenda::with('empresa')->get();
        return response()->json($agendas);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'estado' => 'required|in:abierta,cerrada',
        ], [
            'empresa_id.required' => 'El campo empresa_id es obligatorio.',
            'empresa_id.exists' => 'La empresa seleccionada no existe.',
            'estado.required' => 'El campo estado es obligatorio.',
            'estado.in' => 'El campo estado debe ser "abierta" o "cerrada".',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $agenda = Agenda::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Agenda creada exitosamente',
            'data' => $agenda
        ], 201);
    }

    public function show($id)
    {
        $agenda = Agenda::with('intervalos')->findOrFail($id);
        return response()->json($agenda);
    }

    public function update(Request $request, Agenda $agenda)
    {
        $data = $request->validate([
            'fecha' => 'required|date',
        ]);

        $agenda->update($data);
        return response()->json($agenda);
    }

    public function destroy(Agenda $agenda)
    {
        $agenda->delete();
        return response()->json(null, 204);
    }
}
