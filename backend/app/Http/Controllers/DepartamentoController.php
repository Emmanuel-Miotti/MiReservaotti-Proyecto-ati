<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Departamento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DepartamentoController extends Controller
{
    // Mostrar todos los departamentos
    public function index()
    {
        $departamentos = Departamento::all();
        return response()->json($departamentos);
    }

    // Crear un nuevo departamento
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:departamentos',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $departamento = Departamento::create($request->all());

        return response()->json($departamento, 201);
    }

    // Mostrar un departamento específico
    public function show($id)
    {
        $departamento = Departamento::find($id);

        if (!$departamento) {
            return response()->json(['error' => 'Departamento no encontrado'], 404);
        }

        return response()->json($departamento);
    }

    // Actualizar un departamento
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:departamentos,name,'.$id,
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $departamento = Departamento::find($id);

        if (!$departamento) {
            return response()->json(['error' => 'Departamento no encontrado'], 404);
        }

        $departamento->update($request->all());

        return response()->json($departamento);
    }

    // Eliminar un departamento
    public function destroy($id)
    {
        $departamento = Departamento::find($id);

        if (!$departamento) {
            return response()->json(['error' => 'Departamento no encontrado'], 404);
        }

        $departamento->delete();

        return response()->json(['message' => 'Departamento eliminado correctamente']);
    }
}
