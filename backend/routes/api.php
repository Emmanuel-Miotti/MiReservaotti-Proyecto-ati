<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Client\EmpresaController as EmpresaClient;
use App\Http\Controllers\Api\FrontController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AgendaController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\ServicioController;
use App\Http\Controllers\EmpresaController;
use App\Http\Controllers\IntervaloController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\CompraController;
use App\Http\Controllers\MercadoPagoController;
use App\Http\Controllers\WhatsAppController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\FavoritoController;
use App\Http\Controllers\DepartamentoController; 
use App\Http\Controllers\CiudadController;
use App\Http\Controllers\ListaEsperaController;
use App\Http\Controllers\FidelizacionController;


// Route::prefix('v1')->middleware(['cors'])->group(function () {
Route::prefix('v1')->group(function () {

    // Rutas públicas
    Route::post('/auth/register-cliente', [AuthController::class, 'registerCliente']);
    Route::post('/auth/register-empresa', [AuthController::class, 'registerEmpresa']);
    Route::post('/auth/login', [AuthController::class, 'loginByEmail']);

    // Rutas protegidas
    Route::middleware('auth:sanctum')->group(function () {



        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        // Rutas de administración
        Route::apiResource('/admin/user', UserController::class);
    });

    // Rutas específicas de cliente
    Route::middleware('auth:sanctum')->get('/auth/client/{id}', [AuthController::class, 'getClientById']);


    Route::middleware('auth:sanctum')->group(function () {
        // Route::put('/cliente/{id}', [AuthController::class, 'updateCliente']);
        Route::get('/cliente/{id}', [UserController::class, 'getUserById']);
    });
    // Otras rutas públicas o específicas de empresa aquí...
    // Route::middleware('auth:sanctum')->group(function () {
        Route::post('/empresa/{id}', [AuthController::class, 'updateEmpresa']);
        Route::put('/empresa/{id}', [AuthController::class, 'updateEmpresaapp']);
        // Route::get('/empresa/{id}', [UserController::class, 'getEmpresaById']);

    // });

    //----------------------- FAVORITOS
    
    Route::post('/favoritos', [FavoritoController::class, 'agregarFavorito']);
    Route::get('/favoritos/{cliente_id}', [FavoritoController::class, 'listarFavoritos']);
    Route::delete('/favoritos/{id}', [FavoritoController::class, 'eliminarFavorito']);


    Route::post('/empresa/{id}/profile-picture', [AuthController::class, 'updateProfilePicture']);
    Route::post('/gallery/{id}', [AuthController::class, 'updateGallery']);
    Route::post('/galleryDelete/{id}', [AuthController::class, 'deleteGalleryImage']);

    //------------------------ CLIENTE   ------------------------

    Route::post('/cliente/{id}', [AuthController::class, 'updateCliente']);
    Route::put('/cliente/{id}', [AuthController::class, 'updateClienteApp']);

    //------------------------    ------------------------
    Route::post('/categoria', [EmpresaController::class, 'crearCategoria']);
    Route::post('/agenda', [AgendaController::class, 'store']);
    Route::post('/intervalo', [IntervaloController::class, 'store']);


    //-------------------------- CATEGORIA ----------------------------
    Route::get('/categorias', [CategoriaController::class, 'index']);
    Route::post('/categorias', [CategoriaController::class, 'store']);
    Route::get('/categorias/{id}', [CategoriaController::class, 'show']);
    Route::put('/categorias/{id}', [CategoriaController::class, 'update']);
    Route::delete('/categorias/{id}', [CategoriaController::class, 'destroy']);


    //------------------------  EMPRESAS  ------------------------
    Route::get('/empresas', [EmpresaController::class, 'index']);
    Route::get('/verempresa/{id}', [EmpresaController::class, 'getEmpresaId']);
    Route::get('/verempresa2/{id}', [EmpresaController::class, 'getEmpresaId2']);
    Route::get('/empresa/url/{url}', [EmpresaController::class, 'getEmpresaUrl']);
    Route::get('/empresa/servicios/{id}', [EmpresaController::class, 'getServiciosEmpresaById']);
    // getIntervalosPorEmpresa



    //------------------------  SERVICIOS  ------------------------
    Route::get('/servicios', [ServicioController::class, 'index']);
    Route::post('/servicios', [ServicioController::class, 'store']);
    Route::get('/servicios/{id}', [ServicioController::class, 'show']);
    Route::get('/servicio/{id}', [ServicioController::class, 'getServicesById']);
    Route::put('/servicios/{id}', [ServicioController::class, 'update']);
    Route::delete('/servicios/{id}', [ServicioController::class, 'destroy']);
    //Servicios de la empresa
    Route::get('/servicios/empresa/{id}', [ServicioController::class, 'getServicesByEmpresa']);
    Route::post('/servicios/by-ids', [ServicioController::class, 'getServiciosByIds']);
    Route::get('/serviciosActivos/empresa/{id}', [ServicioController::class, 'getServicesActivosByEmpresa']);
    //Desactivar servicio
    Route::put('/servicios/{id}/desactivar', [ServicioController::class, 'desactivar']);
    Route::put('/servicios/{id}/activar', [ServicioController::class, 'activar']);


    //------------------------  RESERVA ------------------------
    Route::get('/reservas', [ReservaController::class, 'index']);
    Route::post('/reservas', [ReservaController::class, 'store']);
    Route::post('/reservas/usuarioNoRegistrado', [ReservaController::class, 'storeUsuarioNoRegistrado']);
    Route::post('/reservas/usuarioNoRegistradoPocosDatos', [ReservaController::class, 'storeUsuarioNoRegistradoPocosDatos']);

    Route::put('/reservas/{id}/cancelar', [ReservaController::class, 'cancelarReserva']);
    Route::get('/reservas/dia', [ReservaController::class, 'getReservasPorDia']);
    Route::get('/clientes/{cliente_id}/reservas', [ReservaController::class, 'obtenerReservasPorCliente']);

    Route::get('/reservas/empresa/{empresa_id}', [ReservaController::class, 'obtenerReservasPorEmpresa']);
    Route::get('/reservas2/empresa/{empresa_id}', [ReservaController::class, 'obtenerReservasUsuarioNoRegistradoPorEmpresa']);

    Route::put('/reservas/{id}', [ReservaController::class, 'update']);
    Route::delete('/reservas/{id}', [ReservaController::class, 'destroy']);
    Route::delete('/reservasUsuarioNoRegistrado/{id}', [ReservaController::class, 'destroyreservasUsuarioNoRegistrado']);

    //Agregado por mi Emmanuel
    // Rutas para reservas de usuarios registrados
    Route::put('/reservas/{id}', [ReservaController::class, 'updateReservaConCliente']);

    // Rutas para reservas de usuarios no registrados
    Route::put('/reservasUsuarioNoRegistrado/{id}', [ReservaController::class, 'updateReservaSinCliente']);

    Route::middleware('auth:sanctum')->get('/mis-reservas', [ReservaController::class, 'misReservas']);

    Route::get('/reservas/{id}', [ReservaController::class, 'getReservasByCliente']);
    Route::post('/cancelar-reserva/{id}', [ReservaController::class, 'cancelarReserva']);

    Route::get('/mis-reservas', [ReservaController::class, 'misReservas']);

    //-------------------------- INTERVALO ----------------------------
    Route::get('/intervalos/empresa/{id}', [IntervaloController::class, 'getIntervalosPorEmpresa']);
    Route::get('/intervalos/empresa/reserva/hola', [IntervaloController::class, 'intervaloReserva']);
    Route::post('/intervalos/empresa/horasdisponibles', [IntervaloController::class, 'getHorasDisponibles']);
    Route::post('/intervalos', [IntervaloController::class, 'store']);
    Route::put('/intervalos/{id}', [IntervaloController::class, 'update']);
    Route::delete('/intervalos/{id}', [IntervaloController::class, 'destroy']);

    Route::delete('intervalos/{id}', [IntervaloController::class, 'destroy']);



    //------------------------  PRODUCTOS  ------------------------
    Route::resource('productos', ProductoController::class);
    Route::get('/empresas/{empresa_id}/productos', [ProductoController::class, 'getProductosEmpresa']);
    Route::get('/empresas/{empresa_id}/productosActivos', [ProductoController::class, 'getProductosActivosEmpresa']);
    Route::post('/productos/{empresa_id}', [ProductoController::class, 'store']);
    Route::put('/productos/{id}', [ProductoController::class, 'update']);


    Route::apiResource('compras', CompraController::class);
    // Route::put('/comprarProducto', [CompraController::class); 

    Route::get('empresa/compras/{empresa_id}', [CompraController::class, 'getComprasEmpresa']);
    Route::get('cliente/{id}/compras', [CompraController::class, 'getComprasCliente']);
    Route::post('/comprasEnEmpresa', [CompraController::class, 'getComprasClienteEnEmpresa']);
    Route::get('/empresa/{empresaId}/ventas', [CompraController::class, 'getVentasEmpresa']);
    Route::get('/empresa/{empresaId}/ventas/{clienteId}', [CompraController::class, 'getVentasEmpresaCliente']);


    Route::post('/mercadopago/create_preference', [MercadoPagoController::class, 'createPreference']);

    // -------------------------RESERVAS POR WHATSAPP --------------------
    Route::get('/recordatorio-whatsapp', [WhatsAppController::class, 'enviarRecordatorio']);

    // Route::get('/webhook', [WhatsAppController::class, 'verify']);
    // Route::post('/webhook', [WhatsAppController::class, 'handle']);
    Route::get('/webhook', [WhatsAppController::class, 'webhook']);
    Route::post('/webhook', [WhatsAppController::class, 'recibe']);

    //Route::get('/webhook', [WhatsAppController::class, 'verify']);
    // Route::post('/webhook', [WhatsAppController::class, 'handle']);

    //---------------------------- REVIEW --------------------------------

   
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('reviews/{id}', [ReviewController::class, 'update']);
    Route::get('/empresa/{empresaId}/reviews', [ReviewController::class, 'index']);
    Route::prefix('api/v1')->group(function () {
        Route::get('/empresa/reviews/{empresaId}', [ReviewController::class, 'index2']);
    });
    



    //------------------------  Departamentos y ciudades   ------------------------

    Route::apiResource('departamentos', DepartamentoController::class);
    Route::apiResource('ciudades', CiudadController::class);


    Route::get('/departamento/ciudades/{id}', [CiudadController::class, 'ciudadesPorDepartamento']);


    //-------------------------GESTION DE CLIENTES ------------
    Route::get('/empresas/{id}/clientes', [EmpresaController::class, 'getClientesByEmpresa']);
    Route::get('clientes/{clienteId}/empresas/{empresaId}/reservas', [ReservaController::class, 'getReservasPorClienteYEmpresa']);






        //------------------------LISTA DE ESPERA ------------

Route::post('/lista-espera', [ListaEsperaController::class, 'inscribirListaEspera2']);
Route::get('/verificar-disponibilidad', [ListaEsperaController::class, 'verificarDisponibilidad']);


    Route::get('/productos/{idCliente}/empresa/{idEmpresa}', [ProductoController::class, 'getProductosByCliente']);

    // ----- Ver empresa -----------
    Route::get('reservas/{empresaId}/{clienteId}', [ReservaController::class, 'getReservasPorEmpresaYCliente']);


    Route::resource('fidelizacion', FidelizacionController::class);
    Route::get('fidelizacion/empresa/{empresa_id}', [FidelizacionController::class, 'index']);


 


});
