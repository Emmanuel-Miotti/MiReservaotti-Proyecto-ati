<?php

// app/Http/Controllers/ProductoController.php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Compra;
use App\Models\CompraProducto;
// use App\Mail\CompraProducto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProductoController extends Controller
{
    public function getProductosByCliente($idCliente, $idEmpresa)
    {
        try {
            Log::info("Inicio de la función getProductosByCliente - Cliente ID: $idCliente, Empresa ID: $idEmpresa");
    
            // Obtener las compras realizadas por el cliente en la empresa especificada
            $compras = Compra::where('cliente_id', $idCliente)
                ->where('empresa_id', $idEmpresa)
                ->get();
    
            Log::info("Compras obtenidas: " . $compras->count());
    
            if ($compras->isEmpty()) {
                return response()->json([
                    'data' => [],
                    'message' => 'No se encontraron compras para este cliente en la empresa especificada.',
                ], 404);
            }
    
            // Obtener todos los productos de las compras realizadas
            $productos = [];
            foreach ($compras as $compra) {
                $productosDeCompra = CompraProducto::with('producto')  // Aquí cargamos la relación con el producto completo
                    ->where('compra_id', $compra->id)
                    ->get();
    
                foreach ($productosDeCompra as $productoCompra) {
                    $producto = $productoCompra->producto;  // Obtenemos el modelo Producto asociado
                    $producto->cantidad = $productoCompra->cantidad; // Añadimos la cantidad comprada
                    $producto->precio_compra = $productoCompra->precio; // Añadimos el precio al que fue comprado
                    $productos[] = $producto;
                }
            }
    
            Log::info("Productos obtenidos: " . count($productos));
    
            return response()->json([
                'data' => $productos,
                'message' => 'Productos obtenidos con éxito.',
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error al obtener los productos: ' . $e->getMessage());
    
            return response()->json([
                'message' => 'Error al obtener los productos: ' . $e->getMessage(),
            ], 500);
        }
    }
    

    // public function getProductosByCliente($idCliente, $idEmpresa)
    // {
    //     try {
    //         Log::info("Inicio de la función getProductosByCliente - Cliente ID: $idCliente, Empresa ID: $idEmpresa");

    //         $compras = Compra::where('cliente_id', $idCliente)
    //             ->where('empresa_id', $idEmpresa)
    //             ->get();

    //         Log::info("Compras obtenidas: " . $compras->count());

    //         if ($compras->isEmpty()) {
    //             return response()->json([
    //                 'data' => [],
    //                 'message' => 'No se encontraron compras para este cliente en la empresa especificada.',
    //             ], 404);
    //         }

    //         $productos = [];
    //         foreach ($compras as $compra) {
    //             $productosDeCompra = CompraProducto::where('compra_id', $compra->id)->get();
    //             foreach ($productosDeCompra as $producto) {
    //                 $productos[] = $producto;
    //             }
    //         }

    //         Log::info("Productos obtenidos: " . count($productos));

    //         return response()->json([
    //             'data' => $productos,
    //             'message' => 'Productos obtenidos con éxito.',
    //         ], 200);
    //     } catch (\Exception $e) {
    //         Log::error('Error al obtener los productos: ' . $e->getMessage());

    //         return response()->json([
    //             'message' => 'Error al obtener los productos: ' . $e->getMessage(),
    //         ], 500);
    //     }
    // }


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

    public function getProductosActivosEmpresa($empresa_id)
{
    try {
        $productos = Producto::where('empresa_id', $empresa_id)
            ->where('estado', 'activo')  // Filtra solo los productos activos
            ->get()
            ->map(function ($producto) {
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
    // Validación de la solicitud con mensajes de error personalizados
    $validator = Validator::make($request->all(), [
        'empresa_id' => 'required|exists:empresas,id',
        'nombre' => 'required|string|max:255',
        'descripcion' => 'nullable|string',
        'precio' => 'required|numeric|min:0',
        'stock' => 'required|integer|min:0',
        'estado' => 'required|in:activo,inactivo',
        'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ], [
        'empresa_id.required' => 'El campo empresa es obligatorio.',
        'empresa_id.exists' => 'La empresa seleccionada no es válida.',
        'nombre.required' => 'El campo nombre es obligatorio.',
        'nombre.string' => 'El nombre debe ser una cadena de caracteres.',
        'nombre.max' => 'El nombre no puede tener más de 255 caracteres.',
        'descripcion.string' => 'La descripción debe ser una cadena de caracteres.',
        'precio.required' => 'El campo precio es obligatorio.',
        'precio.numeric' => 'El precio debe ser un número.',
        'precio.min' => 'El precio debe ser un valor positivo.',
        'stock.required' => 'El campo stock es obligatorio.',
        'stock.integer' => 'El stock debe ser un número entero.',
        'stock.min' => 'El stock no puede ser un valor negativo.',
        'estado.required' => 'El campo estado es obligatorio.',
        'estado.in' => 'El estado debe ser "activo" o "inactivo".',
        'foto.image' => 'El archivo debe ser una imagen.',
        'foto.mimes' => 'La imagen debe ser de tipo jpeg, png, jpg o gif.',
        'foto.max' => 'La imagen no debe ser mayor a 2MB.',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 400);
    }

    $data = $request->all();

    if ($request->hasFile('foto')) {
        $path = $request->file('foto')->store('public/fotos');
        $data['foto'] = $path;
    }

    $producto = Producto::create($data);

    return response()->json(['message' => 'Producto creado exitosamente', 'producto' => $producto], 201);
}



    // public function store(Request $request)
    // {
    //     // return $request;
    //     $validator = Validator::make($request->all(), [
    //         'empresa_id' => 'required|exists:empresas,id',
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

    //     $data = $request->all();

    //     if ($request->hasFile('foto')) {
    //         $path = $request->file('foto')->store('public/fotos');
    //         $data['foto'] = $path;
    //     }

    //     $producto = Producto::create($data);

    //     return response()->json(['message' => 'Producto creado exitosamente', 'producto' => $producto], 201);
    // }

    public function show($id)
    {
        $producto = Producto::findOrFail($id);
        return response()->json($producto);
    }


    public function update(Request $request, $id)
    {
        // Buscar el producto por ID
        $producto = Producto::find($id);
    
        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }
    
        // Validar los datos de la solicitud con mensajes personalizados
        $validator = Validator::make($request->all(), [
            'empresa_id' => 'required|exists:empresas,id',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'precio' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'estado' => 'required|in:activo,inactivo',
            // No se permite la edición de la foto
        ], [
            'empresa_id.required' => 'El campo empresa es obligatorio.',
            'empresa_id.exists' => 'La empresa seleccionada no es válida.',
            'nombre.required' => 'El campo nombre es obligatorio.',
            'nombre.string' => 'El nombre debe ser una cadena de caracteres.',
            'nombre.max' => 'El nombre no puede tener más de 255 caracteres.',
            'descripcion.string' => 'La descripción debe ser una cadena de caracteres.',
            'precio.required' => 'El campo precio es obligatorio.',
            'precio.numeric' => 'El precio debe ser un número.',
            'precio.min' => 'El precio debe ser un valor positivo.',
            'stock.required' => 'El campo stock es obligatorio.',
            'stock.integer' => 'El stock debe ser un número entero.',
            'stock.min' => 'El stock no puede ser un valor negativo.',
            'estado.required' => 'El campo estado es obligatorio.',
            'estado.in' => 'El estado debe ser "activo" o "inactivo".',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }
    
        // Actualizar solo los campos permitidos
        $producto->update($request->except('foto'));
    
        return response()->json(['message' => 'Producto actualizado exitosamente', 'producto' => $producto], 200);
    }

    

//     public function update(Request $request, $id)
// {   
//     $validator = Validator::make($request->all(), [
//         'nombre' => 'required|string|max:255',
//         'descripcion' => 'nullable|string',
//         'precio' => 'required|numeric|min:0',
//         'stock' => 'required|integer|min:0',
//         'estado' => 'required|in:activo,inactivo',
//         'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
//     ]);

//     if ($validator->fails()) {
//         return response()->json(['errors' => $validator->errors()], 400);
//     }

//     $producto = Producto::findOrFail($id);

//     try {
//         $data = $validator->validated();

//         // Manejar la subida de la foto
//         if ($request->hasFile('foto')) {
//             $file = $request->file('foto');
//             $path = $file->store('public/fotos');
//             $data['foto'] = $path;
//         }

//         $producto->update($data);

//         return response()->json(['message' => 'Producto actualizado exitosamente', 'producto' => $producto], 200);
//     } catch (\Exception $e) {
//         return response()->json(['error' => 'Error al actualizar el producto'], 500);
//     }
// }


    // public function update(Request $request)
    // {   
    //     // return $request;
    //     $validator = Validator::make($request->all(), [
    //         'nombre' => 'required|string|max:255',
    //         'descripcion' => 'nullable|string',
    //         'precio' => 'required|numeric|min:0',
    //         'stock' => 'required|integer|min:0',
    //         'estado' => 'required|in:activo,inactivo',
    //         'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Validación para la foto
    //     ]);

    //     $producto = Producto::findOrFail($request->id);

    //     try {
    //         // $data = $validator->validated();

    //         // Manejar la subida de la foto
    //         // if ($request->hasFile('foto')) {
    //         //     $file = $request->file('foto');
    //         //     $path = $file->store('public/fotos');
    //         //     $data['foto'] = $path;
    //         // }

    //         $producto->update($validator);

    //         return response()->json(['message' => 'Producto actualizado exitosamente', 'producto' => $producto], 200);
    //     } catch (\Exception $e) {
    //         return response()->json(['error' => 'Error al actualizar el producto'], 500);
    //     }
    // }


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
