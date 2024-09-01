import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// import App from "./App.jsx";
import reportWebVitals from "./reportWebVitals";
import 'bootstrap/dist/css/bootstrap.min.css';
// import '@bryntum/calendar/calendar.stockholm.css';

//-------------------------------------------
import LayoutPublic from "./js/layouts/LayoutPublic.jsx";
import PageHome from "./js/pagepublic/PageHome.jsx";
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
import EditarEmpresa from "./js/pageAdmin/EditarEmpresa";
import ServicioCRUD from "./js/pageAdmin/ServiciosCrud.jsx"
import PagaPerfil from "./js/pageAdmin/PanelPerfil.jsx";
import ReservaCRUD from "./js/pageAdmin/ReservasCrud.jsx";
import Ver from "./js/pageAdmin/ver.jsx";
// Cliente
import PanelClient from "./js/PageClient/PanelClient";
import EditarCliente from "./js/pageauth/EditarCliente";
// Public
import ReservasParaClientes from "./js/pagepublic/PageReservas.jsx";
import VerEmpresa from "./js/pagepublic/VerEmpresa.jsx";
import Productos from "./js/pageAdmin/Productos.jsx";
import ProductosEmpresa from "./js/PageClient/CompraProducto.jsx";
import ComprasCRUD from "./js/pageAdmin/ComprasCrud.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<LayoutPublic />}>
        <Route index element={<PageHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-cliente" element={<RegisterCliente />} />
        <Route path="/register-empresa" element={<RegisterEmpresa />} />
        {/* <Route path="/forget-password" element={<ForgetPassword />} /> */}
        
      </Route>

      <Route path="/edit-empresa/:id" element={<EditarEmpresa />} />
      <Route path="/edit-client/:id" element={<EditarCliente />} />
      <Route path="/servicios" element={<ServicioCRUD />} />
      <Route path="/perfil-empresa/:id" element={<PagaPerfil />} />
      <Route path="/agenda" element={<PanelAgenda />} />
      <Route path="/reservas" element={<ReservaCRUD />} />
      <Route path="/compras" element={<ComprasCRUD />} />
      <Route path="/reserva/:id" element={<ReservasParaClientes />} />
      <Route path="/compra/:id" element={<ProductosEmpresa />} />
      <Route path="/productos" element={<Productos />} />
      
      {/* <Route path="/ver-empresa/:id" element={<VerEmpresa />} /> */}
      <Route path="/:url" element={<VerEmpresa />} />

      {/* //Solo para probar cosas  */}
      <Route path="/ver" element={<Ver />} />



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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
