<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Compra;
use App\Models\Cliente;
use App\Models\Empresa;
use App\Models\Producto;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\CompraProducto;
// use App\Models\CompraProducto;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CompraController extends Controller
{

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
    

    
    


    /**
     * Muestra una lista de todas las compras.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $compras = Compra::with(['cliente', 'empresa', 'productos'])->get();
        return response()->json(['compras' => $compras]);
    }

    /**
     * Almacena una nueva compra en la base de datos.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */

     public function store(Request $request)
     {
         $request->validate([
             'cliente_id' => 'required|exists:clientes,id',
             'empresa_id' => 'required|exists:empresas,id',
             'productos' => 'required|array',
             'productos.*.id' => 'required|exists:productos,id',
             'productos.*.cantidad' => 'required|integer|min:1',
         ]);
     
         try {
             $total = 0;
             $compra = new Compra([
                 'cliente_id' => $request->cliente_id,
                 'empresa_id' => $request->empresa_id,
             ]);
     
             foreach ($request->productos as $producto) {
                 $productoModel = Producto::find($producto['id']);
                 
                 // Verificar si hay suficiente stock
                 if ($productoModel->stock < $producto['cantidad']) {
                     return response()->json(['message' => 'No hay suficiente stock para el producto: ' . $productoModel->nombre], 400);
                 }
     
                 $subtotal = $productoModel->precio * $producto['cantidad'];
                 $total += $subtotal;
             }
     
             $compra->total = $total;
             $compra->save();
     
             foreach ($request->productos as $producto) {
                 $productoModel = Producto::find($producto['id']);
     
                 // Restar el stock
                 $productoModel->stock -= $producto['cantidad'];
                 $productoModel->save();
     
                 // Guardar la relación en la tabla pivote
                 $compra->productos()->attach($producto['id'], ['cantidad' => $producto['cantidad'], 'precio' => $productoModel->precio]);
             }
     
             //Descomentar para enviar correos 
             $cliente = Cliente::findOrFail($request->cliente_id);
             // Mail::to($cliente->email)->send(new CompraProducto($compra));
     
             return response()->json(['message' => 'Compra creada correctamente', 'compra' => $compra], 201);
         } catch (\Exception $e) {
             return response()->json(['message' => 'Error al crear la compra', 'error' => $e->getMessage()], 500);
         }
     }
     

//      public function store(Request $request)
// {
//     $request->validate([
//         'cliente_id' => 'required|exists:clientes,id',
//         'empresa_id' => 'required|exists:empresas,id',
//         'productos' => 'required|array',
//         'productos.*.id' => 'required|exists:productos,id',
//         'productos.*.cantidad' => 'required|integer|min:1',
//     ]);

//     try {
//         $total = 0;
//         $compra = new Compra([
//             'cliente_id' => $request->cliente_id,
//             'empresa_id' => $request->empresa_id,
//         ]);

        

//         foreach ($request->productos as $producto) {
//             $productoModel = Producto::find($producto['id']);
            
//             $subtotal = $productoModel->precio * $producto['cantidad'];
//             $total += $subtotal;

//             // return $total;
//             // $compra->productos()->attach($producto['id'], ['cantidad' => $producto['cantidad'], 'precio' => $productoModel->precio]);
//         }

        

//         $compra->total = $total;
//         $compra->save();

//         foreach ($request->productos as $producto) {
//             $productoModel = Producto::find($producto['id']);
            

//             // return $total;
//             $compra->productos()->attach($producto['id'], ['cantidad' => $producto['cantidad'], 'precio' => $productoModel->precio]);
//         }

//         //Descomentar para enviar correos 
//         $cliente = Cliente::findOrFail($request->cliente_id,);
//         // Mail::to($cliente->email)->send(new CompraProducto($compra));

//         return response()->json(['message' => 'Compra creada correctamente', 'compra' => $compra], 201);
//     } catch (\Exception $e) {
//         return response()->json(['message' => 'Error al crear la compra', 'error' => $e->getMessage()], 500);
//     }
// }

    // public function store(Request $request)
    // {

        
    //     $request->validate([
    //         'cliente_id' => 'required|exists:clientes,id',
    //         'empresa_id' => 'required|exists:empresas,id',
    //         'productos' => 'required|array',
    //         'productos.*.id' => 'required|exists:productos,id',
    //         'productos.*.cantidad' => 'required|integer|min:1',
    //     ]);

    //     // return $request; 

    //     try {
    //         $compra = Compra::create([
    //             'cliente_id' => $request->cliente_id,
    //             'empresa_id' => $request->empresa_id,
    //         ]);

    //         foreach ($request->productos as $producto) {
    //             $compra->productos()->attach($producto['id'], ['cantidad' => $producto['cantidad']]);
    //         }

    //         return response()->json(['message' => 'Compra creada correctamente', 'compra' => $compra], 201);
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => 'Error al crear la compra', 'error' => $e->getMessage()], 500);
    //     }
    // }

    /**
     * Muestra los detalles de una compra específica.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $compra = Compra::with(['cliente', 'empresa', 'productos'])->find($id);

        if (!$compra) {
            return response()->json(['message' => 'Compra no encontrada'], 404);
        }

        return response()->json(['compra' => $compra]);
    }

    /**
     * Actualiza una compra existente en la base de datos.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'empresa_id' => 'required|exists:empresas,id',
            'productos' => 'required|array',
            'productos.*.id' => 'required|exists:productos,id',
            'productos.*.cantidad' => 'required|integer|min:1',
        ]);

        try {
            $compra = Compra::find($id);

            if (!$compra) {
                return response()->json(['message' => 'Compra no encontrada'], 404);
            }

            $compra->update([
                'cliente_id' => $request->cliente_id,
                'empresa_id' => $request->empresa_id,
            ]);

            // Actualizar productos asociados
            $compra->productos()->detach();
            foreach ($request->productos as $producto) {
                $compra->productos()->attach($producto['id'], ['cantidad' => $producto['cantidad']]);
            }

            return response()->json(['message' => 'Compra actualizada correctamente', 'compra' => $compra]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al actualizar la compra', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Elimina una compra específica de la base de datos.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        try {
            $compra = Compra::find($id);

            if (!$compra) {
                return response()->json(['message' => 'Compra no encontrada'], 404);
            }

            $compra->productos()->detach(); // Eliminar relaciones con productos
            $compra->delete();

            return response()->json(['message' => 'Compra eliminada correctamente']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar la compra', 'error' => $e->getMessage()], 500);
        }
    }


    public function getComprasEmpresa($id)
    {
        try {
            // Obtén todas las compras que pertenecen a la empresa con el ID proporcionado,
            // incluyendo los detalles de los productos asociados.
            $compras = Compra::with(['productos']) // Asumiendo que 'productos' es el nombre de la relación en el modelo Compra.
                         ->where('empresa_id', $id)
                         ->get();
    
            return response()->json($compras);
        } catch (\Exception $e) {
            // Manejar errores si ocurre alguna excepción
            return response()->json(['error' => 'Error al obtener compras: ' . $e->getMessage()], 500);
        }
    }

    public function getVentasEmpresa(Request $request, $empresaId)
    {
        try {
            $empresa = Empresa::findOrFail($empresaId);
            $query = Compra::with(['cliente', 'productos'])->where('empresa_id', $empresaId);

            // Aplicar filtros de fecha si existen
            if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
                $fechaInicio = Carbon::parse($request->input('fecha_inicio'));
                $fechaFin = Carbon::parse($request->input('fecha_fin'));
                $query->whereBetween('created_at', [$fechaInicio, $fechaFin]);
            }

            $compras = $query->get();

            return response()->json(['empresa' => $empresa, 'ventas' => $compras]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener las ventas: ' . $e->getMessage()], 500);
        }
    }
    // getVentasEmpresaCliente

    public function getVentasEmpresaCliente(Request $request, $empresaId, $clienteId)
    {
        try {
            // Obtener la empresa
            $empresa = Empresa::findOrFail($empresaId);
    
            // Crear la consulta para obtener las compras de la empresa y el cliente específico
            $query = Compra::with(['cliente', 'productos'])
                ->where('empresa_id', $empresaId)
                ->where('cliente_id', $clienteId); // Filtrar por cliente
    
            // Aplicar filtros de fecha si existen
            if ($request->has('fecha_inicio') && $request->has('fecha_fin')) {
                $fechaInicio = Carbon::parse($request->input('fecha_inicio'));
                $fechaFin = Carbon::parse($request->input('fecha_fin'));
                $query->whereBetween('created_at', [$fechaInicio, $fechaFin]);
            }
    
            // Ejecutar la consulta
            $compras = $query->get();
    
            // Retornar la respuesta en formato JSON
            return response()->json(['empresa' => $empresa, 'ventas' => $compras]);
        } catch (\Exception $e) {
            // Manejar cualquier excepción que pueda ocurrir
            return response()->json(['error' => 'Error al obtener las ventas: ' . $e->getMessage()], 500);
        }
    }
    

    public function getComprasCliente($id)
    {
        try {
            $compras = Compra::with(['productos', 'empresa:id,name,url']) // Asegúrate de cargar las relaciones necesarias
                             ->where('cliente_id', $id)
                             ->get();
    
            return response()->json(['compras' => $compras]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener compras: ' . $e->getMessage()], 500);
        }
    }


    public function getComprasClienteEnEmpresa(Request $request)
{
    $empresaId = $request->input('empresaId');
    $clienteId = $request->input('clienteId');

    // return $request->empresa_id;
    try {
        $compras = Compra::with(['productos', 'empresa:id,name,url']) // Carga las relaciones necesarias
                         ->where('cliente_id', $clienteId)
                         ->whereHas('empresa', function($query) use ($empresaId) {
                             $query->where('id', $empresaId);
                         })
                         ->get();

        return response()->json(['compras' => $compras]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Error al obtener compras: ' . $e->getMessage()], 500);
    }
}

    
    

}
