import axios from "axios";

const base_api_url = "127.0.0.1:8000/api/v1";
// const base_api_url = "http://127.0.0.1:8000/api/v1";

//Route

export default {
  getRegister: (dato) => axios.post(`/api/v1/auth/register`, dato),
  getLogin: (dato) => axios.post(`/api/v1/auth/login`, dato),
  getLogout: () => axios.post(`/api/v1/auth/logout`),
  login: (dato) => axios.post(`/api/v1/auth/login`, dato),
  // getProfile: () => axios.get(`/api/v1/auth/profile`),
  // getCategories: () => axios.get(`/api/v1/categories`),

  //------------------------ EMPRESA ------------------------
  editEmpresa: (id, data) => axios.put(`${base_api_url}/empresa/${id}`, data), // Editar empresa por id y data con headers de autorización de token de usuario logueado en el sistema
  getEmpresa: (id) => axios.get(`${base_api_url}/empresa/${id}`), // Obtener empresa por id con headers de autorización de token de usuario logueado en el sistema
  getEmpresaId: (id) => axios.get(`${base_api_url}/verempresa/${id}`), // Obtener empresa por id sin headers de autorización

  //------------------------ SERVICIOS ------------------------
  // Crear servicio
  createService: (data) => axios.post(`${base_api_url}/servicios`, data),

  // Obtener todos los servicios
  getServices: () => axios.get(`${base_api_url}/servicios`),

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
  desactivarService: (id) =>
    axios.put(`${base_api_url}/servicios/${id}/desactivar`),

  //------------------------  RESERVA ------------------------
  getReservas: () => axios.get(`${base_api_url}/reservas`),
  createReserva: (data) => axios.post(`${base_api_url}/reservas`, data),
  updateReserva: (id, data) =>
    axios.put(`${base_api_url}/reservas/${id}`, data),
  deleteReserva: (id) => axios.delete(`${base_api_url}/reservas/${id}`),
  getReserva: (id) => axios.get(`${base_api_url}/reservas/${id}`),
  getReservasEmpresa: (id) =>
    axios.get(`${base_api_url}/reservas/empresa/${id}`),
  getReservasCliente: (id) =>
    axios.get(`${base_api_url}/reservas/cliente/${id}`),
};
