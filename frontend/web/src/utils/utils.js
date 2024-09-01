// // Utilidades generales para la aplicación

// // Función para construir URLs completas a partir de un path
// export function getFullURL(path) {
//     return `http://localhost:8000${path}`;
// }

// export function getFullURL2(path) {
//     return `http://localhost:8000/storage/${path}`;
// }
// utils/utils.js

// Función para construir URLs completas a partir de un path
export function getFullURL(path) {
    return `https://backend.mireservaotti.online${path}`;
  }
  
  // Función para construir URLs completas para archivos almacenados en storage
  export function getFullURL2(path) {
    return `https://backend.mireservaotti.online/storage/${path}`;
  }
  