import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import LayoutPublic from "./js/layouts/LayoutPublic";
import PageHome from "./js/pagepublic/PageHome";
import LayoutClient from "./js/layouts/LayoutClient";
import ProtectedRoutes from "./js/pageauth/ProtectedRoutes";
import LayoutAdmin from "./js/layouts/LayoutAdmin";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./js/pageauth/Login";
import RegisterCliente from "./js/pageauth/RegisterCliente";
import RegisterEmpresa from "./js/pageauth/RegisterEmpresa";
// Admin
import PanelAdmin from "./js/pageAdmin/PanelAdmin";
import PanelAgenda from "./js/pageAdmin/PanelAgenda";
import EditarEmpresa from "./js/pageauth/EditarEmpresa";
import ServiciosCrud from "./js/pageAdmin/ServiciosCrud";
 import PagePerfil from "./js/pageAdmin/PanelPerfil";
// Cliente
import PanelClient from "./js/PageClient/PanelClient";
import EditarCliente from "./js/pageauth/EditarCliente";

// Public
// import ForgetPassword from "./js/pageauth/forgetPassword";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LayoutPublic />}>
          <Route index element={<PageHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-cliente" element={<RegisterCliente />} />
          <Route path="/register-empresa" element={<RegisterEmpresa />} />
          {/* <Route path="/forget-password" element={<ForgetPassword />} /> */}
          <Route path="/agenda" element={<PanelAgenda />} />
        </Route>

          <Route path="/serviciosEmpresa" element={<ServiciosCrud />} />
        <Route path="/edit-empresa/:id" element={<EditarEmpresa />} />
        <Route path="/edit-client/:id" element={<EditarCliente />} />
        <Route path="/perfil-empresa/:id" element={<PagePerfil />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/Empresa" element={<LayoutAdmin />}>
            <Route index element={<PanelAdmin />} />
          </Route>

          <Route path="/Cliente" element={<LayoutClient />}>
            <Route index element={<PanelClient />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

if (document.getElementById("root")) {
  const Index = ReactDOM.createRoot(document.getElementById("root"));

  Index.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
