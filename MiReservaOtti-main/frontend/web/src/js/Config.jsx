import axios from "axios";

const base_api_url = "http://127.0.0.1:8000/api/v1";

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
  registerCliente: (dato) =>
    axios.post(`${base_api_url}/auth/register-cliente`, dato),
  registerEmpresa: (dato) =>
    axios.post(`${base_api_url}/auth/register-empresa`, dato),
  login: (dato) => axios.post(`${base_api_url}/auth/login`, dato),
  getLogout: () => axios.post(`${base_api_url}/auth/logout`),
  // logout: () => axios.post(`/api/v1/auth/logout`),

 //------------------------ CLIENTE ------------------------
  editCliente: (id, data) => axios.put(`${base_api_url}/cliente/${id}`, data),
  getCliente: (id) => axios.get(`${base_api_url}/cliente/${id}`),

//------------------------ EMPRESA ------------------------
  editEmpresa: (id, data) => axios.put(`${base_api_url}/empresa/${id}`, data), // Editar empresa por id y data con headers de autorización de token de usuario logueado en el sistema
  getEmpresa: (id) => axios.get(`${base_api_url}/empresa/${id}`), // Obtener empresa por id con headers de autorización de token de usuario logueado en el sistema
  getEmpresaId: (id) => axios.get(`${base_api_url}/verempresa/${id}`), // Obtener empresa por id sin headers de autorización
  getEmpresaUrl: (url) => axios.get(`${base_api_url}/empresa/url/${url}`), // Obtener empresa por id sin headers de autorización
  getIntervalosEmpresa: (id) => axios.get(`${base_api_url}/intervalos/empresa/${id}`), // Obtener empresa por id sin headers de autorización


  //------------------------ SERVICIOS ------------------------
  // Crear servicio
  createService: (data) => axios.post(`${base_api_url}/servicios`, data),

  // Obtener todos los servicios
  getServices: () => axios.get(`${base_api_url}/servicios`),


  getServicio: (id) => axios.get(`${base_api_url}/servicio/${id}`),

  // Obtener servicios por empresa
  getServicesByEmpresa: (id) =>
    axios.get(`${base_api_url}/servicios/empresa/${id}`),

  // Obtener un servicio por ID
  getServiceById: (id) => axios.get(`${base_api_url}/servicios/${id}`),

  // Actualizar un servicio
  updateService: (id, data) =>
    axios.put(`${base_api_url}/servicios/${id}`, data),

  // Eliminar un servicio
  deleteService: (id) => axios.delete(`${base_api_url}/servicios/${id}`),

  // Desactivar servicio
  desactivarService: (id) => axios.put(`${base_api_url}/servicios/${id}/desactivar`),
  

 //------------------------  RESERVA ------------------------
  getReservas: () => axios.get(`${base_api_url}/reservas`),
  createReserva: (data) => axios.post(`${base_api_url}/reservas`, data),
  updateReserva: (id, data) => axios.put(`${base_api_url}/reservas/${id}`, data),
  deleteReserva: (id) => axios.delete(`${base_api_url}/reservas/${id}`),
  getReserva: (id) => axios.get(`${base_api_url}/reservas/${id}`),
  getReservasEmpresa: (id) => axios.get(`${base_api_url}/reservas/empresa/${id}`),
  getReservasCliente: (id) => axios.get(`${base_api_url}/reservas/cliente/${id}`),


  getHorariosDisponibles: (data) => axios.post(`${base_api_url}/intervalos/empresa/horasdisponibles`, data),


  createReservaPocosDatos: (data) => axios.post(`${base_api_url}/reservas/usuarioNoRegistradoPocosDatos`, data),

  // Route::post('/reservas/usuarioNoRegistradoPocosDatos', [ReservaController::class, 'storeUsuarioNoRegistradoPocosDatos']);


    //------------------------ PRODUCTOS ------------------------
    createProducto: (data) => axios.post(`${base_api_url}/productos`, data),
    getProductos: () => axios.get(`${base_api_url}/productos`),
    getProductosEmpresa: (id) => axios.get(`${base_api_url}/empresas/${id}/productos`),
    getProductoById: (id) => axios.get(`${base_api_url}/productos/${id}`),
    updateProducto: (id, data) => axios.put(`${base_api_url}/productos/${id}`, data),
    deleteProducto: (id) => axios.delete(`${base_api_url}/productos/${id}`),


    comprarProducto: (data) => axios.post(`${base_api_url}/compras`, data),
  
};

export default Config;
