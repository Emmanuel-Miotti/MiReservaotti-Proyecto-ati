// frontend\web\src\js\pagepublic\Favoritos.jsx

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import Config from "../Config";
import axios from "axios";
import AuthUser from "../pageauth/AuthUser";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/Navbar.jsx";

const Favoritos = () => {
  const { getUser } = AuthUser();
  const user = getUser();
  const [favoritos, setFavoritos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerFavoritos();
  }, []);

  const obtenerFavoritos = async () => {
    try {
      const response = await axios.get(`${Config.url()}/favoritos/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log(response.data.data);
      setFavoritos(response.data.data);
    } catch (error) {
      console.error("Error al obtener los favoritos:", error);
    }
  };

  const verEmpresa = (empresaId) => {
    navigate(`/${empresaId}`);
  };

  const eliminarFavorito = async (id) => {
    try {
      await axios.delete(`${Config.url()}/favoritos/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      obtenerFavoritos();
    } catch (error) {
      console.error("Error al eliminar de favoritos:", error);
    }
  };

  return (
    <>
      <NavBar />
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="text-center">Mis Empresas Favoritas</h1>
          <div className="mt-4">
            {favoritos.length > 0 ? (
              favoritos.map((favorito) => (
                <Card key={favorito.id} className="mb-3">
                  <Card.Body>
                    <Row>
                      <Col xs={12} md={4} className="text-center">
                        <Card.Img variant="top" src={
                          
                          favorito.empresa.profile_picture
                          ? `${Config.urlFoto()}${favorito.empresa.profile_picture}`
                          : "https://via.placeholder.com/150"
                          
                          }/>
                      </Col>
                      <Col xs={12} md={8}>
                        <Card.Title>{favorito.empresa.name}</Card.Title>
                        <Card.Text>
                          {favorito.empresa.address} <br />
                          {favorito.empresa.cellphone} <br />
                          {favorito.empresa.email}
                        </Card.Text>
                        <Button variant="primary" onClick={() => verEmpresa(favorito.empresa.url)}>Ver Empresa</Button>
                        <Button variant="danger" className="ml-2" onClick={() => eliminarFavorito(favorito.id)}>Eliminar</Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p className="text-center">No tienes empresas favoritas.</p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
    </>
  );
};

export default Favoritos;
