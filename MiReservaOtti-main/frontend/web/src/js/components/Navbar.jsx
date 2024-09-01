import React from "react";
import AuthUser from "../pageauth/AuthUser";
import "../../css/app.css";
import { Container, Nav, Navbar, Button, NavDropdown } from "react-bootstrap";
import ButtonGradient from "../components/ButtonGradient";
import ButtonGradient2 from "../components/ButtonGradient2";
import { useNavigate } from "react-router-dom";
// import logoimg from "../../../public/img/logo.jpeg";
import { TbWorldWww } from "react-icons/tb";
import { useLocation } from "react-router-dom";

const Navbarr = () => {
  const { getUser, getRol, getToken } = AuthUser();
  const navigate = useNavigate();
  const location = useLocation();

  const logoutUser = () => {
    localStorage.setItem("authToken", "");
    localStorage.clear(); // Borra todo el localStorage
    sessionStorage.clear(); // Borra todo el sessionStorage
    navigate("/"); // A donde te redirije cuando haces logout
  };
  const NavbarBrandContent = (
    <>
      {/* <img
                src={logoimg}
                alt="Logo"
                className="me-2"
                style={{ height: "40px", width: "40px" }}
            /> */}
      MiReservaOtti
    </>
  );

  const editarUsuario = () => {
    console.log(getUser());
    navigate(`/edit-client/${getUser().id}`);
  };
  const editarEmpresa = () => {
    console.log(getUser());
    navigate(`/edit-empresa/${getUser().id}`);
  };
  const perfilEmpresa = () => {
    navigate(`/perfil-empresa/${getUser().id}`);
  };
  const perfilCliente = () => {
    navigate(`/perfil-cliente/${getUser().id}`);
  };

  const vermiweb = () => {
    navigate(`/empresa/url/${getUser().url}`);
  };

  const renderProductDropdown = () => {
    return (
      <NavDropdown title="Productos" id="navbarScrollingDropdown">
        <NavDropdown.Item href="#/ver-productos">Ver Productos</NavDropdown.Item>
        <NavDropdown.Item href="#/agregar-producto">Agregar Producto</NavDropdown.Item>
        <NavDropdown.Item href="#/ventas-productos">Ver Ventas</NavDropdown.Item>
      </NavDropdown>
    );
  };

  const renderLinks = () => {
    if (getRol() === "Empresa" && getToken()) {
      return (
        <>
          <Navbar.Brand href={`/${getRol()}`} className="LogoCss">
            {NavbarBrandContent}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* <Nav.Link href="/Empresa" className="active">
                                Inicio
                            </Nav.Link>
                            <Nav.Link href="/Panel-Agenda-Empresa">Agenda</Nav.Link>
                            <Nav.Link href="/">Recordatorios</Nav.Link>
                            <Nav.Link href="/">Clientes</Nav.Link>
                            <Nav.Link href="/">Administración</Nav.Link> */}
              <Nav.Link
                href="/Empresa"
                className={location.pathname === "/Empresa" ? "active" : ""}
              >
                Inicio
              </Nav.Link>
              {/* <Nav.Link
                href="/Agenda"
                className={
                  location.pathname === "/Agenda" ? "active" : ""
                }
              >
                Agenda
              </Nav.Link> */}



      <NavDropdown title="Reservas" id="navbarScrollingDropdown">
        <NavDropdown.Item href="/agenda">Calendario</NavDropdown.Item>
        <NavDropdown.Item href="/reservas">Todas mis reservas</NavDropdown.Item>
        <NavDropdown.Item href="#/ventas-productos">Agregar reserva</NavDropdown.Item>
      </NavDropdown>

      

      <NavDropdown title="Productos" id="navbarScrollingDropdown">
        <NavDropdown.Item href="/productos">Ver Productos</NavDropdown.Item>
        <NavDropdown.Item href="#/ventas-productos">Ver Ventas</NavDropdown.Item>
        <NavDropdown.Item href="#/agregar-producto">Agregar Producto</NavDropdown.Item>
      </NavDropdown>

      <Nav.Link
                href="/servicios"
                className={location.pathname === "/Empresa" ? "active" : ""}
              >
                Servicios
              </Nav.Link>

      <NavDropdown title="Mi perfil" id="navbarScrollingDropdown">
            <NavDropdown.Item onClick={perfilCliente}>Ver perfil</NavDropdown.Item>
            <NavDropdown.Item onClick={editarUsuario}>Editar perfil</NavDropdown.Item>
          </NavDropdown>

          <Nav.Link
                href="/Empresa"
                className={location.pathname === "/Empresa" ? "active" : ""}
              >
                Mis clientes
              </Nav.Link>

              <Nav.Link
                href="/Empresa"
                className={location.pathname === "/Empresa" ? "active" : ""}
              >
                Informes y estadisticas
              </Nav.Link>


{/* 
              <Nav.Link
                href="/Clientes"
                className={location.pathname === "/Clientes" ? "active" : ""}
              >
                Clientes
              </Nav.Link>



              <Nav.Link
                href="/Administracion"
                className={
                  location.pathname === "/Administracion" ? "active" : ""
                }
              >
                Administración
              </Nav.Link> */}
            </Nav>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              
              {/* <TbWorldWww
                onClick={vermiweb}
                style={{
                  cursor: "pointer",
                  width: "40px",
                  height: "40px",
                }}
              /> */}
              <p>{getRol()}</p>
              <img
                src="https://via.placeholder.com/40"
                alt="Imagen de Usuario"
                className="img-fluid rounded-circle"
              />
              <Button href="#" onClick={logoutUser} className="btn btn-success">
                Logout
              </Button>
              {/* <Button
                href="#"
                onClick={editarEmpresa}
                className="btn btn-success"
              >
                Editar usuario
              </Button>
              <Button
                href="#"
                onClick={perfilEmpresa}
                className="btn btn-success"
              >
                Mi Perfil
              </Button> */}
            </div>
          </Navbar.Collapse>
        </>
      );
    } else if (getRol() === "Cliente" && getToken()) {
      return (
        <>
          {/* Si es Client */}
          <Navbar.Brand href={`/${getRol()}`} className="LogoCss">
            {NavbarBrandContent}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* <Nav.Link href="/" className="active">
                Inicio
              </Nav.Link>
              <Nav.Link href="/">Agenda</Nav.Link>
              <Nav.Link href="/">Recordatorios</Nav.Link>
              <Nav.Link href="/">Recervas</Nav.Link>
              <Nav.Link href="/">Favoritos</Nav.Link> */}

              <Nav.Link
                href="/Cliente"
                className={location.pathname === "/Empresa" ? "active" : ""}
              >
                Inicio
              </Nav.Link>

              <NavDropdown title="Reservas" id="navbarScrollingDropdown">
        <NavDropdown.Item href="#/ver-productos">Proximas reservas</NavDropdown.Item>
        <NavDropdown.Item href="#/agregar-producto">Todas mis reservas</NavDropdown.Item>
      </NavDropdown>

              <Nav.Link
                href="/reserva-cliente"
                className={location.pathname === "/reserva-cliente" ? "active" : ""}
              >
                Productos
              </Nav.Link>
              {/* <Nav.Link
                href="/Administracion"
                className={
                  location.pathname === "/Administracion" ? "active" : ""
                }
              >
                Mi perfil
              </Nav.Link> */}

              

              <Nav className="me-auto">
              <Nav.Link href="#/inicio">Favoritos</Nav.Link>
              
          <NavDropdown title="Mi perfil" id="navbarScrollingDropdown">
            <NavDropdown.Item onClick={perfilCliente}>Ver perfil</NavDropdown.Item>
            <NavDropdown.Item onClick={editarUsuario}>Editar perfil</NavDropdown.Item>
          </NavDropdown>
      
            </Nav>
            
            </Nav>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <p>{getRol()}</p>
              <img
                src="https://via.placeholder.com/40"
                alt="Imagen de Usuario"
                className="img-fluid rounded-circle"
              />
              <Button href="#" onClick={logoutUser} className="btn btn-success">
                Logout
              </Button>
              {/* <Button
                href="#"
                onClick={editarUsuario}
                className="btn btn-success"
              >
                Editar usuario
              </Button>
              <Button
                href="#"
                onClick={perfilCliente}
                className="btn btn-success"
              >
                Mi Perfil
              </Button> */}
            </div>
          </Navbar.Collapse>
        </>
      );
    } else {
      return (
        <>
          {" "}
          <Navbar.Brand href="/" className="LogoCss">
            {NavbarBrandContent}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {/* <Nav.Link href="/" className="active">
                Inicio
              </Nav.Link>
              <Nav.Link href="/">Soluciones para</Nav.Link>
              <Nav.Link href="/">Funcionalidades</Nav.Link>
              <Nav.Link href="/">Precios</Nav.Link> */}
            </Nav>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <ButtonGradient2
                title="Ingresar"
                variant="outline-primary"
                className="me-md-2 mb-2 mb-md-0"
                href="/login"
              />

              <ButtonGradient
                title="Registro"
                href="/register-cliente"
                variant="primary"
              />
            </div>
          </Navbar.Collapse>
        </>
      );
    }
  };

  return (
    <Navbar bg="light" expand="lg">
      <Container className="containerNavbar">{renderLinks()}</Container>
    </Navbar>
  );
};

export default Navbarr;
