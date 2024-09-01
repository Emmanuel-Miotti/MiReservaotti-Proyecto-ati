<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\Empresa;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get a user by ID.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserById($id)
    {
        try {
            $user = Cliente::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User found successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
       
    }

    public function getEmpresaById($id)
    {
        try {
            $user = Empresa::findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User found successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
       
    }
}
