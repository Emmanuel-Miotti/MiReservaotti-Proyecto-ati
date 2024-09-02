<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\UserController;
use App\Models\Usuario;
use App\Models\Agenda;
use App\Models\Cliente;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB; 


use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{


    public function loginByEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                function ($attribute, $value, $fail) {
                    $existsInClientes = Cliente::where('email', $value)->exists();
                    $existsInEmpresas = Empresa::where('email', $value)->exists();
                    if (!$existsInClientes && !$existsInEmpresas) {
                        $fail('El correo electrónico no está registrado');
                    }
                },
            ],
            'password' => 'required|string',
        ], [
            'email.required' => 'El campo correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe ser una dirección de correo válida.',
            'email.max' => 'El campo correo electrónico no debe exceder los 255 caracteres.',
            'password.required' => 'El campo contraseña es obligatorio.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 400);
        }

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



    public function registerCliente(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:3|max:255',
            'email' => 'required|string|email|max:255|unique:empresas|unique:clientes',
            'password' => 'required|string|min:8',
            'confirmPassword' => 'required|string|same:password|min:8', // Validación para que coincidan las contraseñas
            'cellphone' => 'nullable|string|min:8|max:20|regex:/^[0-9]+$/|unique:empresas|unique:clientes', // Validación para solo números
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'name.required' => 'El campo nombre es obligatorio.',
            'name.string' => 'El campo nombre debe ser una cadena de texto.',
            'name.min' => 'El campo nombre debe tener al menos 3 caracteres.',
            'name.max' => 'El campo nombre no debe exceder los 255 caracteres.',
            'email.required' => 'El campo correo electrónico es obligatorio.',
            'email.string' => 'El campo correo electrónico debe ser una cadena de texto.',
            'email.email' => 'El campo correo electrónico debe ser una dirección de correo válida.',
            'email.max' => 'El campo correo electrónico no debe exceder los 255 caracteres.',
            'email.unique' => 'El correo electrónico ya está en uso.',
            'password.required' => 'El campo contraseña es obligatorio.',
            'password.string' => 'El campo contraseña debe ser una cadena de texto.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',

            'confirmPassword.required' => 'El campo confirmación de contraseña es obligatorio.',
            'confirmPassword.string' => 'El campo confirmación de contraseña debe ser una cadena de texto.',
            'confirmPassword.same' => 'La confirmación de contraseña no coincide con la contraseña.',
            'confirmPassword.min' => 'La confirmación de contraseña debe tener al menos 8 caracteres.',

            'cellphone.string' => 'El campo teléfono debe ser una cadena de texto.',
            'cellphone.regex' => 'El teléfono solo debe contener números.',
            'cellphone.min' => 'El campo teléfono debe tener al menos 8 caracteres.',
            'cellphone.max' => 'El campo teléfono no debe exceder los 20 caracteres.',
            'cellphone.unique' => 'El teléfono ya está en uso.',
            'profile_picture' => 'El archivo debe ser una imagen y no debe superar los 2MB',

        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 400);
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

        // Validación del teléfono
        // $empresa = Empresa::where('cellphone', $request->cellphone)->first();

        // if ($empresa) {
        //     return response()->json([
        //         'errors' => ['cellphone' => ['El teléfono ya ha sido registrado.']]
        //     ], 422);
        // }

        // $cliente = Cliente::where('cellphone', $request->cellphone)->first();

        // if ($cliente) {
        //     return response()->json([
        //         'errors' => ['cellphone' => ['El teléfono ya ha sido registrado.']]
        //     ], 422);
        // }

        $data = $request->only('name', 'email', 'password', 'cellphone');
        $data['password'] = Hash::make($data['password']);

        if ($request->hasFile('profile_picture')) {
            $image = $request->file('profile_picture');
            $name = time() . '.' . $image->getClientOriginalExtension();
            $destinationPath = public_path('/profile_pictures');
            $image->move($destinationPath, $name);
            $data['profile_picture'] = '/profile_pictures/' . $name;
        }

        $cliente = Cliente::create($data);

        // Enviar correo de bienvenida si es necesario
        //     // MAILLLLL
        Mail::to($cliente->email)->send(new WelcomeMail($cliente));

        return response()->json([
            'success' => true,
            'message' => 'Cliente registrado exitosamente',
            'data' => $cliente
        ]);
    }



    //     public function registerCliente(Request $request)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'name' => 'required|string|max:255',
    //         'email' => 'required|string|email|max:255|unique:users',
    //         'password' => 'required|string|min:8',
    //         'cellphone' => 'nullable|string|min:8|max:20|unique:users',
    //         'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    //     ], [
    //         'name.required' => 'El campo nombre es obligatorio.',
    //         'name.string' => 'El campo nombre debe ser una cadena de texto.',
    //         'name.max' => 'El campo nombre no debe exceder los 255 caracteres.',
    //         'email.required' => 'El campo correo electrónico es obligatorio.',
    //         'email.string' => 'El campo correo electrónico debe ser una cadena de texto.',
    //         'email.email' => 'El campo correo electrónico debe ser una dirección de correo válida.',
    //         'email.max' => 'El campo correo electrónico no debe exceder los 255 caracteres.',
    //         'email.unique' => 'El correo electrónico ya está en uso.',
    //         // 'email.regex' => 'El correo electrónico contiene caracteres no permitidos. No se permiten comillas, corchetes u otros caracteres especiales.',
    //         'password.required' => 'El campo contraseña es obligatorio.',
    //         'password.string' => 'El campo contraseña debe ser una cadena de texto.',
    //         'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
    //         'cellphone.string' => 'El campo teléfono debe ser una cadena de texto.',
    //         'cellphone.unique' => 'El telefono ya está en uso.',
    //         'profile_picture' => 'El archivo debe ser una imagen y no debe superar los 2MB',
    //         // 'profile_picture.image' => 'El archivo debe ser una imagen.',
    //         // 'profile_picture.mimes' => 'La imagen debe ser de tipo jpeg, png, jpg o gif.',
    //         // 'profile_picture.max' => 'La imagen no debe exceder los 2MB.',

    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json([
    //             'errors' => $validator->errors()
    //         ], 400);
    //     }

    //     $empresa = Empresa::where('email', $request->email)->first();

    //     if ($empresa) {
    //         return response()->json([
    //             'errors' => ['email' => ['El correo electrónico ya ha sido registrado.']]
    //         ], 422);
    //     }

    //     $cliente = Cliente::where('email', $request->email)->first();

    //     if ($cliente) {
    //         return response()->json([
    //             'errors' => ['email' => ['El correo electrónico ya ha sido registrado.']]
    //         ], 422);
    //     }

    //     //Validacaion del telefono
    //         $empresa = Empresa::where('cellphone', $request->cellphone)->first();

    //     if ($empresa) {
    //         return response()->json([
    //             'errors' => ['cellphone' => ['El teléfono ya ha sido registrado.']]
    //         ], 422);
    //     }

    //     $cliente = Cliente::where('cellphone', $request->cellphone)->first();

    //     if ($cliente) {
    //         return response()->json([
    //             'errors' => ['cellphone' => ['El teléfono ya ha sido registrado.']]
    //         ], 422);
    //     }

    //     $data = $request->only('name', 'email', 'password', 'cellphone');
    //     $data['password'] = Hash::make($data['password']);

    //     if ($request->hasFile('profile_picture')) {
    //         $image = $request->file('profile_picture');
    //         $name = time().'.'.$image->getClientOriginalExtension();
    //         $destinationPath = public_path('/profile_pictures');
    //         $image->move($destinationPath, $name);
    //         $data['profile_picture'] = '/profile_pictures/'.$name;
    //     }

    //     $cliente = Cliente::create($data);

    //     // MAILLLLL
    //     // Mail::to($cliente->email)->send(new WelcomeMail($cliente));

    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Cliente registrado exitosamente',
    //         'data' => $cliente
    //     ]);
    // }


    public function registerEmpresa(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:3|max:255',
            'email' => 'required|string|email|max:255|unique:empresas|unique:clientes',
            'password' => 'required|string|min:8',
            'confirmPassword' => 'required|string|same:password|min:8',
            'cellphone' => 'required|string|min:8|max:20|regex:/^[0-9]+$/|unique:empresas|unique:clientes',
            'address' => 'required|string|max:255',
            'categoria_id' => 'required|exists:categorias,id',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'url' => [
                'required',
                'string',
                'max:255',
                'unique:empresas',
                'not_in:Empresa,Cliente,Intervalo,Productos, productos,MisReservas,comprasCliente,favoritos,perfil-cliente,agenda,reservas,ventas,servicios,perfil-empresa,edit-empresa,gallery,intervalos,gestionClientes,login,register-cliente,register-empresa',
                'regex:/^[a-zA-Z0-9_-]+$/', 
            ],
            'departamento_id' => 'required|exists:departamentos,id',
            'ciudad_id' => 'required|exists:ciudades,id',
        ], [
            'name.required' => 'El campo nombre es obligatorio.',
            'name.string' => 'El campo nombre debe ser una cadena de texto.',
            'name.min' => 'El campo nombre debe tener al menos 3 caracteres.',
            'name.max' => 'El campo nombre no debe exceder los 255 caracteres.',

            'email.required' => 'El campo correo electrónico es obligatorio.',
            'email.string' => 'El campo correo electrónico debe ser una cadena de texto.',
            'email.email' => 'El campo correo electrónico debe ser una dirección de correo válida.',
            'email.max' => 'El campo correo electrónico no debe exceder los 255 caracteres.',
            'email.unique' => 'El correo electrónico ya está en uso.',

            'password.required' => 'El campo contraseña es obligatorio.',
            'password.string' => 'El campo contraseña debe ser una cadena de texto.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',

            'confirmPassword.required' => 'El campo confirmación de contraseña es obligatorio.',
            'confirmPassword.string' => 'El campo confirmación de contraseña debe ser una cadena de texto.',
            'confirmPassword.same' => 'La confirmación de contraseña no coincide con la contraseña.',
            'confirmPassword.min' => 'La confirmación de contraseña debe tener al menos 8 caracteres.',

            'cellphone.required' => 'El campo teléfono es obligatorio.',
            'cellphone.string' => 'El campo teléfono debe ser una cadena de texto.',
            'cellphone.max' => 'El campo teléfono no debe exceder los 20 caracteres.',
            'cellphone.min' => 'El campo teléfono debe exceder los 8 caracteres.',
            'cellphone.regex' => 'El campo teléfono solo debe contener números.',
            'cellphone.unique' => 'El campo teléfono ya se encuentra registrado.',

            'address.required' => 'El campo dirección es obligatorio.',
            'address.string' => 'El campo dirección debe ser una cadena de texto.',
            'address.max' => 'El campo dirección no debe exceder los 255 caracteres.',

            'categoria_id.required' => 'El campo categoría es obligatorio.',
            'categoria_id.exists' => 'La categoría seleccionada no es válida.',

            'profile_picture' => 'El archivo debe ser una imagen y no debe superar los 2MB',

            'url.required' => 'El campo URL es obligatorio.',
            'url.string' => 'El campo URL debe ser una cadena de texto.',
            'url.max' => 'El campo URL no debe exceder los 255 caracteres.',
            'url.unique' => 'La URL ya está en uso.',
            'url.not_in' => 'La URL ya está en uso.',
            'url.regex' => 'El campo URL solo puede contener letras, números, guiones y guiones bajos, sin signos o espacios.',


            'departamento_id.required' => 'El campo departamento es obligatorio.',
            'departamento_id.exists' => 'El departamento seleccionado no es válido.',

            'ciudad_id.required' => 'El campo ciudad es obligatorio.',
            'ciudad_id.exists' => 'La ciudad seleccionada no es válida.',
        ]);


        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 400);
        }

        $empresa = Empresa::where('email', $request->email)->first();
        $cliente = Cliente::where('email', $request->email)->first();
        if ($empresa || $cliente) {
            return response()->json([
                'errors' => ['email' => ['El correo electrónico ya ha sido registrado.']]
            ], 422);
        }

        //Validacaion del telefono
        $empresa = Empresa::where('cellphone', $request->cellphone)->first();

        if ($empresa) {
            return response()->json([
                'errors' => ['cellphone' => ['El teléfono ya ha sido registrado.']]
            ], 422);
        }

        $cliente = Cliente::where('cellphone', $request->cellphone)->first();

        if ($cliente) {
            return response()->json([
                'errors' => ['cellphone' => ['El teléfono ya ha sido registrado.']]
            ], 422);
        }


        $data = $request->all();
        $data['password'] = Hash::make($data['password']);
        $data['role'] = 'empresa';

        // if ($request->hasFile('profile_picture')) {
        //     $file = $request->file('profile_picture');
        //     $path = $file->store('profile_pictures', 'public');
        //     $data['profile_picture'] = $path;
        // }

        if ($request->hasFile('profile_picture')) {
            $image = $request->file('profile_picture');
            $name = time() . '.' . $image->getClientOriginalExtension();
            $destinationPath = public_path('/profile_pictures');
            $image->move($destinationPath, $name);
            $data['profile_picture'] = '/profile_pictures/' . $name;
        }

        $empresa = Empresa::create($data);

        $agenda = Agenda::create([
            'empresa_id' => $empresa->id,
            'estado' => 'abierta',
        ]);

        Mail::to($empresa->email)->send(new WelcomeMail($empresa));

        return response()->json([
            'success' => true,
            'message' => 'Empresa registrada exitosamente',
            'data' => $empresa
        ]);
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


    //     public function updateCliente(Request $request, $id)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'name' => 'sometimes|required|string|min:3|max:255',
    //         'email' => 'sometimes|required|string|email|max:255|unique:clientes,email,' . $id . '|unique:empresas,email,' . $id,
    //         'password' => 'nullable|string|min:8|confirmed',
    //         'confirmPassword' => 'nullable|string|same:password|min:8',
    //         'cellphone' => 'sometimes|nullable|string|min:8|max:20|regex:/^[0-9]+$/|unique:clientes,cellphone,' . $id . '|unique:empresas,cellphone,' . $id,
    //         'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    //         // 'remove_picture' => 'sometimes|boolean',
    //     ], [
    //         'name.required' => 'El campo nombre es obligatorio.',
    //         'name.string' => 'El campo nombre debe ser una cadena de texto.',
    //         'name.min' => 'El campo nombre debe tener al menos 3 caracteres.',
    //         'name.max' => 'El campo nombre no debe exceder los 255 caracteres.',
    //         'email.required' => 'El campo correo electrónico es obligatorio.',
    //         'email.string' => 'El campo correo electrónico debe ser una cadena de texto.',
    //         'email.email' => 'El campo correo electrónico debe ser una dirección de correo válida.',
    //         'email.max' => 'El campo correo electrónico no debe exceder los 255 caracteres.',
    //         'email.unique' => 'El correo electrónico ya está en uso.',
    //         'password.required' => 'El campo contraseña es obligatorio.',
    //         'password.string' => 'El campo contraseña debe ser una cadena de texto.',
    //         'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
    //         'password.confirmed' => 'La confirmación de la contraseña no coincide.',
    //         'confirmPassword.same' => 'La confirmación de contraseña no coincide con la contraseña.',
    //         'cellphone.string' => 'El campo teléfono debe ser una cadena de texto.',
    //         'cellphone.regex' => 'El teléfono solo debe contener números.',
    //         'cellphone.min' => 'El campo teléfono debe tener al menos 8 caracteres.',
    //         'cellphone.max' => 'El campo teléfono no debe exceder los 20 caracteres.',
    //         'cellphone.unique' => 'El teléfono ya está en uso.',
    //         'profile_picture.image' => 'El archivo debe ser una imagen.',
    //         'profile_picture.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg o gif.',
    //         'profile_picture.max' => 'La imagen no debe exceder los 2MB.',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json([
    //             'errors' => $validator->errors()
    //         ], 400);
    //     }

    //     $cliente = Cliente::findOrFail($id);

    //     if ($request->filled('password') && Hash::check($request->password, $cliente->password)) {
    //         return response()->json([
    //             'errors' => ['password' => ['La nueva contraseña no puede ser la misma que la contraseña actual.']]
    //         ], 422);
    //     }

    //     if ($request->filled('name')) {
    //         $cliente->name = $request->name;
    //     }

    //     if ($request->filled('email')) {
    //         $cliente->email = $request->email;
    //     }

    //     if ($request->filled('password')) {
    //         $cliente->password = Hash::make($request->password);
    //     }

    //     if ($request->filled('cellphone')) {
    //         $cliente->cellphone = $request->cellphone;
    //     }

    //     if ($request->has('remove_picture') && $request->remove_picture) {
    //         // Si se solicita eliminar la imagen, se elimina del sistema de archivos
    //         if ($cliente->profile_picture) {
    //             Storage::delete(public_path($cliente->profile_picture));
    //             $cliente->profile_picture = null;
    //         }
    //     } elseif ($request->hasFile('profile_picture')) {
    //         // Subir nueva imagen si se ha proporcionado
    //         $image = $request->file('profile_picture');
    //         $name = time() . '.' . $image->getClientOriginalExtension();
    //         $destinationPath = public_path('/profile_pictures');
    //         $image->move($destinationPath, $name);
    //         $cliente->profile_picture = '/profile_pictures/' . $name;
    //     }

    //     $cliente->save();

    //     return response()->json(['message' => 'Cliente actualizado correctamente', 'cliente' => $cliente], 200);
    // }
    public function updateClienteApp(Request $request, $id)
    {
        // Definir las reglas de validación
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|min:3|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:clientes,email,' . $id,
            'password' => 'nullable|string|min:8|confirmed',
            'password_confirmation' => 'nullable|string|same:password|min:8',
            'cellphone' => 'nullable|string|min:8|max:20|regex:/^[0-9]+$/|unique:clientes,cellphone,' . $id,
        ], [
            'name.required' => 'El campo nombre es obligatorio.',
            'email.required' => 'El campo correo electrónico es obligatorio.',
            'email.email' => 'El campo correo electrónico debe ser una dirección de correo válida.',
            'email.unique' => 'El correo electrónico ya está en uso.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'cellphone.unique' => 'El teléfono ya está en uso.',
        ]);

        // Si la validación falla, retornar los errores
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 400);
        }

        // Buscar al cliente por ID
        $cliente = Cliente::findOrFail($id);

        // Actualizar los campos solo si están presentes en la solicitud
        if ($request->filled('name')) {
            $cliente->name = $request->name;
        }

        if ($request->filled('email')) {
            $cliente->email = $request->email;
        }

        if ($request->filled('password')) {
            $cliente->password = Hash::make($request->password);
        }

        if ($request->filled('cellphone')) {
            $cliente->cellphone = $request->cellphone;
        }

        // Guardar los cambios
        $cliente->save();

        // Retornar una respuesta exitosa con los datos del cliente actualizado
        return response()->json(['message' => 'Cliente actualizado correctamente', 'cliente' => $cliente], 200);
    }

    public function updateCliente(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|min:3|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:clientes,email,' . $id . '|unique:empresas,email,' . $id,
            'password' => 'nullable|string|min:8|confirmed',
            'confirmPassword' => 'nullable|string|same:password|min:8',
            'cellphone' => 'nullable|string|min:8|max:20|regex:/^[0-9]+$/|unique:clientes,cellphone,' . $id . '|unique:empresas,cellphone,' . $id,
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            // Mensajes de error personalizados
            'name.required' => 'El campo nombre es obligatorio.',
            'name.string' => 'El campo nombre debe ser una cadena de texto.',
            'name.min' => 'El campo nombre debe tener al menos 3 caracteres.',
            'name.max' => 'El campo nombre no debe exceder los 255 caracteres.',
            'email.required' => 'El campo correo electrónico es obligatorio.',
            'email.string' => 'El campo correo electrónico debe ser una cadena de texto.',
            'email.email' => 'El campo correo electrónico debe ser una dirección de correo válida.',
            'email.max' => 'El campo correo electrónico no debe exceder los 255 caracteres.',
            'email.unique' => 'El correo electrónico ya está en uso.',
            'password.required' => 'El campo contraseña es obligatorio.',
            'password.string' => 'El campo contraseña debe ser una cadena de texto.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'confirmPassword.same' => 'La confirmación de contraseña no coincide con la contraseña.',
            'cellphone.string' => 'El campo teléfono debe ser una cadena de texto.',
            'cellphone.regex' => 'El teléfono solo debe contener números.',
            'cellphone.min' => 'El campo teléfono debe tener al menos 8 caracteres.',
            'cellphone.max' => 'El campo teléfono no debe exceder los 20 caracteres.',
            'cellphone.unique' => 'El teléfono ya está en uso.',
            'profile_picture.image' => 'El archivo debe ser una imagen.',
            'profile_picture.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg o gif.',
            'profile_picture.max' => 'La imagen no debe exceder los 2MB.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 400);
        }

        $cliente = Cliente::findOrFail($id);

        if ($request->filled('password') && Hash::check($request->password, $cliente->password)) {
            return response()->json([
                'errors' => ['password' => ['La nueva contraseña no puede ser la misma que la contraseña actual.']]
            ], 422);
        }

        if ($request->filled('name')) {
            $cliente->name = $request->name;
        }

        if ($request->filled('email')) {
            $cliente->email = $request->email;
        }

        if ($request->filled('password')) {
            $cliente->password = Hash::make($request->password);
        }

        if ($request->has('remove_cellphone') && $request->remove_cellphone) {
            $cliente->cellphone = null;
        } else if ($request->filled('cellphone')) {
            $cliente->cellphone = $request->cellphone;
        }

        if ($request->has('remove_picture') && $request->remove_picture) {
            if ($cliente->profile_picture) {
                Storage::delete(public_path($cliente->profile_picture));
                $cliente->profile_picture = null;
            }
        } elseif ($request->hasFile('profile_picture')) {
            $image = $request->file('profile_picture');
            $name = time() . '.' . $image->getClientOriginalExtension();
            $destinationPath = public_path('/profile_pictures');
            $image->move($destinationPath, $name);
            $cliente->profile_picture = '/profile_pictures/' . $name;
        }

        $cliente->save();

        return response()->json(['message' => 'Cliente actualizado correctamente', 'cliente' => $cliente], 200);
    }




    // public function updateCliente(Request $request, $id)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'name' => 'sometimes|required|string|min:3|max:255',
    //         'email' => 'sometimes|required|string|email|max:255|unique:clientes,email,' . $id . '|unique:empresas,email,' . $id,
    //         'password' => 'nullable|string|min:8|confirmed',
    //         'confirmPassword' => 'nullable|string|same:password|min:8',
    //         'cellphone' => 'sometimes|nullable|string|min:8|max:20|regex:/^[0-9]+$/|unique:clientes,cellphone,' . $id . '|unique:empresas,cellphone,' . $id,
    //         'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    //     ], [
    //         'name.required' => 'El campo nombre es obligatorio.',
    //         'name.string' => 'El campo nombre debe ser una cadena de texto.',
    //         'name.min' => 'El campo nombre debe tener al menos 3 caracteres.',
    //         'name.max' => 'El campo nombre no debe exceder los 255 caracteres.',
    //         'email.required' => 'El campo correo electrónico es obligatorio.',
    //         'email.string' => 'El campo correo electrónico debe ser una cadena de texto.',
    //         'email.email' => 'El campo correo electrónico debe ser una dirección de correo válida.',
    //         'email.max' => 'El campo correo electrónico no debe exceder los 255 caracteres.',
    //         'email.unique' => 'El correo electrónico ya está en uso.',
    //         'password.required' => 'El campo contraseña es obligatorio.',
    //         'password.string' => 'El campo contraseña debe ser una cadena de texto.',
    //         'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
    //         'password.confirmed' => 'La confirmación de la contraseña no coincide.',
    //         'confirmPassword.same' => 'La confirmación de contraseña no coincide con la contraseña.',
    //         'cellphone.string' => 'El campo teléfono debe ser una cadena de texto.',
    //         'cellphone.regex' => 'El teléfono solo debe contener números.',
    //         'cellphone.min' => 'El campo teléfono debe tener al menos 8 caracteres.',
    //         'cellphone.max' => 'El campo teléfono no debe exceder los 20 caracteres.',
    //         'cellphone.unique' => 'El teléfono ya está en uso.',
    //         'profile_picture.image' => 'El archivo debe ser una imagen.',
    //         'profile_picture.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg o gif.',
    //         'profile_picture.max' => 'La imagen no debe exceder los 2MB.',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json([
    //             'errors' => $validator->errors()
    //         ], 400);
    //     }

    //     $cliente = Cliente::findOrFail($id);

    //     if ($request->filled('password') && Hash::check($request->password, $cliente->password)) {
    //         return response()->json([
    //             'errors' => ['password' => ['La nueva contraseña no puede ser la misma que la contraseña actual.']]
    //         ], 422);
    //     }

    //     if ($request->filled('name')) {
    //         $cliente->name = $request->name;
    //     }

    //     if ($request->filled('email')) {
    //         $cliente->email = $request->email;
    //     }

    //     if ($request->filled('password')) {
    //         $cliente->password = Hash::make($request->password);
    //     }

    //     if ($request->filled('cellphone')) {
    //         $cliente->cellphone = $request->cellphone;
    //     }

    //     if ($request->hasFile('profile_picture')) {
    //         $image = $request->file('profile_picture');
    //         $name = time() . '.' . $image->getClientOriginalExtension();
    //         $destinationPath = public_path('/profile_pictures');
    //         $image->move($destinationPath, $name);
    //         $cliente->profile_picture = '/profile_pictures/' . $name;
    //     }

    //     $cliente->save();

    //     return response()->json(['message' => 'Cliente actualizado correctamente', 'cliente' => $cliente], 200);
    // }



    // public function updateCliente(Request $request, $id)
    // {
    //     $validator = Validator::make($request->all(), [
    //         'name' => 'required|string|min:3|max:255',
    //         'email' => 'required|string|email|max:255|unique:clientes,email,' . $id . '|unique:empresas,email,' . $id,
    //         'password' => 'nullable|string|min:8|confirmed',
    //         'confirmPassword' => 'nullable|string|same:password|min:8',
    //         'cellphone' => 'nullable|string|min:8|max:20|regex:/^[0-9]+$/|unique:clientes,cellphone,' . $id . '|unique:empresas,cellphone,' . $id,
    //         'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    //     ], [
    //         'name.required' => 'El campo nombre es obligatorio.',
    //         'name.string' => 'El campo nombre debe ser una cadena de texto.',
    //         'name.min' => 'El campo nombre debe tener al menos 3 caracteres.',
    //         'name.max' => 'El campo nombre no debe exceder los 255 caracteres.',
    //         'email.required' => 'El campo correo electrónico es obligatorio.',
    //         'email.string' => 'El campo correo electrónico debe ser una cadena de texto.',
    //         'email.email' => 'El campo correo electrónico debe ser una dirección de correo válida.',
    //         'email.max' => 'El campo correo electrónico no debe exceder los 255 caracteres.',
    //         'email.unique' => 'El correo electrónico ya está en uso.',
    //         'password.required' => 'El campo contraseña es obligatorio.',
    //         'password.string' => 'El campo contraseña debe ser una cadena de texto.',
    //         'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
    //         'password.confirmed' => 'La confirmación de la contraseña no coincide.',
    //         'confirmPassword.required' => 'El campo confirmación de contraseña es obligatorio.',
    //         'confirmPassword.string' => 'El campo confirmación de contraseña debe ser una cadena de texto.',
    //         'confirmPassword.same' => 'La confirmación de contraseña no coincide con la contraseña.',
    //         'confirmPassword.min' => 'La confirmación de contraseña debe tener al menos 8 caracteres.',
    //         'cellphone.string' => 'El campo teléfono debe ser una cadena de texto.',
    //         'cellphone.regex' => 'El teléfono solo debe contener números.',
    //         'cellphone.min' => 'El campo teléfono debe tener al menos 8 caracteres.',
    //         'cellphone.max' => 'El campo teléfono no debe exceder los 20 caracteres.',
    //         'cellphone.unique' => 'El teléfono ya está en uso.',
    //         'profile_picture.image' => 'El archivo debe ser una imagen.',
    //         'profile_picture.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg o gif.',
    //         'profile_picture.max' => 'La imagen no debe exceder los 2MB.',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json([
    //             'errors' => $validator->errors()
    //         ], 400);
    //     }

    //     $cliente = Cliente::findOrFail($id);

    //     if ($request->password && Hash::check($request->password, $cliente->password)) {
    //         return response()->json([
    //             'errors' => ['password' => ['La nueva contraseña no puede ser la misma que la contraseña actual.']]
    //         ], 422);
    //     }

    //     $cliente->name = $request->name;
    //     $cliente->email = $request->email;

    //     if ($request->password) {
    //         $cliente->password = Hash::make($request->password);
    //     }

    //     $cliente->cellphone = $request->cellphone;

    //     if ($request->hasFile('profile_picture')) {
    //         $image = $request->file('profile_picture');
    //         $name = time() . '.' . $image->getClientOriginalExtension();
    //         $destinationPath = public_path('/profile_pictures');
    //         $image->move($destinationPath, $name);
    //         $cliente->profile_picture = '/profile_pictures/' . $name;
    //     }

    //     $cliente->save();

    //     return response()->json(['message' => 'Cliente actualizado correctamente', 'cliente' => $cliente], 200);
    // }


    // public function updateCliente(Request $request, $id)
    // {

    //     $request->validate([
    //         'name' => 'required|string|max:255',
    //         'email' => 'required|email|max:255|unique:clientes,email,' . $id,
    //         'password' => 'nullable|string|min:8|confirmed',
    //         'cellphone' => 'nullable|string|max:15',
    //     ], [
    //         'name.required' => 'El nombre es obligatorio.',
    //         'name.string' => 'El nombre debe ser una cadena de texto.',
    //         'name.max' => 'El nombre no debe exceder 255 caracteres.',
    //         'email.required' => 'El correo electrónico es obligatorio.',
    //         'email.email' => 'El correo electrónico debe ser una dirección válida.',
    //         'email.max' => 'El correo electrónico no debe exceder 255 caracteres.',
    //         'email.unique' => 'El correo electrónico ya ha sido registrado.',
    //         'password.nullable' => 'La contraseña es opcional.',
    //         'password.string' => 'La contraseña debe ser una cadena de texto.',
    //         'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
    //         'password.confirmed' => 'La confirmación de la contraseña no coincide.',
    //         'cellphone.nullable' => 'El teléfono es opcional.',
    //         'cellphone.string' => 'El teléfono debe ser una cadena de texto.',
    //         'cellphone.max' => 'El teléfono no debe exceder 15 caracteres.',
    //     ]);


    //     $cliente = Cliente::findOrFail($id);

    //     if ($request->password && Hash::check($request->password, $cliente->password)) {
    //         return response()->json([
    //             'errors' => ['password' => ['La nueva contraseña no puede ser la misma que la contraseña actual.']]
    //         ], 422);
    //     }


    //     $empresa = Empresa::where('email', $request->email)->first();

    //     if ($empresa) {
    //         return response()->json([
    //             'errors' => ['email' => ['El correo electrónico ya ha sido registrado.']]
    //         ], 422);
    //     }

    //     $cliente->name = $request->name;


    //     $cliente->email = $request->email;

    //     if ($request->password) {
    //         $cliente->password = Hash::make($request->password);
    //     }

    //     $cliente->cellphone = $request->cellphone;
    //     $cliente->save();

    //     return response()->json(['message' => 'Cliente actualizado correctamente', 'cliente' => $cliente], 200);
    // }


    // Route::put('/empresa/{id}', [EmpresaController::class, 'update']);
    public function updateEmpresa(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|min:3|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:empresas,email,' . $id . '|unique:clientes,email,' . $id,
            'password' => 'nullable|string|min:8|confirmed',
            'confirmPassword' => 'nullable|string|same:password|min:8',
            'cellphone' => 'nullable|string|min:8|max:20|regex:/^[0-9]+$/|unique:empresas,cellphone,' . $id . '|unique:clientes,cellphone,' . $id,
            'address' => 'sometimes|required|string|max:255',
            'categoria_id' => 'sometimes|required|exists:categorias,id',
            'departamento_id' => 'sometimes|required|exists:departamentos,id',
            'ciudad_id' => [
                'sometimes',
                'required',
                function ($attribute, $value, $fail) use ($request) {
                    $departamentoId = $request->input('departamento_id');
                    if (!DB::table('ciudades')
                            ->where('id', $value)
                            ->where('departamento_id', $departamentoId)
                            ->exists()) {
                        $fail('La ciudad seleccionada no pertenece al departamento elegido.');
                    }
                },
            ],
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'url' => 'sometimes|required|string|max:255|unique:empresas,url,' . $id,
        ], [
            'name.required' => 'El campo nombre es obligatorio.',
            'name.string' => 'El campo nombre debe ser una cadena de texto.',
            'name.min' => 'El campo nombre debe tener al menos 3 caracteres.',
            'name.max' => 'El campo nombre no debe exceder los 255 caracteres.',
    
            'email.required' => 'El campo correo electrónico es obligatorio.',
            'email.string' => 'El campo correo electrónico debe ser una cadena de texto.',
            'email.email' => 'El campo correo electrónico debe ser una dirección de correo válida.',
            'email.max' => 'El campo correo electrónico no debe exceder los 255 caracteres.',
            'email.unique' => 'El correo electrónico ya está en uso.',
    
            'password.string' => 'El campo contraseña debe ser una cadena de texto.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'confirmPassword.same' => 'La confirmación de contraseña no coincide con la contraseña.',
    
            'cellphone.string' => 'El campo teléfono debe ser una cadena de texto.',
            'cellphone.regex' => 'El teléfono solo debe contener números.',
            'cellphone.min' => 'El campo teléfono debe tener al menos 8 caracteres.',
            'cellphone.max' => 'El campo teléfono no debe exceder los 20 caracteres.',
            'cellphone.unique' => 'El teléfono ya está en uso.',
    
            'address.required' => 'El campo dirección es obligatorio.',
            'address.string' => 'El campo dirección debe ser una cadena de texto.',
            'address.max' => 'El campo dirección no debe exceder los 255 caracteres.',
    
            'categoria_id.required' => 'El campo categoría es obligatorio.',
            'categoria_id.exists' => 'La categoría seleccionada no es válida.',
    
            'departamento_id.required' => 'El campo departamento es obligatorio.',
            'departamento_id.exists' => 'El departamento seleccionado no es válido.',
    
            'ciudad_id.required' => 'El campo ciudad es obligatorio.',
            'ciudad_id.exists' => 'La ciudad seleccionada no es válida.',
    
            'profile_picture.image' => 'El archivo debe ser una imagen.',
            'profile_picture.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif, o svg.',
            'profile_picture.max' => 'La imagen no debe exceder los 2MB.',
    
            'url.required' => 'El campo URL es obligatorio.',
            'url.string' => 'El campo URL debe ser una cadena de texto.',
            'url.max' => 'El campo URL no debe exceder los 255 caracteres.',
            'url.unique' => 'La URL ya está en uso.',
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 400);
        }
    
        $empresa = Empresa::findOrFail($id);
    
        if ($request->filled('password') && Hash::check($request->password, $empresa->password)) {
            return response()->json([
                'errors' => ['password' => ['La nueva contraseña no puede ser la misma que la contraseña actual.']]
            ], 422);
        }
    
        if ($request->filled('name')) {
            $empresa->name = $request->name;
        }
    
        if ($request->filled('email')) {
            $empresa->email = $request->email;
        }
    
        if ($request->filled('password')) {
            $empresa->password = Hash::make($request->password);
        }
    
        if ($request->has('remove_cellphone') && $request->remove_cellphone) {
            $empresa->cellphone = null;
        } elseif ($request->filled('cellphone')) {
            $empresa->cellphone = $request->cellphone;
        }
    
        if ($request->filled('address')) {
            $empresa->address = $request->address;
        }
    
        if ($request->filled('categoria_id')) {
            $empresa->categoria_id = $request->categoria_id;
        }
    
        if ($request->filled('departamento_id')) {
            $empresa->departamento_id = $request->departamento_id;
        }
    
        if ($request->filled('ciudad_id')) {
            $empresa->ciudad_id = $request->ciudad_id;
        }
    
        if ($request->has('remove_picture') && $request->remove_picture) {
            if ($empresa->profile_picture) {
                Storage::delete($empresa->profile_picture);
                $empresa->profile_picture = null;
            }
        } elseif ($request->hasFile('profile_picture')) {
            $image = $request->file('profile_picture');
            $name = time() . '.' . $image->getClientOriginalExtension();
            $destinationPath = public_path('/profile_pictures');
            $image->move($destinationPath, $name);
            $empresa->profile_picture = '/profile_pictures/' . $name;
        }
    
        if ($request->filled('url')) {
            $empresa->url = $request->url;
        }
    
        $empresa->save();
    
        return response()->json(['message' => 'Empresa actualizada correctamente', 'empresa' => $empresa], 200);
    }
    
    public function updateEmpresaapp(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|min:3|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:empresas,email,' . $id . '|unique:clientes,email,' . $id,
            'password' => 'nullable|string|min:8|confirmed',
            'confirmPassword' => 'nullable|string|same:password|min:8',
            'cellphone' => 'nullable|string|min:8|max:20|regex:/^[0-9]+$/|unique:empresas,cellphone,' . $id . '|unique:clientes,cellphone,' . $id,
            'address' => 'sometimes|required|string|max:255',
            'categoria_id' => 'sometimes|required|exists:categorias,id',
            'departamento_id' => 'sometimes|required|exists:departamentos,id',
            'ciudad_id' => [
                'sometimes',
                'required',
                function ($attribute, $value, $fail) use ($request) {
                    $departamentoId = $request->input('departamento_id');
                    if (!DB::table('ciudades')
                            ->where('id', $value)
                            ->where('departamento_id', $departamentoId)
                            ->exists()) {
                        $fail('La ciudad seleccionada no pertenece al departamento elegido.');
                    }
                },
            ],
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'url' => 'sometimes|required|string|max:255|unique:empresas,url,' . $id,
        ], [
            'name.required' => 'El campo nombre es obligatorio.',
            'name.string' => 'El campo nombre debe ser una cadena de texto.',
            'name.min' => 'El campo nombre debe tener al menos 3 caracteres.',
            'name.max' => 'El campo nombre no debe exceder los 255 caracteres.',
    
            'email.required' => 'El campo correo electrónico es obligatorio.',
            'email.string' => 'El campo correo electrónico debe ser una cadena de texto.',
            'email.email' => 'El campo correo electrónico debe ser una dirección de correo válida.',
            'email.max' => 'El campo correo electrónico no debe exceder los 255 caracteres.',
            'email.unique' => 'El correo electrónico ya está en uso.',
    
            'password.string' => 'El campo contraseña debe ser una cadena de texto.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'confirmPassword.same' => 'La confirmación de contraseña no coincide con la contraseña.',
    
            'cellphone.string' => 'El campo teléfono debe ser una cadena de texto.',
            'cellphone.regex' => 'El teléfono solo debe contener números.',
            'cellphone.min' => 'El campo teléfono debe tener al menos 8 caracteres.',
            'cellphone.max' => 'El campo teléfono no debe exceder los 20 caracteres.',
            'cellphone.unique' => 'El teléfono ya está en uso.',
    
            'address.required' => 'El campo dirección es obligatorio.',
            'address.string' => 'El campo dirección debe ser una cadena de texto.',
            'address.max' => 'El campo dirección no debe exceder los 255 caracteres.',
    
            'categoria_id.required' => 'El campo categoría es obligatorio.',
            'categoria_id.exists' => 'La categoría seleccionada no es válida.',
    
            'departamento_id.required' => 'El campo departamento es obligatorio.',
            'departamento_id.exists' => 'El departamento seleccionado no es válido.',
    
            'ciudad_id.required' => 'El campo ciudad es obligatorio.',
            'ciudad_id.exists' => 'La ciudad seleccionada no es válida.',
    
            'profile_picture.image' => 'El archivo debe ser una imagen.',
            'profile_picture.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif, o svg.',
            'profile_picture.max' => 'La imagen no debe exceder los 2MB.',
    
            'url.required' => 'El campo URL es obligatorio.',
            'url.string' => 'El campo URL debe ser una cadena de texto.',
            'url.max' => 'El campo URL no debe exceder los 255 caracteres.',
            'url.unique' => 'La URL ya está en uso.',
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 400);
        }
    
        $empresa = Empresa::findOrFail($id);
    
        if ($request->filled('password') && Hash::check($request->password, $empresa->password)) {
            return response()->json([
                'errors' => ['password' => ['La nueva contraseña no puede ser la misma que la contraseña actual.']]
            ], 422);
        }
    
        if ($request->filled('name')) {
            $empresa->name = $request->name;
        }
    
        if ($request->filled('email')) {
            $empresa->email = $request->email;
        }
    
        if ($request->filled('password')) {
            $empresa->password = Hash::make($request->password);
        }
    
        if ($request->has('remove_cellphone') && $request->remove_cellphone) {
            $empresa->cellphone = null;
        } elseif ($request->filled('cellphone')) {
            $empresa->cellphone = $request->cellphone;
        }
    
        if ($request->filled('address')) {
            $empresa->address = $request->address;
        }
    
        if ($request->filled('categoria_id')) {
            $empresa->categoria_id = $request->categoria_id;
        }
    
        if ($request->filled('departamento_id')) {
            $empresa->departamento_id = $request->departamento_id;
        }
    
        if ($request->filled('ciudad_id')) {
            $empresa->ciudad_id = $request->ciudad_id;
        }
    
        if ($request->has('remove_picture') && $request->remove_picture) {
            if ($empresa->profile_picture) {
                Storage::delete($empresa->profile_picture);
                $empresa->profile_picture = null;
            }
        } elseif ($request->hasFile('profile_picture')) {
            $image = $request->file('profile_picture');
            $name = time() . '.' . $image->getClientOriginalExtension();
            $destinationPath = public_path('/profile_pictures');
            $image->move($destinationPath, $name);
            $empresa->profile_picture = '/profile_pictures/' . $name;
        }
    
        if ($request->filled('url')) {
            $empresa->url = $request->url;
        }
    
        $empresa->save();
    
        return response()->json(['message' => 'Empresa actualizada correctamente', 'empresa' => $empresa], 200);
    }



    public function updateEmpresa3(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:empresas,email,' . $id,
            'password' => 'nullable|string|min:8|confirmed',
            'cellphone' => 'nullable|string|max:15',
            'address' => 'required|string|max:255',
            'categoria_id' => 'required|exists:categorias,id',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'url' => 'required|string|max:255|unique:empresas,url,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $empresa->name = $request->name;
        $empresa->email = $request->email;
        $empresa->cellphone = $request->cellphone;
        $empresa->address = $request->address;
        $empresa->categoria_id = $request->categoria_id;
        $empresa->url = $request->url;

        if ($request->password) {
            $empresa->password = Hash::make($request->password);
        }

        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $path = $file->store('profile_pictures', 'public');
            $empresa->profile_picture = $path;
        }

        $empresa->save();

        return response()->json(['message' => 'Empresa actualizada correctamente', 'empresa' => $empresa], 200);
    }



    public function updateProfilePicture(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);

        if ($request->has('profile_picture')) {
            $imageData = $request->input('profile_picture');
            $imageName = time() . '.png';
            $path = storage_path('app/public/profile_pictures/' . $imageName);

            // Decodificar el base64 y guardarlo en un archivo
            file_put_contents($path, base64_decode($imageData));

            $empresa->profile_picture = '/profile_pictures/' . $imageName;
            $empresa->save();

            return response()->json(['data' => $empresa], 200);
        } else {
            return response()->json(['error' => 'No file uploaded'], 400);
        }
    }

    public function deleteGalleryImage($id, $image)
    {
        $empresa = Empresa::findOrFail($id);
        $gallery = json_decode($empresa->gallery, true);

        if (($key = array_search($image, $gallery)) !== false) {
            unset($gallery[$key]);
            $empresa->gallery = json_encode(array_values($gallery));
            $empresa->save();

            // Eliminar el archivo físico si es necesario
            Storage::disk('public')->delete($image);
        }

        return response()->json(['data' => $empresa], 200);
    }


    public function updateGallery(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);

        if ($request->hasFile('gallery')) {
            $gallery = [];
            foreach ($request->file('gallery') as $file) {
                $path = $file->store('gallery', 'public');
                $gallery[] = $path;
            }

            $empresa->gallery = json_encode($gallery);
            $empresa->save();
        } else {
            return response()->json(['error' => 'No files uploaded'], 400);
        }

        return response()->json(['data' => $empresa], 200);
    }






    //     public function updateEmpresa(Request $request, $id)
    // {

    //     // return $request->name;

    //     $validator = Validator::make($request->all(), [
    //         'name' => 'string|max:255',
    //         'email' => 'email|max:255|unique:empresas,email,' . $id,
    //         'password' => 'nullable|string|min:8|confirmed',
    //         'cellphone' => 'nullable|string|max:20',
    //         'address' => 'string|max:255',
    //         'categoria_id' => 'exists:categorias,id',
    //         'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
    //         'gallery' => 'nullable|array',
    //         'gallery.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
    //         'url' => 'string|max:255|unique:empresas,url,' . $id,
    //     ], [
    //         // 'name.required' => 'El nombre es obligatorioooooo.',
    //         'name.string' => 'El nombre debe ser una cadena de texto.',
    //         'name.max' => 'El nombre no debe exceder 255 caracteres.',
    //         // 'email.required' => 'El correo electrónico es obligatorio.',
    //         'email.email' => 'El correo electrónico debe ser una dirección válida.',
    //         'email.max' => 'El correo electrónico no debe exceder 255 caracteres.',
    //         'email.unique' => 'El correo electrónico ya ha sido registrado.',
    //         'password.nullable' => 'La contraseña es opcional.',
    //         'password.string' => 'La contraseña debe ser una cadena de texto.',
    //         'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
    //         'password.confirmed' => 'La confirmación de la contraseña no coincide.',
    //         'cellphone.nullable' => 'El teléfono es opcional.',
    //         'cellphone.string' => 'El teléfono debe ser una cadena de texto.',
    //         'cellphone.max' => 'El teléfono no debe exceder 20 caracteres.',
    //         // 'address.required' => 'La dirección es obligatoria.',
    //         'address.string' => 'La dirección debe ser una cadena de texto.',
    //         'address.max' => 'La dirección no debe exceder 255 caracteres.',
    //         // 'categoria_id.required' => 'La categoría es obligatoria.',
    //         'categoria_id.exists' => 'La categoría seleccionada no es válida.',
    //         'profile_picture.image' => 'El archivo debe ser una imagen.',
    //         'profile_picture.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif, svg.',
    //         'profile_picture.max' => 'La imagen no debe exceder los 2048 KB.',
    //         'gallery.array' => 'La galería debe ser un array.',
    //         'gallery.*.image' => 'Cada archivo en la galería debe ser una imagen.',
    //         'gallery.*.mimes' => 'Cada imagen en la galería debe ser de tipo: jpeg, png, jpg, gif, svg.',
    //         'gallery.*.max' => 'Cada imagen en la galería no debe exceder los 2048 KB.',
    //         // 'url.required' => 'El campo URL es obligatorio.',
    //         'url.string' => 'El campo URL debe ser una cadena de texto.',
    //         'url.max' => 'El campo URL no debe exceder los 255 caracteres.',
    //         'url.unique' => 'La URL ya está en uso.',
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json($validator->errors(), 400);
    //     }

    //     $empresa = Empresa::findOrFail($id);

    //     if ($request->password && Hash::check($request->password, $empresa->password)) {
    //         return response()->json([
    //             'errors' => ['password' => ['La nueva contraseña no puede ser la misma que la contraseña actual.']]
    //         ], 422);
    //     }

    //     $empresa->name = $request->name;
    //     $empresa->email = $request->email;

    //     if ($request->password) {
    //         $empresa->password = Hash::make($request->password);
    //     }

    //     $empresa->cellphone = $request->cellphone;
    //     $empresa->address = $request->address;
    //     $empresa->categoria_id = $request->categoria_id;
    //     $empresa->url = $request->url;

    //     if ($request->hasFile('profile_picture')) {
    //         $image = $request->file('profile_picture');
    //         $name = time().'.'.$image->getClientOriginalExtension();
    //         $destinationPath = public_path('/profile_pictures');
    //         $image->move($destinationPath, $name);
    //         $empresa->profile_picture = '/profile_pictures/'.$name;
    //     }

    //     if ($request->hasFile('gallery')) {
    //         $gallery = [];
    //         foreach ($request->file('gallery') as $image) {
    //             $name = time().rand(1,100).'.'.$image->getClientOriginalExtension();
    //             $destinationPath = public_path('/gallery');
    //             $image->move($destinationPath, $name);
    //             $gallery[] = '/gallery/'.$name;
    //         }
    //         $empresa->gallery = json_encode($gallery);
    //     }

    //     $empresa->save();

    //     return response()->json(['message' => 'Empresa actualizada correctamente', 'empresa' => $empresa], 200);
    // }



    // public function updateEmpresa(Request $request, $id)
    // {

    //     $request->validate([
    //         'name' => 'required|string|max:255',
    //         'email' => 'required|email|max:255|unique:empresas,email,' . $id,
    //         'password' => 'nullable|string|min:8|confirmed',
    //         'cellphone' => 'nullable|string|max:15',
    //         'address' => 'required|string|max:255',
    //         'category' => 'required|string|max:255',
    //     ], [
    //         'name.required' => 'El nombre es obligatorio.',
    //         'name.string' => 'El nombre debe ser una cadena de texto.',
    //         'name.max' => 'El nombre no debe exceder 255 caracteres.',
    //         'email.required' => 'El correo electrónico es obligatorio.',
    //         'email.email' => 'El correo electrónico debe ser una dirección válida.',
    //         'email.max' => 'El correo electrónico no debe exceder 255 caracteres.',
    //         'email.unique' => 'El correo electrónico ya ha sido registrado.',
    //         'password.nullable' => 'La contraseña es opcional.',
    //         'password.string' => 'La contraseña debe ser una cadena de texto.',
    //         'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
    //         'password.confirmed' => 'La confirmación de la contraseña no coincide.',
    //         'cellphone.nullable' => 'El teléfono es opcional.',
    //         'cellphone.string' => 'El teléfono debe ser una cadena de texto.',
    //         'cellphone.max' => 'El teléfono no debe exceder 15 caracteres.',
    //         'address.required' => 'La dirección es obligatoria.',
    //         'address.string' => 'La dirección debe ser una cadena de texto.',
    //         'address.max' => 'La dirección no debe exceder 255 caracteres.',
    //         'category.required' => 'La categoría es obligatoria.',
    //         'category.string' => 'La categoría debe ser una cadena de texto.',
    //         'category.max' => 'La categoría no debe exceder 255 caracteres.',
    //     ]);

    //     $empresa = Empresa::findOrFail($id);

    //     if ($request->password && Hash::check($request->password, $empresa->password)) {
    //         return response()->json([
    //             'errors' => ['password' => ['La nueva contraseña no puede ser la misma que la contraseña actual.']]
    //         ], 422);
    //     }

    //     $cliente = Cliente::where('email', $request->email)->first();

    //     if ($cliente) {
    //         return response()->json([
    //             'errors' => ['email' => ['El correo electrónico ya ha sido registrado.']]
    //         ], 422);
    //     }

    //     $empresa->name = $request->name;
    //     $empresa->email = $request->email;

    //     if ($request->password) {
    //         $empresa->password = Hash::make($request->password);
    //     }

    //     $empresa->cellphone = $request->cellphone;
    //     $empresa->address = $request->address;
    //     $empresa->category = $request->category;
    //     $empresa->save();

    //     return response()->json(['message' => 'Empresa actualizada correctamente', 'empresa' => $empresa], 200);
    // }


    public function logout()
    {
        auth()->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }































































    ////////////////////////////////////
    // Quiero que me hagas el registrar empresa para que funcione con el departametno y la ciudad tambien, quiero que al usuario se les muestren todos los departametnos, elija uno y se muestren todas las ciudades de ese departamento 

    public function registerEmpresa22(Request $request)
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

        $agenda = Agenda::create([
            'empresa_id' => $empresa->id,
            'estado' => 'abierta',
        ]);

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
}
