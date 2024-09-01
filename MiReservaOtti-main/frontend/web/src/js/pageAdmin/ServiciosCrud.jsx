import React, { useState, useEffect } from "react";
import Config from "../Config";
import {
  Form,
  InputGroup,
  Container,
  Row,
  Col,
  Button,
  ListGroup,
  Alert,
  Badge,
} from "react-bootstrap";
import { FaTrash, FaEdit } from "react-icons/fa";
import AuthUser from "../pageauth/AuthUser";
import axios from "axios";
import NavBar from "../components/Navbar.jsx";

const ServicioCrud = () => {
  const { getUser } = AuthUser();
  const [servicios, setServicios] = useState([]);
  const [nuevoServicio, setNuevoServicio] = useState({
    empresa_id: getUser().id,
    nombre: "",
    descripcion: "",
    duracion: "",
    estado: "activo",
    precio: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    obtenerServicios();
  }, []);

  const obtenerServicios = async () => {
    try {
      const response = await Config.getServicesByEmpresa(getUser().id);
      setServicios(response.data);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  const desactivarServicio = async (id) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/v1/servicios/${id}/desactivar`);
      setServicios(
        servicios.map((servicio) =>
          servicio.id === id ? { ...servicio, estado: "desactivado" } : servicio
        )
      );
    } catch (error) {
      console.error("Error al desactivar el servicio:", error);
    }
  };

  const activarServicio = async (id) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/v1/servicios/${id}/activar`);
      setServicios(
        servicios.map((servicio) =>
          servicio.id === id ? { ...servicio, estado: "activo" } : servicio
        )
      );
    } catch (error) {
      console.error("Error al activar el servicio:", error);
    }
  };

  const eliminarServicio = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/servicios/${id}`);
      setServicios(servicios.filter((servicio) => servicio.id !== id));
    } catch (error) {
      console.error("Error al eliminar el servicio:", error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNuevoServicio((prevServicio) => ({
      ...prevServicio,
      [name]: value,
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!nuevoServicio.nombre) {
      nuevosErrores.nombre = "El campo nombre es obligatorio.";
    } else if (nuevoServicio.nombre.length > 255) {
      nuevosErrores.nombre = "El nombre no puede tener más de 255 caracteres.";
    }

    if (!nuevoServicio.descripcion) {
      nuevosErrores.descripcion = "El campo descripción es obligatorio.";
    }

    if (!nuevoServicio.duracion) {
      nuevosErrores.duracion = "El campo duración es obligatorio.";
    } else if (isNaN(nuevoServicio.duracion) || nuevoServicio.duracion < 1) {
      nuevosErrores.duracion = "La duración debe ser un número entero mayor a 0.";
    }

    if (!nuevoServicio.precio) {
      nuevosErrores.precio = "El campo precio es obligatorio.";
    } else if (isNaN(nuevoServicio.precio) || nuevoServicio.precio < 0) {
      nuevosErrores.precio = "El precio debe ser un número mayor o igual a 0.";
    }

    setErrors(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const agregarServicio = async () => {
    if (validarFormulario()) {
      try {
        await Config.createService(nuevoServicio);
        obtenerServicios();
        limpiarFormulario();
      } catch (error) {
        console.error("Error al agregar servicio:", error);
      }
    }
  };

  const limpiarFormulario = () => {
    setNuevoServicio({
      empresa_id: 1,
      nombre: "",
      descripcion: "",
      duracion: "",
      estado: "activo",
      precio: "",
    });
    setErrors({});
  };

  const editarServicio = (id) => {
    // Implementa la lógica para editar el servicio
    // Puede ser un formulario modal o una redirección a otra página
    
    
    console.log("Editar servicio con id:", id);
  };

  return (
    <>
      <NavBar />
    <Container>
      <h1 className="text-center my-3">Servicios</h1>
      <Row>
        <Col lg={6} className="mb-4">
          <h2>Agregar Servicio</h2>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              agregarServicio();
            }}
          >
            {/* Formulario para agregar servicio */}

            <Form.Group controlId="formNombre" className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={nuevoServicio.nombre}
                onChange={handleInputChange}
                isInvalid={!!errors.nombre}
              />
              <Form.Control.Feedback type="invalid">
                {errors.nombre}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formDescripcion" className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                name="descripcion"
                value={nuevoServicio.descripcion}
                onChange={handleInputChange}
                isInvalid={!!errors.descripcion}
              />
              <Form.Control.Feedback type="invalid">
                {errors.descripcion}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formDuracion" className="mb-3">
              <Form.Label>Duración (minutos)</Form.Label>
              <Form.Control
                type="number"
                name="duracion"
                value={nuevoServicio.duracion}
                onChange={handleInputChange}
                isInvalid={!!errors.duracion}
              />
              <Form.Control.Feedback type="invalid">
                {errors.duracion}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="formPrecio" className="mb-3">
              <Form.Label>Precio</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <Form.Control
                  type="number"
                  name="precio"
                  value={nuevoServicio.precio}
                  onChange={handleInputChange}
                  isInvalid={!!errors.precio}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.precio}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            <div className="d-flex justify-content-between">
              <Button type="submit" className="btn btn-primary">
                Agregar Servicio
              </Button>
              <Button
                type="button"
                className="btn btn-secondary"
                onClick={limpiarFormulario}
              >
                Limpiar
              </Button>
              <Button
                type="button"
                className="btn btn-secondary"
                onClick={obtenerServicios}
              >
                Recargar
              </Button>
            </div>

          </Form>
        </Col>
        <Col lg={6} className="mb-4">
          <h2>Lista de Servicios</h2>
          {servicios.length === 0 ? (
            <Alert variant="info">No hay servicios disponibles.</Alert>
          ) : (
            <ListGroup>
              {/* Lista de servicios */}
              {servicios.map((servicio) => (
                <ListGroup.Item
                  key={servicio.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <h5>{servicio.nombre}</h5>
                    <p>Descripcion: {servicio.descripcion}</p>
                    <p>Duración: {servicio.duracion} minutos</p>
                    <p>Precio: ${servicio.precio}</p>
                    <Badge
                      bg={
                        servicio.estado === "activo" ? "success" : "secondary"
                      }
                    >
                      {servicio.estado}
                    </Badge>
                  </div>
                  <div className="d-flex align-items-center">
                      
                    <Button
                      variant={servicio.estado === "activo" ? "danger" : "success"}
                      onClick={() =>
                        servicio.estado === "activo"
                          ? desactivarServicio(servicio.id)
                          : activarServicio(servicio.id)
                      }
                    >
                      {servicio.estado === "activo" ? "Desactivar" : "Activar"}
                    </Button>

                    <Button
                      variant="primary"
                      onClick={() => editarServicio(servicio.id)}
                    >
                      <FaEdit /> 
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => eliminarServicio(servicio.id)}
                    >
                      <FaTrash /> 
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>
    </Container>
    </>
  );
};

export default ServicioCrud;
