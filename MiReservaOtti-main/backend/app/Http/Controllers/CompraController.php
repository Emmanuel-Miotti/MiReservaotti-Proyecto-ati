<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Compra;
use App\Models\CompraProducto;
use App\Models\Cliente;
use App\Models\Empresa;
use App\Models\Producto;

class CompraController extends Controller
{
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
            
            $subtotal = $productoModel->precio * $producto['cantidad'];
            $total += $subtotal;

            // return $total;
            // $compra->productos()->attach($producto['id'], ['cantidad' => $producto['cantidad'], 'precio' => $productoModel->precio]);
        }

        

        $compra->total = $total;
        $compra->save();

        return response()->json(['message' => 'Compra creada correctamente', 'compra' => $compra], 201);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Error al crear la compra', 'error' => $e->getMessage()], 500);
    }
}

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
    

}
