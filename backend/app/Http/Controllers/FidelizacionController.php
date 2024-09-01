<?php

namespace App\Http\Controllers;

use App\Models\Fidelizacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FidelizacionController extends Controller
{
    // Listar todos los programas de fidelización para una empresa específica
    public function index($id)
    {

        // return response()->json([
        // ], 444);


        // $empresaId = $request->input('empresa_id');

        // return response()->json([
        //     'success' => true,
        //     'data' => $id
        // ]);
        $fidelizaciones = Fidelizacion::where('empresa_id',  $id)->get();

        return response()->json([
            'success' => true,
            'data' => $fidelizaciones
        ]);
    }


    // public function index(Request $request)
    // {

    //     $empresaId = $request->input('empresa_id');
        
    //     $fidelizaciones = Fidelizacion::where('empresa_id', $empresaId)->get();

    //     return response()->json([
    //         'success' => true,
    //         'data' => $fidelizaciones
    //     ]);
    // }

    // Crear un nuevo programa de fidelización
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:500',
            'puntos' => 'required|integer|min:1',
        ], [
            'empresa_id.required' => 'El campo empresa es obligatorio.',
            'empresa_id.exists' => 'La empresa seleccionada no es válida.',
            'nombre.required' => 'El campo nombre es obligatorio.',
            'nombre.max' => 'El nombre no puede tener más de 255 caracteres.',
            'descripcion.max' => 'La descripción no puede tener más de 500 caracteres.',
            'puntos.required' => 'El campo puntos es obligatorio.',
            'puntos.integer' => 'El campo puntos debe ser un número entero.',
            'puntos.min' => 'El campo puntos debe ser mayor o igual a 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $fidelizacion = Fidelizacion::create([
            'empresa_id' => $request->empresa_id,
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'puntos' => $request->puntos,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Programa de fidelización creado exitosamente',
            'data' => $fidelizacion
        ]);
    }

    // Mostrar un programa de fidelización específico
    public function show($id)
    {
        $fidelizacion = Fidelizacion::find($id);

        if (!$fidelizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Programa de fidelización no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $fidelizacion
        ]);
    }

    // Actualizar un programa de fidelización existente
    public function update(Request $request, $id)
    {
        $fidelizacion = Fidelizacion::find($id);

        if (!$fidelizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Programa de fidelización no encontrado'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:500',
            'puntos' => 'required|integer|min:1',
        ], [
            'empresa_id.required' => 'El campo empresa es obligatorio.',
            'empresa_id.exists' => 'La empresa seleccionada no es válida.',
            'nombre.required' => 'El campo nombre es obligatorio.',
            'nombre.max' => 'El nombre no puede tener más de 255 caracteres.',
            'descripcion.max' => 'La descripción no puede tener más de 500 caracteres.',
            'puntos.required' => 'El campo puntos es obligatorio.',
            'puntos.integer' => 'El campo puntos debe ser un número entero.',
            'puntos.min' => 'El campo puntos debe ser mayor o igual a 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $fidelizacion->update([
            'empresa_id' => $request->empresa_id,
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'puntos' => $request->puntos,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Programa de fidelización actualizado exitosamente',
            'data' => $fidelizacion
        ]);
    }

    // Eliminar un programa de fidelización
    public function destroy($id)
    {
        $fidelizacion = Fidelizacion::find($id);

        if (!$fidelizacion) {
            return response()->json([
                'success' => false,
                'message' => 'Programa de fidelización no encontrado'
            ], 404);
        }

        $fidelizacion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Programa de fidelización eliminado exitosamente'
        ]);
    }


        // Método para desactivar un programa de fidelización
        public function desactivar($id)
        {
            $fidelizacion = Fidelizacion::find($id);
    
            if (!$fidelizacion) {
                return response()->json(['success' => false, 'message' => 'Programa de fidelización no encontrado'], 404);
            }
    
            $fidelizacion->estado = 'inactivo';
            $fidelizacion->save();
    
            return response()->json(['success' => true, 'message' => 'Programa de fidelización desactivado exitosamente']);
        }
    
        // Método para activar un programa de fidelización
        public function activar($id)
        {
            $fidelizacion = Fidelizacion::find($id);
    
            if (!$fidelizacion) {
                return response()->json(['success' => false, 'message' => 'Programa de fidelización no encontrado'], 404);
            }
    
            $fidelizacion->estado = 'activo';
            $fidelizacion->save();
    
            return response()->json(['success' => true, 'message' => 'Programa de fidelización activado exitosamente']);
        }
        
}
