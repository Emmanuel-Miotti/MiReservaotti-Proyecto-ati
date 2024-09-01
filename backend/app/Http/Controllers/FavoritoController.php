<?php

// backend\app\Http\Controllers\FavoritoController.php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Favorito;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class FavoritoController extends Controller
{
    public function agregarFavorito(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'cliente_id' => 'required|exists:clientes,id',
            'empresa_id' => 'required|exists:empresas,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // Verificar si ya existe el favorito
        $existe = Favorito::where('cliente_id', $request->cliente_id)
            ->where('empresa_id', $request->empresa_id)
            ->exists();

        if ($existe) {
            return response()->json([
                'success' => false,
                'message' => 'El favorito ya existe.',
            ], 400);
        }

        $favorito = Favorito::create([
            'cliente_id' => $request->cliente_id,
            'empresa_id' => $request->empresa_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Favorito agregado exitosamente',
            'data' => $favorito
        ]);
    }

    public function listarFavoritos($cliente_id)
    {
        // Obtener los favoritos del cliente especificado
        $favoritos = Favorito::where('cliente_id', $cliente_id)->with('empresa')->get();

        // Devolver la respuesta en formato JSON
        return response()->json([
            'success' => true,
            'data' => $favoritos
        ]);
    }

    public function eliminarFavorito($id)
    {
        $reserva = Favorito::findOrFail($id);
        $reserva->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reserva eliminada exitosamente'
        ]);
    }

    // public function destroy($id)
    // {
    //     $reserva = Reserva::findOrFail($id);
    //     $reserva->delete();

    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Reserva eliminada exitosamente'
    //     ]);
    // }
}

