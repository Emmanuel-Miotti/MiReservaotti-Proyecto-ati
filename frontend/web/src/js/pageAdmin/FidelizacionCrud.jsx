import React, { useState, useEffect } from "react";
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
  Modal,
} from "react-bootstrap";
import Config from "../Config";
import AuthUser from "../pageauth/AuthUser";
import NavBar from "../components/Navbar.jsx";
import { FaTrash, FaEdit } from "react-icons/fa";
import axios from 'axios';

const FidelizacionCrud = () => {
  const { getUser } = AuthUser();
  const [fidelizaciones, setFidelizaciones] = useState([]);
  const [nuevaFidelizacion, setNuevaFidelizacion] = useState({
    empresa_id: getUser().empresa_id || getUser().id, // Asegúrate de tener el ID de la empresa
    nombre: "",
    descripcion: "",
    puntos: 1,
  });
  const [fidelizacionEditada, setFidelizacionEditada] = useState({
    empresa_id: getUser().empresa_id || getUser().id,
    nombre: "",
    descripcion: "",
    puntos: 1,
  });
  const [editingFidelizacion, setEditingFidelizacion] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorsNuevaFidelizacion, setErrorsNuevaFidelizacion] = useState({});
  const [errorsEditFidelizacion, setErrorsEditFidelizacion] = useState({});

  useEffect(() => {
    obtenerFidelizaciones();
  }, []);

  const obtenerFidelizaciones = async () => {
    try {
        // console.log(getUser().empresa_id)
        console.log(getUser().id)
      const response = await axios.get(`${Config.url()}/fidelizacion/empresa/5`);

      console.log(response)
      setFidelizaciones(response.data.data); // Asegúrate de acceder correctamente a los datos
    } catch (error) {
      console.error("Error al cargar programas de fidelización:", error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNuevaFidelizacion((prevFidelizacion) => ({
      ...prevFidelizacion,
      [name]: value,
    }));
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setFidelizacionEditada((prevFidelizacion) => ({
      ...prevFidelizacion,
      [name]: value,
    }));
  };

  const validateForm = (fidelizacion) => {
    const newErrors = {};
    if (!fidelizacion.nombre) newErrors.nombre = "El nombre es requerido";
    if (!fidelizacion.puntos || fidelizacion.puntos <= 0)
      newErrors.puntos = "Los puntos deben ser mayor a 0";
    return newErrors;
  };

  const agregarFidelizacion = async () => {
    const newErrors = validateForm(nuevaFidelizacion);
    if (Object.keys(newErrors).length > 0) {
      setErrorsNuevaFidelizacion(newErrors);
      return;
    }

    try {
      await Config.createFidelizacion(nuevaFidelizacion);
      obtenerFidelizaciones();
      clearForm();
    } catch (error) {
      if (error.response) {
        setErrorsNuevaFidelizacion(error.response.data.errors || {});
      }
      console.error("Error al agregar programa de fidelización:", error);
    }
  };

  const startEditing = (fidelizacion) => {
    setEditingFidelizacion(fidelizacion.id);
    setFidelizacionEditada({
      empresa_id: fidelizacion.empresa_id,
      nombre: fidelizacion.nombre,
      descripcion: fidelizacion.descripcion || "",
      puntos: fidelizacion.puntos,
    });
    setShowEditModal(true);
  };

  const actualizarFidelizacion = async () => {
    const newErrors = validateForm(fidelizacionEditada);
    if (Object.keys(newErrors).length > 0) {
      setErrorsEditFidelizacion(newErrors);
      return;
    }

    try {
      await Config.updateFidelizacion(editingFidelizacion, fidelizacionEditada);
      obtenerFidelizaciones();
      clearEditForm();
      setShowEditModal(false);
    } catch (error) {
      if (error.response) {
        setErrorsEditFidelizacion(error.response.data.errors || {});
      }
      console.error("Error al actualizar programa de fidelización:", error);
    }
  };

  const eliminarFidelizacion = async (id) => {
    try {
      await Config.deleteFidelizacion(id);
      setFidelizaciones(fidelizaciones.filter((fidelizacion) => fidelizacion.id !== id));
    } catch (error) {
      console.error("Error al eliminar programa de fidelización:", error);
    }
  };

  const clearForm = () => {
    setNuevaFidelizacion({
      empresa_id: getUser().empresa_id || getUser().id,
      nombre: "",
      descripcion: "",
      puntos: 1,
    });
    setErrorsNuevaFidelizacion({});
  };

  const clearEditForm = () => {
    setFidelizacionEditada({
      empresa_id: getUser().empresa_id || getUser().id,
      nombre: "",
      descripcion: "",
      puntos: 1,
    });
    setErrorsEditFidelizacion({});
  };

  const handleCloseEditModal = () => {
    clearEditForm();
    setEditingFidelizacion(null);
    setShowEditModal(false);
  };
  

  return (
    <>
      <NavBar />
      <Container>
        <h1 className="text-center my-3">Programas de Fidelización</h1>
        <Row>
          <Col lg={6} className="mb-4">
            <h2>Agregar Programa</h2>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                agregarFidelizacion();
              }}
            >
              <Form.Group controlId="formNombre" className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={nuevaFidelizacion.nombre}
                  onChange={handleInputChange}
                  isInvalid={!!errorsNuevaFidelizacion.nombre}
                />
                <Form.Control.Feedback type="invalid">
                  {errorsNuevaFidelizacion.nombre}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formDescripcion" className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={nuevaFidelizacion.descripcion}
                  onChange={handleInputChange}
                  isInvalid={!!errorsNuevaFidelizacion.descripcion}
                />
                <Form.Control.Feedback type="invalid">
                  {errorsNuevaFidelizacion.descripcion}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formPuntos" className="mb-3">
                <Form.Label>Puntos *</Form.Label>
                <Form.Control
                  type="number"
                  name="puntos"
                  value={nuevaFidelizacion.puntos}
                  onChange={handleInputChange}
                  isInvalid={!!errorsNuevaFidelizacion.puntos}
                />
                <Form.Control.Feedback type="invalid">
                  {errorsNuevaFidelizacion.puntos}
                </Form.Control.Feedback>
              </Form.Group>
              <div className="d-flex justify-content-between">
                <Button type="submit" className="btn btn-primary">
                  Agregar Programa
                </Button>
                <Button
                  type="button"
                  className="btn btn-secondary"
                  onClick={clearForm}
                >
                  Limpiar
                </Button>
              </div>
            </Form>
          </Col>
          <Col lg={6} className="mb-4">
            <h2>Lista de Programas</h2>
            {fidelizaciones.length === 0 ? (
              <Alert variant="info">No hay programas de fidelización disponibles.</Alert>
            ) : (
              <ListGroup>
                {fidelizaciones.map((fidelizacion) => (
                  <ListGroup.Item
                    key={fidelizacion.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h5>{fidelizacion.nombre}</h5>
                      <p>Descripción: {fidelizacion.descripcion}</p>
                      <p>Puntos necesarios: {fidelizacion.puntos}</p>
                      <Badge bg="success">Activo</Badge>
                    </div>
                    <div className="d-flex align-items-center">
                      <Button
                        variant="warning"
                        onClick={() => startEditing(fidelizacion)}
                        className="me-2"
                      >
                        <FaEdit /> Editar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => eliminarFidelizacion(fidelizacion.id)}
                      >
                        <FaTrash /> Eliminar
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Col>
        </Row>

        {/* Modal para Editar Fidelización */}
        <Modal show={showEditModal} onHide={handleCloseEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Programa</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                actualizarFidelizacion(editingFidelizacion);
              }}
            >
              <Form.Group controlId="formEditNombre" className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={fidelizacionEditada.nombre}
                  onChange={handleEditInputChange}
                  isInvalid={!!errorsEditFidelizacion.nombre}
                />
                <Form.Control.Feedback type="invalid">
                  {errorsEditFidelizacion.nombre}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formEditDescripcion" className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={fidelizacionEditada.descripcion}
                  onChange={handleEditInputChange}
                  isInvalid={!!errorsEditFidelizacion.descripcion}
                />
                <Form.Control.Feedback type="invalid">
                  {errorsEditFidelizacion.descripcion}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formEditPuntos" className="mb-3">
                <Form.Label>Puntos</Form.Label>
                <Form.Control
                  type="number"
                  name="puntos"
                  value={fidelizacionEditada.puntos}
                  onChange={handleEditInputChange}
                  isInvalid={!!errorsEditFidelizacion.puntos}
                />
                <Form.Control.Feedback type="invalid">
                  {errorsEditFidelizacion.puntos}
                </Form.Control.Feedback>
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button type="submit" className="btn btn-primary">
                  Actualizar Programa
                </Button>
                <Button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={handleCloseEditModal}
                >
                  Cancelar
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
};

export default FidelizacionCrud;
