<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Empresa;
use App\Models\Categoria;
use App\Models\Agenda;
use App\Models\Reserva;
use App\Models\Cliente;
use Illuminate\Http\JsonResponse;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmpresaController extends Controller
{

    

    public function getClientesByEmpresa($empresaId)
    {
        try {
            // Obtener todas las reservas asociadas a la empresa a través de sus agendas
            $clientes = Cliente::whereHas('reservas.agenda', function ($query) use ($empresaId) {
                $query->where('empresa_id', $empresaId);
            })->distinct()->get(['id', 'name', 'email', 'cellphone', 'profile_picture']); // Puedes seleccionar solo los campos que necesitas

            return response()->json(['data' => $clientes], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener los clientes', 'error' => $e->getMessage()], 500);
        }
    }




    public function getEmpresaId($id)
    {
        $user = Empresa::findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'User found successfully'
        ]);
    }

    public function getEmpresaId2($id)
    {
        $user = Empresa::with(['categoria', 'departamento', 'ciudad'])->find($id);
        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'User found successfully'
        ]);
    }


    public function getEmpresaUrl($url)
    {
        // Mail::to('mireservaotti@gmail.com')->send(new WelcomeMail);

        // return $url;
        $empresa = Empresa::where('url', $url)->firstOrFail();

        // Mail::to('mireservaotti@gmail.com')->send(new WelcomeMail($empresa));
        // return $empresa;
        return response()->json([
            'success' => true,
            'data' => $empresa,
            'message' => 'Empresa found successfully'
        ]);
    }

    // getServiciosEmpresaById

    // public function index()
    // {
    //     $empresas = Empresa::all();
    //     return view('empresas.index', compact('empresas'));
    // }
    // Método para obtener todas las empresas
    public function index(): JsonResponse
    {
        try {
            $empresas = Empresa::all();
            return response()->json(['data' => $empresas], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener empresas'], 500);
        }
    }

    public function create()
    {
        return view('empresas.create');
    }

    public function store(Empresa $request)
    {
        Empresa::create($request->validated());
        return redirect()->route('empresas.index');
    }

    public function show(Empresa $empresa)
    {
        return view('empresas.show', compact('empresa'));
    }

    public function edit(Empresa $empresa)
    {
        return view('empresas.edit', compact('empresa'));
    }

    public function update(Empresa $request, Empresa $empresa)
    {
        $empresa->update($request->validated());
        return redirect()->route('empresas.index');
    }

    public function destroy(Empresa $empresa)
    {
        $empresa->delete();
        return redirect()->route('empresas.index');
    }

    public function crearCategoria(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:categorias|max:255',
        ]);

        $categoria = Categoria::create($request->all());
        return response()->json($categoria, 201);
    }
}
