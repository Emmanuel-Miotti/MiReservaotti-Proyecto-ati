import React from "react";
import AuthUser from "../pageauth/AuthUser";
import "../../css/app.css";
import { Container, Nav, Navbar, Button, NavDropdown } from "react-bootstrap";
import ButtonGradient from "../components/ButtonGradient";
import ButtonGradient2 from "../components/ButtonGradient2";
import { useNavigate } from "react-router-dom";
import { TbWorldWww } from "react-icons/tb";
import { useLocation } from "react-router-dom";
import Config from "../Config";

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
  const NavbarBrandContent = <>MiReservaOtti</>;

  const editarUsuario = () => {
    console.log(getUser());
    navigate(`/edit-client/${getUser().id}`);
  };

  const comprasCliente = () => {
    console.log(getUser());
    navigate(`/comprasCliente/${getUser().id}`);
  };

  const editarEmpresa = () => {
    console.log(getUser());
    navigate(`/edit-empresa/${getUser().id}`);
  };
  const perfilEmpresa = () => {
    navigate(`/perfil-empresa`); // /${getUser().id}
  };
  const perfilCliente = () => {
    navigate(`/perfil-cliente`);
  };

  const vermiweb = () => {
    navigate(`/${getUser().url}`);
  };

  const renderProductDropdown = () => {
    return (
      <NavDropdown title="Productos" id="navbarScrollingDropdown">
        <NavDropdown.Item href="#/ver-productos">
          Ver Productos
        </NavDropdown.Item>
        <NavDropdown.Item href="#/agregar-producto">
          Agregar Producto
        </NavDropdown.Item>
        <NavDropdown.Item href="#/ventas-productos">
          Ver Ventas
        </NavDropdown.Item>
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
              <Nav.Link
                href="/Empresa"
                className={location.pathname === "/Empresa" ? "active" : ""}
              >
                Inicio
              </Nav.Link>

              {/* </NavDropdown> */}

              <NavDropdown
                title="Reservas"
                id="navbarScrollingDropdown"
                href="/agenda"
                className={location.pathname === "/agenda" ? "active" : ""}
              >
                <NavDropdown.Item href="/agenda">Calendario</NavDropdown.Item>
                <NavDropdown.Item href="/reservas">
                  Todas mis reservas
                </NavDropdown.Item>
              </NavDropdown>

              <NavDropdown title="Productos" id="navbarScrollingDropdown">
                <NavDropdown.Item href="/productos">
                  Ver Productos
                </NavDropdown.Item>
                <NavDropdown.Item href="/ventas">Ver Ventas</NavDropdown.Item>
              </NavDropdown>

              <Nav.Link
                href="/servicios"
                className={location.pathname === "/servicios" ? "active" : ""}
              >
                Servicios
              </Nav.Link>

              <NavDropdown title="Mi perfil" id="navbarScrollingDropdown">
                <NavDropdown.Item onClick={perfilEmpresa} >
                  Ver perfil
                </NavDropdown.Item>
                <NavDropdown.Item onClick={editarEmpresa}>
                  Editar perfil
                </NavDropdown.Item>
                <NavDropdown.Item href="/gallery">
                  Galería de imágenes
                </NavDropdown.Item>
                <NavDropdown.Item href="/intervalos">
                  Mis horarios
                </NavDropdown.Item>
              </NavDropdown>

              {/* <Nav.Link
                href="/gestionClientes"
                className={location.pathname === "/gestionClientes" ? "active" : ""}
              >
                Mis clientes
              </Nav.Link> */}

              
              <NavDropdown title="Clientes" id="navbarScrollingDropdown">
                <NavDropdown.Item href="/gestionClientes">
                  Mis clientes
                </NavDropdown.Item>
                <NavDropdown.Item href="/fidelizacion">
                Programas de Fidelización
                </NavDropdown.Item>
              </NavDropdown>

              {/* <Nav.Link
                href="/Empresa"
                className={location.pathname === "/Empresa" ? "active" : ""}
              >
                Informes y estadisticas
              </Nav.Link> */}
            </Nav>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <p>{getUser().name}</p>
              <img
                src={
                  getUser().profile_picture
                    ? `${Config.urlFoto()}${getUser().profile_picture}`
                    : "https://via.placeholder.com/40"
                }
                alt="Imagen de Usuario"
                className="img-fluid rounded-circle"
                style={{ width: "40px", height: "40px" }}
              />

              {/* <div className="image-container">
  <Card.Img 
    variant="top" 
    src={getUser().profile_picture ? `http://localhost:8000${getUser().profile_picture}` : 'https://via.placeholder.com/150'}
    // alt={empresa.name} 
    className="custom-card-img"
  />
</div> */}

              {/* ver mi web */}
              <Button onClick={vermiweb}>Mi web</Button>
              <Button href="#" onClick={logoutUser} variant="danger">
                Logout
              </Button>
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
              <Nav.Link
                href="/Cliente"
                className={location.pathname === "/Empresa" ? "active" : ""}
              >
                Inicio
              </Nav.Link>

              <Nav.Link href="/MisReservas">Mis reservas</Nav.Link>

              <Nav.Link onClick={comprasCliente}>Compras de productos</Nav.Link>

              <Nav className="me-auto">
                <Nav.Link href="/favoritos">Favoritos</Nav.Link>

                <NavDropdown title="Mi perfil" id="navbarScrollingDropdown">
                  <NavDropdown.Item onClick={perfilCliente}>
                    Ver perfil
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={editarUsuario}>
                    Editar perfil
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Nav>
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <p>{getUser().name}</p>
              {/* <img
                src="https://via.placeholder.com/40"
                alt="Imagen de Usuario"
                className="img-fluid rounded-circle"
              /> */}

              <img
                src={
                  getUser().profile_picture
                    ? `${Config.urlFoto()}${getUser().profile_picture}`
                    : "https://via.placeholder.com/40"
                }
                alt="Imagen de Usuario"
                className="img-fluid rounded-circle"
                style={{ width: "40px", height: "40px" }}
              />

              <Button href="#" onClick={logoutUser} variant="danger">
                Logout
              </Button>
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
            <Nav className="me-auto"></Nav>
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
