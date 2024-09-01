<?php

namespace App\Http\Controllers;

use App\Models\Servicio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;


class ServicioController extends Controller
{

    public function destroy($id)
    {
        $Servicio = Servicio::findOrFail($id);
        $Servicio->delete();

        return response()->json([
            'success' => true,
            'message' => 'Servicio eliminada exitosamente'
        ]);
    }


    public function getServicesById($id)
    {

        $cliente = Servicio::find($id);

        if (!$cliente) {
            return response()->json(['error' => 'Servicio no encontrado'], 404);
        }

        return response()->json($cliente);


        // try {
        //     // Obtén todos los servicios que pertenecen a la empresa con el ID proporcionado
        //     $servicios = Servicio::where('empresa_id', $id)->get();

        //     return response()->json($servicios);
        // } catch (\Exception $e) {
        //     // Manejar errores si ocurre alguna excepción
        //     return response()->json(['error' => 'Error al obtener servicios: ' . $e->getMessage()], 500);
        // }
    }

    // ServicioController.php
    public function desactivar($id)
    {
        $servicio = Servicio::findOrFail($id);
        $servicio->estado = 'inactivo'; // O el valor que uses para indicar que está desactivado
        $servicio->save();

        // Devuelve la respuesta adecuada (por ejemplo, un JSON con el servicio actualizado)
        return response()->json($servicio, 200);
    }
    public function activar($id)
    {
        $servicio = Servicio::findOrFail($id);
        $servicio->estado = 'activo'; // O el valor que uses para indicar que está activo
        $servicio->save();

        // Devuelve la respuesta adecuada (por ejemplo, un JSON con el servicio actualizado)
        return response()->json($servicio, 200);
    }


    public function getServicesByEmpresa($id)
    {
        try {
            // Obtén todos los servicios que pertenecen a la empresa con el ID proporcionado
            $servicios = Servicio::where('empresa_id', $id)->get();

            return response()->json($servicios);
        } catch (\Exception $e) {
            // Manejar errores si ocurre alguna excepción
            return response()->json(['error' => 'Error al obtener servicios: ' . $e->getMessage()], 500);
        }
    }


    public function index()
    {
        $empresaId = Auth::user()->empresa_id;
        return Servicio::where('empresa_id', $empresaId)->with('empresa')->get();
    }

    public function store(Request $request)
    {
        // Validar los datos de la solicitud con mensajes personalizados
        $validator = Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'duracion' => 'required|integer|min:1',
            'estado' => 'required|in:activo,inactivo',
            'precio' => 'required|numeric|min:0',
        ], [
            'empresa_id.required' => 'El campo empresa es obligatorio.',
            'empresa_id.exists' => 'La empresa seleccionada no es válida.',
            'nombre.required' => 'El campo nombre es obligatorio.',
            'nombre.string' => 'El nombre debe ser una cadena de caracteres.',
            'nombre.max' => 'El nombre no puede tener más de 255 caracteres.',
            'descripcion.required' => 'El campo descripción es obligatorio.',
            'descripcion.string' => 'La descripción debe ser una cadena de caracteres.',
            'duracion.required' => 'El campo duración es obligatorio.',
            'duracion.integer' => 'La duración debe ser un número entero.',
            'duracion.min' => 'La duración debe ser al menos 1.',
            'estado.required' => 'El campo estado es obligatorio.',
            'estado.in' => 'El estado debe ser activo o inactivo.',
            'precio.required' => 'El campo precio es obligatorio.',
            'precio.numeric' => 'El precio debe ser un número.',
            'precio.min' => 'El precio debe ser al menos 0.',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // Crear un nuevo servicio con los datos validados
        $servicio = Servicio::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Servicio registrado exitosamente',
            'data' => $servicio
        ]);
    }

    public function show($id)
    {
        // Busca el servicio por su ID y carga la relación 'empresa'
        $servicio = Servicio::findOrFail($id);

        return $servicio;
        // if (!$servicio) {
        //     return response()->json(['error' => 'Servicio no encontrado'], 404);
        // }

        // return response()->json($servicio, 200);
    }
    // Método para actualizar un servicio existente
    public function update(Request $request)
    {
        // Valida los datos de entrada
        $validatedData = $request->validate([
            'empresa_id' => 'required|exists:empresas,id',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'duracion' => 'required|integer|min:1',
            'estado' => 'required|in:activo,inactivo',
            'precio' => 'required|numeric|min:0',
        ]);
        $servicio = Servicio::findOrFail($request->id);

        try {

            $servicio->update($validatedData);

            // $servicio->update($validatedData);
            // return response()->json(['error' => 'Errorrr al actualizar el servicio.'], 200);
            // Devuelve la respuesta adecuada (por ejemplo, un JSON con el servicio actualizado)
            return response()->json($servicio, 200);
        } catch (\Exception $e) {
            // Maneja cualquier excepción que pueda ocurrir
            return response()->json(['error' => 'Error al actualizar el servicio.'], 500);
        }
    }



}
