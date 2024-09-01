import axios from "axios";

// const base_api_url = "https://backend.mireservaotti.online/api/v1";

// const base_api_url = "https://support.mireservaotti.online/api/v1";

const base_api_url = "http://127.0.0.1:8000/api/v1";

// Configuración por defecto para Axios
axios.defaults.withCredentials = true; 
// Interceptor para agregar el token de autorización a las solicitudes
axios.interceptors.request.use(async (config) => {
  const authToken = await localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute("content");
  if (csrfToken) {
    config.headers["X-CSRF-TOKEN"] = csrfToken;
  } else {
    console.warn("CSRF token not found in meta tag");
  }
  return { ...config, headers };
});

const Config = {

  url: () => `http://127.0.0.1:8000/api/v1`,
  urlFoto: () => `http://127.0.0.1:8000`,


  // url: () => `https://support.mireservaotti.online/api/v1`,
  // urlFoto: () => `https://support.mireservaotti.online`,
  // url: () => `https://backend.mireservaotti.online/api/v1`,
  // urlFoto: () => `https://backend.mireservaotti.online`,
  registerCliente: (dato) =>
    axios.post(`${base_api_url}/auth/register-cliente`, dato),
  registerEmpresa: (dato) =>
    axios.post(`${base_api_url}/auth/register-empresa`, dato),
  login: (dato) => axios.post(`${base_api_url}/auth/login`, dato),
  getLogout: () => axios.post(`${base_api_url}/auth/logout`),

  //------------------------ CLIENTE ------------------------
  editCliente: (id, data) => axios.put(`${base_api_url}/cliente/${id}`, data),
  getCliente: (id) => axios.get(`${base_api_url}/cliente/${id}`),

  //------------------------ EMPRESA ------------------------
  getEmpresas: () => axios.get(`${base_api_url}/empresas`), // Obtener todas las empresas sin headers de autorización
  editEmpresa: (id, data) => axios.put(`${base_api_url}/empresa/${id}`, data), // Editar empresa por id y data con headers de autorización de token de usuario logueado en el sistema
  getEmpresa: (id) => axios.get(`${base_api_url}/empresa/${id}`), // Obtener empresa por id con headers de autorización de token de usuario logueado en el sistema
  getEmpresaId: (id) => axios.get(`${base_api_url}/verempresa/${id}`), // Obtener empresa por id sin headers de autorización
  getEmpresaId2: (id) => axios.get(`${base_api_url}/verempresa2/${id}`), // Obtener empresa por id sin headers de autorización
  getEmpresaUrl: (url) => axios.get(`${base_api_url}/empresa/url/${url}`), // Obtener empresa por id sin headers de autorización

  //------------------------ INTERVALOS ------------------------
  getIntervalosEmpresa: (id) =>
    axios.get(`${base_api_url}/intervalos/empresa/${id}`), // Obtener empresa por id sin headers de autorización

  //------------------------ CATEGORIA ------------------------
  getCategorias: () => axios.get(`${base_api_url}/categorias`),

  //------------------------ SERVICIOS ------------------------
  // Crear servicio
  createService: (data) => axios.post(`${base_api_url}/servicios`, data),

  // Obtener todos los servicios
  getServices: () => axios.get(`${base_api_url}/servicios`),

  getServicio: (id) => axios.get(`${base_api_url}/servicio/${id}`),

  // Obtener servicios por empresa
  getServicesByEmpresa: (id) =>
    axios.get(`${base_api_url}/servicios/empresa/${id}`),

  getServicesActivosByEmpresa: (id) =>
    axios.get(`${base_api_url}/serviciosActivos/empresa/${id}`),

  // Obtener un servicio por ID
  getServiceById: (id) => axios.get(`${base_api_url}/servicios/${id}`),

  // Actualizar un servicio
  updateService: (id, data) =>
    axios.put(`${base_api_url}/servicios/${id}`, data),

  // Eliminar un servicio
  deleteService: (id) => axios.delete(`${base_api_url}/servicios/${id}`),

  // Desactivar servicio
  desactivarService: (id) =>
    axios.put(`${base_api_url}/servicios/${id}/desactivar`),

  activarServicio: (id) => axios.put(`${base_api_url}/servicios/${id}/activar`),
  //------------------------  RESERVA ------------------------
  getReservas: () => axios.get(`${base_api_url}/reservas`),
  createReserva: (data) => axios.post(`${base_api_url}/reservas`, data),
  updateReserva: (id, data) =>
    axios.put(`${base_api_url}/reservas/${id}`, data),
  //---------------------------EDITAR ------------------------
  // Con Usuario
  editReserva: (id, data) => axios.put(`${base_api_url}/reservas/${id}`, data),
  // Sin Usuario
  editReservaSinUsuario: (id, data) =>
    axios.put(`${base_api_url}/reservasUsuarioNoRegistrado/${id}`, data),

  //---------------------------DELETE ------------------------
  // Con Usuario
  deleteReserva: (id) => axios.delete(`${base_api_url}/reservas/${id}`),
  // Sin Usuario
  deleteReservaSinUsuario: (id) =>
    axios.delete(`${base_api_url}/reservasUsuarioNoRegistrado/${id}`),
  //---------------------------GET --------------------------
  getReserva: (id) => axios.get(`${base_api_url}/reservas/${id}`),
  //Con Usuario
  getReservasEmpresa: (id) =>
    axios.get(`${base_api_url}/reservas/empresa/${id}`),
  //Sin Usuario
  getReservasSinUsuarioEmpresa: (id) =>
    axios.get(`${base_api_url}/reservas2/empresa/${id}`),
  //Con Usuario
  getReservasCliente: (id) =>
    axios.get(`${base_api_url}/reservas/cliente/${id}`),

  //es un post no GET
  getHorariosDisponibles: (data) =>
    axios.post(`${base_api_url}/intervalos/empresa/horasdisponibles`, data),

  createReservaPocosDatos: (data) =>
    axios.post(`${base_api_url}/reservas/usuarioNoRegistradoPocosDatos`, data),

  getReservasPorEmpresaYCliente: (empresaId, clienteId) => axios.get(`${base_api_url}/reservas/${empresaId}/${clienteId}`),

  // Route::post('/reservas/usuarioNoRegistradoPocosDatos', [ReservaController::class, 'storeUsuarioNoRegistradoPocosDatos']);

  //------------------------ PRODUCTOS ------------------------
  createProducto: (data) => axios.post(`${base_api_url}/productos`, data),
  getProductos: () => axios.get(`${base_api_url}/productos`),
  getProductosEmpresa: (id) =>
    axios.get(`${base_api_url}/empresas/${id}/productos`),
  getProductosActivosEmpresa: (id) =>
    axios.get(`${base_api_url}/empresas/${id}/productosActivos`),
  getProductoById: (id) => axios.get(`${base_api_url}/productos/${id}`),
  updateProducto: (id, data) =>
    axios.put(`${base_api_url}/productos/${id}`, data),
  deleteProducto: (id) => axios.delete(`${base_api_url}/productos/${id}`),

  comprarProducto: (data) => axios.post(`${base_api_url}/compras`, data),

  getProductosByCliente: (clienteId, empresaId) => axios.get(`${base_api_url}/productos/${clienteId}/empresa/${empresaId}`),

  //---------------------------- Comentarios Y Calificaciones --------------------

  // Obtener las reseñas de una empresa por su ID
  getReviewsByEmpresa: (id) =>
    axios.get(`${base_api_url}/empresa/${id}/reviews`),

  // Agregar una reseña para una empresa
  addReview: (data) => axios.post(`${base_api_url}/reviews`, data),

  updateReview: (id, data) => axios.put(`${base_api_url}/reviews/${id}`, data),

  //--------------------------------Gestion de clientes --------------
  
  getClientesByEmpresa: (empresaId) =>
    axios.get(`${base_api_url}/empresas/${empresaId}/clientes`),


  getComprasPorClienteYEmpresa: (empresaId, clienteId) =>
    axios.get(`${Config.url()}/empresa/${empresaId}/ventas/${clienteId}`),

  getReservasByCliente: (clienteId, empresaId) =>
    axios.get(
      `${base_api_url}/clientes/${clienteId}/empresas/${empresaId}/reservas`
    ),




      //------------------------ FIDELIZACIÓN ------------------------
  // Crear programa de fidelización
  createFidelizacion: (data) =>
    axios.post(`${base_api_url}/fidelizacion`, data),

  // Obtener todos los programas de fidelización por empresa
  getFidelizacionesByEmpresa: (id) =>
    axios.get(`${base_api_url}/fidelizacion/empresa/${id}`),

  // Obtener un programa de fidelización por ID
  getFidelizacionById: (id) =>
    axios.get(`${base_api_url}/fidelizacion/${id}`),

  // Actualizar un programa de fidelización
  updateFidelizacion: (id, data) =>
    axios.put(`${base_api_url}/fidelizacion/${id}`, data),

  // Eliminar un programa de fidelización
  deleteFidelizacion: (id) =>
    axios.delete(`${base_api_url}/fidelizacion/${id}`),
  
};

export default Config;
