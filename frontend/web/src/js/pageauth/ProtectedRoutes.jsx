import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthUser from "./AuthUser";

const ProtectedRoutes = () => {
  // Creamos el componente ProtectedRoutes
  const { getToken } = AuthUser(); // Importamos la función getToken de AuthUser
  if (!getToken()) {
    // Si no hay token, redirigimos a la página de login
    return <Navigate to={"/login"} />; // Redirigimos a la página de login
  }
  return <Outlet />; // Si hay token, mostramos el contenido de la página
};

export default ProtectedRoutes; // Exportamos el componente ProtectedRoutes
