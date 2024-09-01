<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Ciudad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CiudadController extends Controller
{
    // Mostrar todas las ciudades
    public function index()
    {
        $ciudades = Ciudad::with('departamento')->get();
        return response()->json($ciudades);
    }

    // Mostrar las ciudades de un departamento específico
    public function ciudadesPorDepartamento($departamento_id)
    {
        // return 1;
        $ciudades = Ciudad::where('departamento_id', $departamento_id)->get();
        return response()->json($ciudades);
    }

    // Crear una nueva ciudad
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'departamento_id' => 'required|exists:departamentos,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $ciudad = Ciudad::create($request->all());

        return response()->json($ciudad, 201);
    }

    // Mostrar una ciudad específica
    public function show($id)
    {
        $ciudad = Ciudad::with('departamento')->find($id);

        if (!$ciudad) {
            return response()->json(['error' => 'Ciudad no encontrada'], 404);
        }

        return response()->json($ciudad);
    }

    // Actualizar una ciudad
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'departamento_id' => 'required|exists:departamentos,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $ciudad = Ciudad::find($id);

        if (!$ciudad) {
            return response()->json(['error' => 'Ciudad no encontrada'], 404);
        }

        $ciudad->update($request->all());

        return response()->json($ciudad);
    }

    // Eliminar una ciudad
    public function destroy($id)
    {
        $ciudad = Ciudad::find($id);

        if (!$ciudad) {
            return response()->json(['error' => 'Ciudad no encontrada'], 404);
        }

        $ciudad->delete();

        return response()->json(['message' => 'Ciudad eliminada correctamente']);
    }
}
