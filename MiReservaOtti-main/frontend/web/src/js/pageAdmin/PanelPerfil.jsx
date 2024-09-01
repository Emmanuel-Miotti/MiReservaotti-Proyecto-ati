import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FaEdit, FaSignOutAlt } from "react-icons/fa";
import AuthUser from "../pageauth/AuthUser";
import { useNavigate } from "react-router-dom";

const PagePerfil = () => {
  const { getUser } = AuthUser();
  const navigate = useNavigate();
  const user = getUser();

  const editarEmpresa = () => {
    navigate(`/edit-empresa/${user.id}`);
  };

  const logoutUser = () => {
    localStorage.setItem("authToken", "");
    localStorage.clear(); // Borra todo el localStorage
    sessionStorage.clear(); // Borra todo el sessionStorage
    navigate("/"); // A donde te redirije cuando haces logout
  };
  const defaultPhoto = "https://via.placeholder.com/150";
  return (
    <Container className="perfil-empresa mt-4 justify-content-center">
      <Row className="align-items-center">
        <Col xs={12} md={4} className="text-center">
          <img
            src={user.photo ? user.photo : defaultPhoto}
            alt="Perfil de Empresa"
            className="img-fluid rounded-circle mb-3"
          />
        </Col>
        <Col xs={12} md={8}>

          <h1>Perfil de la Empresa</h1>
          <h2>{user.name}</h2>
          <p>ID: {user.id}</p>
          <p>Email: {user.email}</p>
          <p>Teléfono: {user.phone}</p>
          <p>Dirección: {user.address}</p>

          <div className="d-grid gap-2 d-md-flex justify-content-md-start mt-3">
            <Button variant="primary" onClick={editarEmpresa}>
              <FaEdit className="me-2" /> Editar Perfil
            </Button>
            <Button variant="danger" onClick={logoutUser}>
              <FaSignOutAlt className="me-2" /> Cerrar Sesión
            </Button>
            <Button onClick={() => navigate("/servicios")}>
              <FaSignOutAlt className="me-2" /> Servicios
            </Button>
            <Button onClick={() => navigate("/Producto")}>
              <FaSignOutAlt className="me-2" /> Productos
            </Button>
            <Button onClick={() => navigate("/Empresa")}>
              <FaSignOutAlt className="me-2" /> Volver
            </Button>
          </div>

        </Col>
      </Row>
    </Container>
  );
};

export default PagePerfil;
