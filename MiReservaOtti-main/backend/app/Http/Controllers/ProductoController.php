<?php

// app/Http/Controllers/ProductoController.php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ProductoController extends Controller
{
    public function index()
    {
        $productos = Producto::all()->map(function ($producto) {
            $producto->foto_url = $producto->foto ? Storage::url($producto->foto) : null;
            return $producto;
        });
        return response()->json($productos);
    }

    public function getProductosEmpresa($empresa_id)
    {
        try {
            $productos = Producto::where('empresa_id', $empresa_id)->get()->map(function ($producto) {
                $producto->foto_url = $producto->foto ? Storage::url($producto->foto) : null;
                return $producto;
            });
            return response()->json($productos, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener productos de la empresa'], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'precio' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'estado' => 'required|in:activo,inactivo',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validación para la foto
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $data = $request->all();

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('public/fotos');
            $data['foto'] = $path;
        }

        $producto = Producto::create($data);

        return response()->json(['message' => 'Producto creado exitosamente', 'producto' => $producto], 201);
    }

    public function show($id)
    {
        $producto = Producto::findOrFail($id);
        return response()->json($producto);
    }


    public function update(Request $request)
    {
        
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'precio' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'estado' => 'required|in:activo,inactivo',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validación para la foto
        ]);

        $producto = Producto::findOrFail($request->id);

        try {
            // $data = $validator->validated();

            // Manejar la subida de la foto
            // if ($request->hasFile('foto')) {
            //     $file = $request->file('foto');
            //     $path = $file->store('public/fotos');
            //     $data['foto'] = $path;
            // }

            $producto->update($validator);

            return response()->json(['message' => 'Producto actualizado exitosamente', 'producto' => $producto], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al actualizar el producto'], 500);
        }
    }


    // public function update(Request $request, $id)
    // {
    //     // return $request->all();
    //     $validator = Validator::make($request->all(), [
    //         'nombre' => 'required|string|max:255',
    //         'descripcion' => 'nullable|string',
    //         'precio' => 'required|numeric|min:0',
    //         'stock' => 'required|integer|min:0',
    //         'estado' => 'required|in:activo,inactivo',
    //         'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validación para la foto
    //     ]);

    //     if ($validator->fails()) {
    //         return response()->json($validator->errors(), 400);
    //     }

    //     $producto = Producto::findOrFail($id);

    //     try{
    //         $producto->update($validator);
    //         return response()->json(['message' => 'Producto actualizado exitosamente', 'producto' => $producto], 200);
    //     }catch(\Exception $e){
    //         return response()->json(['error' => 'Error al actualizar el producto'], 500);
    //     }

    // }

    public function destroy($id)
    {
        $producto = Producto::findOrFail($id);

        // Eliminar la foto asociada si existe
        if ($producto->foto) {
            Storage::delete($producto->foto);
        }

        $producto->delete();

        return response()->json(['message' => 'Producto eliminado exitosamente'], 200);
    }

    // public function validarStock($id)
    // {
    //     $producto = Producto::findOrFail($id);

    //     if ($prodcuto) {

    //     } else {
    //         return response()->json(['message' => 'Producto eliminado exitosamente'], 200);
    //     }

    //     return response()->json($producto);
    // }


}


// app/Http/Controllers/ProductoController.php



// namespace App\Http\Controllers;

// use App\Models\Producto;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Validator;
// use Illuminate\Support\Facades\Storage;

// class ProductoController extends Controller
// {
//     public function index()
//     {
//         $productos = Producto::all()->map(function ($producto) {
//             $producto->foto_url = $producto->foto ? Storage::url($producto->foto) : null;
//             return $producto;
//         });
//         return response()->json($productos);
//     }

//     public function getProductosEmpresa($empresa_id)
//     {
//         try {
//             $productos = Producto::where('empresa_id', $empresa_id)->get();
//             return response()->json($productos, 200);
//         } catch (\Exception $e) {
//             return response()->json(['error' => 'Error al obtener productos de la empresa'], 500);
//         }
//     }

//     public function store(Request $request)
//     {
//         // return $request;
//         $validator = Validator::make($request->all(), [
//             'empresa_id' => 'required|exists:empresas,id',
//             'nombre' => 'required|string|max:255',
//             'descripcion' => 'nullable|string',
//             'precio' => 'required|numeric|min:0',
//             'stock' => 'required|integer|min:0',
//             'estado' => 'required|in:activo,inactivo',
//             'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validación para la foto
//         ]);

//         if ($validator->fails()) {
//             return response()->json($validator->errors(), 400);
//         }

//         $data = $request->all();

//         if ($request->hasFile('foto')) {
//             $path = $request->file('foto')->store('public/fotos');
//             $data['foto'] = $path;
//         }

//         $producto = Producto::create($data);

//         return response()->json(['message' => 'Producto creado exitosamente', 'producto' => $producto], 201);
//     }

//     public function show($id)
//     {
//         $producto = Producto::findOrFail($id);
//         return response()->json($producto);
//     }

//     public function update(Request $request, $id)
//     {
//         $validator = Validator::make($request->all(), [
//             'nombre' => 'required|string|max:255',
//             'descripcion' => 'nullable|string',
//             'precio' => 'required|numeric|min:0',
//             'stock' => 'required|integer|min:0',
//             'estado' => 'required|in:activo,inactivo',
//             'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validación para la foto
//         ]);

//         if ($validator->fails()) {
//             return response()->json($validator->errors(), 400);
//         }

//         $producto = Producto::findOrFail($id);

//         $data = $request->all();

//         if ($request->hasFile('foto')) {
//             // Eliminar la foto antigua si existe
//             if ($producto->foto) {
//                 Storage::delete($producto->foto);
//             }
//             $path = $request->file('foto')->store('public/fotos');
//             $data['foto'] = $path;
//         }

//         $producto->update($data);

//         return response()->json(['message' => 'Producto actualizado exitosamente', 'producto' => $producto], 200);
//     }

//     public function destroy($id)
//     {
//         $producto = Producto::findOrFail($id);

//         // Eliminar la foto asociada si existe
//         if ($producto->foto) {
//             Storage::delete($producto->foto);
//         }

//         $producto->delete();

//         return response()->json(['message' => 'Producto eliminado exitosamente'], 200);
//     }
// }
