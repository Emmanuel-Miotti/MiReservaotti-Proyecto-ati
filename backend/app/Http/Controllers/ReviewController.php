<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Review;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\Reserva;

class ReviewController extends Controller
{

    // Editar una reseña existente
    public function update(Request $request, $id)
    {
        Log::info('Datos de la solicitud entrante para actualización:', $request->all());
    
        // Validar la solicitud con mensajes personalizados
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:255',
        ], [
            'rating.required' => 'El campo calificación es obligatorio.',
            'rating.integer' => 'La calificación debe ser un número entero.',
            'rating.min' => 'La calificación debe ser al menos 1.',
            'rating.max' => 'La calificación no puede ser más de 5.',
            'comment.required' => 'El campo comentario es obligatorio.',
            'comment.string' => 'El comentario debe ser una cadena de caracteres.',
            'comment.max' => 'El comentario no puede tener más de 255 caracteres.',
        ]);
    
        if ($validator->fails()) {
            Log::error('La validación falló:', $validator->errors()->toArray());
            return response()->json($validator->errors(), 400);
        }
    
        try {
            $review = Review::findOrFail($id);
            $review->update($request->only(['rating', 'comment']));
    
            // Cargar la relación con el cliente
            $review->load('cliente');
    
            return response()->json([
                'success' => true,
                'message' => 'Reseña actualizada exitosamente',
                'data' => $review
            ]);
        } catch (\Exception $e) {
            Log::error('Error al actualizar la reseña:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Error al actualizar la reseña'], 500);
        }
    }
    
    // ---------------Obtener reseñas por ID de empresa--------------------------------
    public function index($empresaId)
    {
        try {
            // Verificar que el ID de empresa sea válido
            if (!is_numeric($empresaId) || $empresaId <= 0) {
                return response()->json(['error' => 'ID de empresa inválido'], 400);
            }

            // Obtener las reseñas junto con la relación 'cliente'
            $reviews = Review::where('empresa_id', $empresaId)
                ->with('cliente')
                ->get();

            // Verificar si se encontraron reseñas
            if ($reviews->isEmpty()) {
                return response()->json(['message' => 'No se encontraron reseñas para esta empresa'], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $reviews,
                'total_reviews' => $reviews->count(),
            ], 200);
        } catch (\Exception $e) {
            // Registro del error para depuración
            Log::error('Error al obtener las reseñas: ' . $e->getMessage());

            return response()->json(['error' => 'Error al obtener las reseñas'], 500);
        }
    }

      // ---------------Obtener reseñas por ID de empresa--------------------------------
      public function index2($empresaId)
      {
          try {
              // Verificar que el ID de empresa sea válido
              if (!is_numeric($empresaId) || $empresaId <= 0) {
                  return response()->json(['error' => 'ID de empresa inválido'], 400);
              }
  
              // Obtener las reseñas junto con la relación 'cliente'
              $reviews = Review::where('empresa_id', $empresaId)->with('cliente')->get();
  
              // Verificar si se encontraron reseñas
              if ($reviews->isEmpty()) {
                  return response()->json(['message' => 'No se encontraron reseñas para esta empresa'], 404);
              }
  
              return response()->json([
                  'success' => true,
                  'data' => $reviews
              ], 200);
          } catch (\Exception $e) {
              // Registro del error para depuración
              Log::error('Error al obtener las reseñas: ' . $e->getMessage());
  
              return response()->json(['error' => 'Error al obtener las reseñas'], 500);
          }
      }
  


    // -----------------Guardar nueva reseña---------------------------------------


    public function store(Request $request)
    {
        // Registrar los datos de la solicitud entrante para depuración
        Log::info('Datos de la solicitud entrante:', $request->all());
        Log::info('Datos recibidos en el backend:', $request->all());

        // Validar la solicitud con mensajes personalizados
        $validator = Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id', 
            'cliente_id' => 'required|exists:clientes,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:255',  
        ], [
            'empresa_id.required' => 'El campo empresa es obligatorio.',
            'empresa_id.exists' => 'La empresa seleccionada no es válida.',
            'cliente_id.required' => 'El campo cliente es obligatorio.',
            'cliente_id.exists' => 'El cliente seleccionado no es válido.',
            'rating.required' => 'El campo calificación es obligatorio.',
            'rating.integer' => 'La calificación debe ser un número entero.',
            'rating.min' => 'La calificación debe ser al menos 1.',
            'rating.max' => 'La calificación no puede ser más de 5.',
            'comment.string' => 'El comentario debe ser una cadena de caracteres.',
            'comment.max' => 'El comentario no puede tener más de 255 caracteres.',
        ]);

        if ($validator->fails()) {
            Log::error('La validación falló:', $validator->errors()->toArray());
            return response()->json($validator->errors(), 400);
        }

        // Verificar si el cliente tiene una reserva en la empresa (usando `agenda_id` en lugar de `empresa_id`)
        $tieneReserva = Reserva::where('agenda_id', $request->empresa_id) // asumimos que `empresa_id` es lo mismo que `agenda_id`
            ->where('cliente_id', $request->cliente_id)
            ->exists();

        if (!$tieneReserva) {
            return response()->json(['error' => 'El cliente debe tener una reserva en la empresa para poder hacer una reseña.'], 400);
        }

        // Verificar si el cliente ya ha hecho una reseña para esta empresa
        $yaReseñado = Review::where('empresa_id', $request->empresa_id)
            ->where('cliente_id', $request->cliente_id)
            ->exists();

        if ($yaReseñado) {
            return response()->json(['error' => 'El cliente ya ha hecho una reseña para esta empresa.'], 400);
        }

        // Crear una nueva reseña con los datos validados
        $review = Review::create($request->only(['empresa_id', 'cliente_id', 'rating', 'comment']));

        return response()->json([
            'success' => true,
            'message' => 'Reseña registrada exitosamente',
            'data' => $review
        ]);
    }
}
