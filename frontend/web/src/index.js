import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// import App from "./App.jsx";
import reportWebVitals from "./reportWebVitals";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';

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
import Configuraciones from "./js/pageAdmin/Configuraciones.jsx";
import Ventas from "./js/pageAdmin/Ventas.jsx";
import Intervalos from "./js/pageAdmin/Intervalos.jsx";
import Gallery from "./js/pageAdmin/Gallery.jsx";
import GestionClientes from "./js/pageAdmin/GestionClientes.jsx";
import FidelizacionCrud from "./js/pageAdmin/FidelizacionCrud.jsx";

// Cliente
import PanelClient from "./js/PageClient/PanelClient";
import Favoritos from "./js/PageClient/Favoritos.jsx";
import ComprasCliente from "./js/PageClient/ComprasRealizadas.jsx";
import EditarCliente from "./js/pageauth/EditarCliente";
import PerfilCliente from "./js/PageClient/PanelPerfilCliente.jsx";
import MisReserva from "./js/PageClient/MisReserva.jsx";
import ListaEspera from "./js/PageClient/ListaEspera.jsx";
// Public
import ReservasParaClientes from "./js/pagepublic/PageReservas.jsx";
import VerEmpresa from "./js/pagepublic/VerEmpresa.jsx";
import Productos from "./js/pageAdmin/Productos.jsx";
import ProductosEmpresa from "./js/PageClient/CompraProducto.jsx";
import ComprasCRUD from "./js/pageAdmin/ComprasCrud.jsx";
import axios from "axios";

// Obtener el token CSRF del meta tag
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

if (csrfToken) {
    // Configurar Axios para incluir el token CSRF en los encabezados
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
} else {

    // Obtener el token CSRF desde Laravel Sanctum
    axios.get('http://127.0.0.1/sanctum/csrf-cookie').then(response => {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = response.data['csrf-token'];
    });
}

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

     
      {/* <Route path="/edit-client/:id" element={<EditarCliente />} /> */}
      {/* <Route path="/servicios" element={<ServicioCRUD />} /> */}
      {/* <Route path="/perfil-empresa/:id" element={<PagaPerfil />} />
      <Route path="/perfil-empresa" element={<PagaPerfil />} /> */}
      {/* <Route path="/perfil-cliente" element={<PerfilCliente />} /> */}
      {/* <Route path="/agenda" element={<PanelAgenda />} />
      <Route path="/reservas" element={<ReservaCRUD />} /> */}
      <Route path="/compras" element={<ComprasCRUD />} /> 
      {/* <Route path="/comprasCliente/:id" element={<ComprasCliente />} />  */}
      {/* <Route path="/ventas" element={<Ventas />} />  */}
      <Route path="/reserva/:id" element={<ReservasParaClientes />} />
      <Route path="/compra/:id" element={<ProductosEmpresa />} />
      {/* <Route path="/productos" element={<Productos />} /> */}
      <Route path="/configuraciones" element={<Configuraciones />} />
      {/* <Route path="/intervalos" element={<Intervalos />} />                        */}
      {/* <Route path="/MisReservas" element={<MisReserva />} />                        */}
      {/* <Route path="/favoritos" element={<Favoritos />} />                        */}
      {/* <Route path="/gallery" element={<Gallery />} />                        */}
      {/* <Route path="/GestionClientes" element={<GestionClientes />} /> */}
      <Route path="/ListaEspera/:id" element={<ListaEspera />} />  {/* hacerlo para registrado por decirle que se registren */}

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

        <Route element={<LayoutClient />}>
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/MisReservas" element={<MisReserva />} />     
        <Route path="/edit-client/:id" element={<EditarCliente />} />
        {/* <Route path="/edit-empresa/:id" element={<EditarEmpresa />} /> */}
        <Route path="/comprasCliente/:id" element={<ComprasCliente />} /> 
        <Route path="/perfil-cliente" element={<PerfilCliente />} /> 
        </Route>



        <Route element={<LayoutAdmin />}>
        <Route path="/productos" element={<Productos />} />
        <Route path="/gallery" element={<Gallery />} />    
        <Route path="/GestionClientes" element={<GestionClientes />} />
        <Route path="/intervalos" element={<Intervalos />} />  
        <Route path="/ventas" element={<Ventas />} />   
        <Route path="/perfil-empresa/:id" element={<PagaPerfil />} />
        <Route path="/perfil-empresa" element={<PagaPerfil />} />
        <Route path="/edit-empresa/:id" element={<EditarEmpresa />} />
        <Route path="/edit-empresa" element={<EditarEmpresa />} />
        <Route path="/agenda" element={<PanelAgenda />} />
        <Route path="/reservas" element={<ReservaCRUD />} />
        <Route path="/servicios" element={<ServicioCRUD />} />
        <Route path="/fidelizacion" element={<FidelizacionCrud />} />
        </Route>



        
      </Route>
    </Routes>
  </Router>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
