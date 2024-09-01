<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\UserController;
use App\Models\Usuario;
use App\Models\Cliente;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

use Illuminate\Support\Facades\Auth;



use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{

    public function registerCliente(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'cellphone' => 'nullable|string|max:20',
        ], [
            'name.required' => 'El campo nombre es obligatorio.',
            'name.string' => 'El campo nombre debe ser una cadena de texto.',
            'name.max' => 'El campo nombre no debe exceder los 255 caracteres.',
            'email.required' => 'El campo correo electrónico es obligatorio.',
            'email.string' => 'El campo correo electrónico debe ser una cadena de texto.',
            'email.email' => 'El campo correo electrónico debe ser una dirección de correo válida.',
            'email.max' => 'El campo correo electrónico no debe exceder los 255 caracteres.',
            'email.unique' => 'El correo electrónico ya está en uso.',
            'password.required' => 'El campo contraseña es obligatorio.',
            'password.string' => 'El campo contraseña debe ser una cadena de texto.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'cellphone.string' => 'El campo teléfono debe ser una cadena de texto.',
            'cellphone.max' => 'El campo teléfono no debe exceder los 20 caracteres.',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $empresa = Empresa::where('email', $request->email)->first();

        if ($empresa) {
            return response()->json([
                'errors' => ['email' => ['El correo electrónico ya ha sido registrado.']]
            ], 422);
        }

        $cliente = Cliente::where('email', $request->email)->first();

        if ($cliente) {
            return response()->json([
                'errors' => ['email' => ['El correo electrónico ya ha sido registrado.']]
            ], 422);
        }

        $data = $request->only('name', 'email', 'password', 'cellphone');
        $data['password'] = Hash::make($data['password']);

        $cliente = Cliente::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Cliente registrado exitosamente',
            'data' => $cliente
        ]);
    }


    public function registerEmpresa(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:empresas',
        'password' => 'required|string|min:8',
        'cellphone' => 'nullable|string|max:20',
        'address' => 'required|string|max:255',
        'categoria_id' => 'required|exists:categorias,id',
        'profile_picture' => 'nullable|string|max:255',
        'gallery' => 'nullable|json',
        'url' => 'required|string|max:255|unique:empresas',
    ], [
        'name.required' => 'El campo nombre es obligatorio.',
        'name.string' => 'El campo nombre debe ser una cadena de texto.',
        'name.max' => 'El campo nombre no debe exceder los 255 caracteres.',
        'email.required' => 'El campo correo electrónico es obligatorio.',
        'email.string' => 'El campo correo electrónico debe ser una cadena de texto.',
        'email.email' => 'El campo correo electrónico debe ser una dirección de correo válida.',
        'email.max' => 'El campo correo electrónico no debe exceder los 255 caracteres.',
        'email.unique' => 'El correo electrónico ya está en uso.',
        'password.required' => 'El campo contraseña es obligatorio.',
        'password.string' => 'El campo contraseña debe ser una cadena de texto.',
        'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
        'cellphone.string' => 'El campo teléfono debe ser una cadena de texto.',
        'cellphone.max' => 'El campo teléfono no debe exceder los 20 caracteres.',
        'address.required' => 'El campo dirección es obligatorio.',
        'address.string' => 'El campo dirección debe ser una cadena de texto.',
        'address.max' => 'El campo dirección no debe exceder los 255 caracteres.',
        'categoria_id.required' => 'El campo categoría es obligatorio.',
        'categoria_id.exists' => 'La categoría seleccionada no es válida.',
        'profile_picture.string' => 'El campo foto de perfil debe ser una cadena de texto.',
        'profile_picture.max' => 'El campo foto de perfil no debe exceder los 255 caracteres.',
        'gallery.json' => 'El campo galería debe ser un JSON válido.',
        'url.required' => 'El campo URL es obligatorio.',
        'url.string' => 'El campo URL debe ser una cadena de texto.',
        'url.max' => 'El campo URL no debe exceder los 255 caracteres.',
        'url.unique' => 'La URL ya está en uso.',
    ]);

    if ($validator->fails()) {
        return response()->json($validator->errors(), 400);
    }

    $empresa = Empresa::where('email', $request->email)->first();
    $empresa = Empresa::where('email', $request->email)->first();
    $cliente = Cliente::where('email', $request->email)->first();
    if ($empresa || $cliente) {
        return response()->json([
            'errors' => ['email' => ['El correo electrónico ya ha sido registrado.']]
        ], 422);
    }

    $data = $request->all();
    $data['password'] = Hash::make($data['password']);
    $data['role'] = 'empresa';

    $empresa = Empresa::create($data);

    return response()->json([
        'success' => true,
        'message' => 'Empresa registrada exitosamente',
        'data' => $empresa
    ]);
}

    public function registerEmpresa2(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'cellphone' => 'nullable|string|max:20',
              'address' => 'required|string|max:255',
            //'category' => 'required|string|max:255',
            'categoria_id' => 'required|exists:categorias,id',
        'profile_picture' => 'nullable|string|max:255',
        'gallery' => 'nullable|json',
        'url' => 'required|string|max:255|unique:empresas',
        //'role' => 'nullable|string|max:255',
        ], [
            'name.required' => 'El campo nombre es obligatorio.',
            'name.string' => 'El campo nombre debe ser una cadena de texto.',
            'name.max' => 'El campo nombre no debe exceder los 255 caracteres.',
            'email.required' => 'El campo correo electrónico es obligatorio.',
            'email.string' => 'El campo correo electrónico debe ser una cadena de texto.',
            'email.email' => 'El campo correo electrónico debe ser una dirección de correo válida.',
            'email.max' => 'El campo correo electrónico no debe exceder los 255 caracteres.',
            'email.unique' => 'El correo electrónico ya está en uso.',
            'password.required' => 'El campo contraseña es obligatorio.',
            'password.string' => 'El campo contraseña debe ser una cadena de texto.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'cellphone.string' => 'El campo teléfono debe ser una cadena de texto.',
            'cellphone.max' => 'El campo teléfono no debe exceder los 20 caracteres.',
            'address.required' => 'El campo dirección es obligatorio.',
            'address.string' => 'El campo dirección debe ser una cadena de texto.',
            'address.max' => 'El campo dirección no debe exceder los 255 caracteres.',
            //'category.required' => 'El campo categoría es obligatorio.',
            //'category.string' => 'El campo categoría debe ser una cadena de texto.',
            //'category.max' => 'El campo categoría no debe exceder los 255 caracteres.',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        

        $empresa = Empresa::where('email', $request->email)->first();

        if ($empresa) {
            return response()->json([
                'errors' => ['email' => ['El correo electrónico ya ha sido registrado.']]
            ], 422);
        }

        $cliente = Cliente::where('email', $request->email)->first();

        if ($cliente) {
            return response()->json([
                'errors' => ['email' => ['El correo electrónico ya ha sido registrado.']]
            ], 422);
        }

        // $data = $request->only('name', 'email', 'password', 'cellphone', 'address', 'category');
        $request['password'] = Hash::make($request['password']);

        $request['role'] = 'empresa';
        //  return $request;
        $empresa = Empresa::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Empresa registrada exitosamente',
            'data' => $empresa
        ]);

        
    }


    public function loginByEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ], [
            'email.required' => 'El campo correo electrónico es obligatorio',
            'email.email' => 'El correo electrónico debe ser una dirección de correo válida',
            'password.required' => 'El campo contraseña es obligatorio',
        ]);

        $cliente = Cliente::where('email', $request->email)->first();

        if (!$cliente) {
            $empresa = Empresa::where('email', $request->email)->first();
            if (!$empresa) {
                return response()->json(['errors' => ['email' => 'El correo electrónico no está registrado']], 401);
            } else {
                if (!Hash::check($request->password, $empresa->password)) {
                    return response()->json(['errors' => ['password' => 'Contraseña incorrecta']], 401);
                }

                $token = $empresa->createToken('authToken')->plainTextToken;
                return response()->json(['usuario' => $empresa, 'rol' => 'Empresa', 'token' => $token], 200);
            }
        } else {
            if (!Hash::check($request->password, $cliente->password)) {
                return response()->json(['errors' => ['password' => 'Contraseña incorrecta']], 401);
            }

            $token = $cliente->createToken('authToken')->plainTextToken;
            return response()->json(['usuario' => $cliente, 'rol' => 'Cliente', 'token' => $token], 200);
        }
    }


    public function me()
    {
        return response()->json(auth()->user());
    }


    public function getUserById($id)
    {
        $cliente = Cliente::find($id);

        if (!$cliente) {
            return response()->json(['error' => 'Cliente no encontrado'], 404);
        }

        return response()->json($cliente);
    }



    public function updateCliente(Request $request, $id)
    {

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:clientes,email,' . $id,
            'password' => 'nullable|string|min:8|confirmed',
            'cellphone' => 'nullable|string|max:15',
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'name.string' => 'El nombre debe ser una cadena de texto.',
            'name.max' => 'El nombre no debe exceder 255 caracteres.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe ser una dirección válida.',
            'email.max' => 'El correo electrónico no debe exceder 255 caracteres.',
            'email.unique' => 'El correo electrónico ya ha sido registrado.',
            'password.nullable' => 'La contraseña es opcional.',
            'password.string' => 'La contraseña debe ser una cadena de texto.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'cellphone.nullable' => 'El teléfono es opcional.',
            'cellphone.string' => 'El teléfono debe ser una cadena de texto.',
            'cellphone.max' => 'El teléfono no debe exceder 15 caracteres.',
        ]);



        $cliente = Cliente::findOrFail($id);

        if ($request->password && Hash::check($request->password, $cliente->password)) {
            return response()->json([
                'errors' => ['password' => ['La nueva contraseña no puede ser la misma que la contraseña actual.']]
            ], 422);
        }


        $empresa = Empresa::where('email', $request->email)->first();

        if ($empresa) {
            return response()->json([
                'errors' => ['email' => ['El correo electrónico ya ha sido registrado.']]
            ], 422);
        }

        $cliente->name = $request->name;


        $cliente->email = $request->email;

        if ($request->password) {
            $cliente->password = Hash::make($request->password);
        }

        $cliente->cellphone = $request->cellphone;
        $cliente->save();

        return response()->json(['message' => 'Cliente actualizado correctamente', 'cliente' => $cliente], 200);
    }

    public function updateEmpresa(Request $request, $id)
    {

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:empresas,email,' . $id,
            'password' => 'nullable|string|min:8|confirmed',
            'cellphone' => 'nullable|string|max:15',
            'address' => 'required|string|max:255',
            'category' => 'required|string|max:255',
        ], [
            'name.required' => 'El nombre es obligatorio.',
            'name.string' => 'El nombre debe ser una cadena de texto.',
            'name.max' => 'El nombre no debe exceder 255 caracteres.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe ser una dirección válida.',
            'email.max' => 'El correo electrónico no debe exceder 255 caracteres.',
            'email.unique' => 'El correo electrónico ya ha sido registrado.',
            'password.nullable' => 'La contraseña es opcional.',
            'password.string' => 'La contraseña debe ser una cadena de texto.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'cellphone.nullable' => 'El teléfono es opcional.',
            'cellphone.string' => 'El teléfono debe ser una cadena de texto.',
            'cellphone.max' => 'El teléfono no debe exceder 15 caracteres.',
            'address.required' => 'La dirección es obligatoria.',
            'address.string' => 'La dirección debe ser una cadena de texto.',
            'address.max' => 'La dirección no debe exceder 255 caracteres.',
            'category.required' => 'La categoría es obligatoria.',
            'category.string' => 'La categoría debe ser una cadena de texto.',
            'category.max' => 'La categoría no debe exceder 255 caracteres.',
        ]);

        $empresa = Empresa::findOrFail($id);

        if ($request->password && Hash::check($request->password, $empresa->password)) {
            return response()->json([
                'errors' => ['password' => ['La nueva contraseña no puede ser la misma que la contraseña actual.']]
            ], 422);
        }

        $cliente = Cliente::where('email', $request->email)->first();

        if ($cliente) {
            return response()->json([
                'errors' => ['email' => ['El correo electrónico ya ha sido registrado.']]
            ], 422);
        }

        $empresa->name = $request->name;
        $empresa->email = $request->email;

        if ($request->password) {
            $empresa->password = Hash::make($request->password);
        }

        $empresa->cellphone = $request->cellphone;
        $empresa->address = $request->address;
        $empresa->category = $request->category;
        $empresa->save();

        return response()->json(['message' => 'Empresa actualizada correctamente', 'empresa' => $empresa], 200);
    }


    public function logout()
    {
        auth()->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }
}
