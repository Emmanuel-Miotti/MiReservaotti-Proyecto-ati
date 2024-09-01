import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import AuthUser from "../pageauth/AuthUser";
import Config from "../Config";

const CompraCRUD = () => {
  const { getUser } = AuthUser();
  const [compras, setCompras] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    cliente_id: "",
    total: 0,
    estado: "pendiente",
    detalles: [],
  });

  useEffect(() => {
    fetchCompras();
  }, []);

  const fetchCompras = async () => {
    try {
      const userId = getUser().id;
      console.log(userId);
      const response = await axios.get(`${Config.url()}/empresa/compras/${userId}`);
      console.log(response);
      setCompras(response.data);
    } catch (error) {
      console.error("Error al obtener compras:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${Config.url()}/compras/${formData.id}`;
    try {
      if (editMode) {
        await axios.put(url, formData);
      } else {
        await axios.post('${Config.url()}/compras', formData);
      }
      fetchCompras();
      setShowModal(false);
      resetFormData();
    } catch (error) {
      console.error("Error al guardar compra:", error);
    }
  };

  const resetFormData = () => {
    setFormData({
      id: null,
      cliente_id: "",
      total: 0,
      estado: "pendiente",
      detalles: [],
    });
  };

  const handleEdit = (compra) => {
    setFormData({ ...compra });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${Config.url()}/compras/${id}`);
      fetchCompras();
    } catch (error) {
      console.error("Error al eliminar compra:", error);
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <Button onClick={() => setShowModal(true)}>Agregar Compra</Button>
          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th>Cliente ID</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((compra) => (
                <tr key={compra.id}>
                  <td>{compra.cliente_id}</td>
                  <td>${compra.total}</td>
                  <td>{compra.estado}</td>
                  <td>
                    <Button variant="info" onClick={() => handleEdit(compra)}><FaEdit /></Button>{' '}
                    <Button variant="danger" onClick={() => handleDelete(compra.id)}><FaTrash /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Editar Compra" : "Agregar Compra"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Cliente ID</Form.Label>
              <Form.Control
                type="text"
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Total</Form.Label>
              <Form.Control
                type="number"
                name="total"
                value={formData.total}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Control
                as="select"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                required
              >
                <option value="pendiente">Pendiente</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">
              {editMode ? "Actualizar" : "Agregar"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CompraCRUD;
