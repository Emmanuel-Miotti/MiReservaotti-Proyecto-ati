import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";

const LayoutPublic = () => {
  const location = useLocation(); // Hook de react-router-dom para obtener la ubicación actual
  const hideNavbarAndFooter =
    location.pathname === "/login" ||
    location.pathname === "/register-empresa" ||
    location.pathname === "/register-cliente"; // Ocultar Navbar y Footer en estas rutas

  return (
    <div>
      {/* {!hideNavbarAndFooter && <Navbar />} */}
      <Navbar />
      <Outlet />
      {!hideNavbarAndFooter && <Footer />} 
    </div>
  );
};

export default LayoutPublic;
