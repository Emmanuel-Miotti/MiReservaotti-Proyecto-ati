import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import AuthUser from "../pageauth/AuthUser";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaSignOutAlt } from "react-icons/fa";
import Config from "../Config";
import NavBar from "../components/Navbar.jsx";

const ReservaCRUD = () => {
  const { getUser } = AuthUser();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nombresClientes, setNombresClientes] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    cliente_id: "",
    nombre_cliente: "",
    email_cliente: "",
    telefono_cliente: "",
    agenda_id: "",
    fecha: "",
    hora: "",
    duracion: 60,
    precio: 0,
    estado: "reservado",
    observaciones: "",
    servicios: [],
    isRegistered: false,
  });

  useEffect(() => {
    
    // if(getUser()) {
    //   if(getUser().rol != "Empresa") {
    //     navigate(`/Cliente`)
    //   }
    // }




    fetchReservas();
  }, []);


  const traerNombre = async (clienteId) => {
    try {
      const cliente = await Config.getCliente(clienteId);
      console.log(cliente);
      return cliente.data.data.name;
    } catch (error) {
      console.error("Error al obtener el nombre del cliente:", error);
      return "Desconocido"; // Valor por defecto en caso de error
    }
  };

  const fetchReservas = async () => {
    try {
      const userId = getUser().id;
      const [response1, response2] = await Promise.all([
        // await Config.getReservasEmpresa(userId),
        // await Config.getReservasSinUsuarioEmpresa(userId)
        axios.get(`${Config.url()}/reservas/empresa/${userId}`),
        axios.get(`${Config.url()}/reservas2/empresa/${userId}`),
      ]);

      const reservasRegistradas = response1.data.data;
      const reservasNoRegistradas = response2.data.data;

      const allReservas = [
        ...reservasRegistradas.map((r) => ({ ...r, isRegistered: true })),
        ...reservasNoRegistradas.map((r) => ({ ...r, isRegistered: false })),
      ];

      const nombresPromises = allReservas.map(async (reserva) => {
        if (reserva.isRegistered) {
          const nombre = await traerNombre(reserva.cliente_id);
          console.log(nombre);
          return { ...reserva, nombre_cliente: nombre };
        } else {
          return reserva;
        }
      });
  
      const reservasConNombres = await Promise.all(nombresPromises);
      setReservas(reservasConNombres);

    //   setReservas(allReservas);
    } catch (error) {
      console.error("Error al obtener reservas:", error);
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
    try {
      if (editMode) {
        const url = formData.isRegistered
          ?  `${Config.url()}/reservas/${formData.id}`
          :  `${Config.url()}/reservasUsuarioNoRegistrado/${formData.id}`;
       await axios.put(url, formData);
      //  ?  Config.editReserva(formData.id, formData) 
      //  :  Config.editReservaSinUsuario(formData.id, formData) 
  
      } else {
        await axios.post(`${Config.url()}/reservas`, formData);
      }
      fetchReservas();
      setShowModal(false);
      resetFormData();
    } catch (error) {
      console.error("Error al guardar reserva:", error);
    }
  };

  const resetFormData = () => {
    setFormData({
      id: null,
      cliente_id: "",
      nombre_cliente: "",
      email_cliente: "",
      telefono_cliente: "",
      agenda_id: "",
      fecha: "",
      hora: "",
      duracion: 60,
      precio: 0,
      estado: "reservado",
      observaciones: "",
      servicios: [],
      isRegistered: false,
    });
  };

  const handleEdit = (reserva) => {
    setFormData(reserva);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id, isRegistered) => {
    try {
      const url = isRegistered
        ?  await Config.deleteReserva(id) //`http://127.0.0.1:8000/api/v1/reservas/${id}`
        :  await Config.deleteReservaSinUsuario(id) //`http://127.0.0.1:8000/api/v1/reservasUsuarioNoRegistrado/${id}`;
      // await axios.delete(url);
      fetchReservas();
    } catch (error) {
      console.error("Error al eliminar reserva:", error);
    }
  };

  return (
    <>
    <NavBar />
    <Container className="mt-2">
      <div className="d-grid gap-2 d-md-flex justify-content-md-start mt-3">
        <Button onClick={() => navigate("/agenda")}>
          <FaSignOutAlt className="me-2" /> Volver
        </Button>
      </div>

      <h1 className="mt-3">Reservas</h1>
      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>Nombre cliente</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Duración</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservas.map((reserva) => (
            <tr key={reserva.id}>
            <td>
              {reserva.nombre_cliente}
            </td>
              <td>{reserva.fecha}</td>
              <td>{reserva.hora}</td>
              <td>{reserva.duracion} min</td>
              <td>${reserva.precio}</td>
              <td>{reserva.estado}</td>
              <td>
                <Button variant="info" onClick={() => handleEdit(reserva)}>
                  Editar
                </Button>{" "}
                <Button
                  variant="danger"
                  onClick={() => handleDelete(reserva.id, reserva.isRegistered)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? "Editar Reserva" : "Agregar Reserva"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              {/* <Col>
                <Form.Group controlId="cliente_id">
                  <Form.Label>Cliente ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="cliente_id"
                    value={formData.cliente_id}
                    onChange={handleInputChange}
                    required={!formData.isRegistered}
                    disabled={formData.isRegistered}
                  />
                </Form.Group>
              </Col> */}
              <Col>
                <Form.Group controlId="nombre_cliente">
                  <Form.Label>Nombre Cliente</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre_cliente"
                    value={formData.nombre_cliente}
                    onChange={handleInputChange}
                    required={!formData.isRegistered}
                    disabled={formData.isRegistered}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group controlId="email_cliente">
                  <Form.Label>Email Cliente</Form.Label>
                  <Form.Control
                    type="email"
                    name="email_cliente"
                    value={formData.email_cliente}
                    onChange={handleInputChange}
                    disabled={formData.isRegistered}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="telefono_cliente">
                  <Form.Label>Teléfono Cliente</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefono_cliente"
                    value={formData.telefono_cliente}
                    onChange={handleInputChange}
                    disabled={formData.isRegistered}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              {/* <Col>
                <Form.Group controlId="agenda_id">
                  <Form.Label>Agenda ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="agenda_id"
                    value={formData.agenda_id}
                    onChange={handleInputChange}
                    disabled={formData.isRegistered}
                  />
                </Form.Group>
              </Col> */}
              <Col>
                <Form.Group controlId="fecha">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="hora">
                  <Form.Label>Hora</Form.Label>
                  <Form.Control
                    type="time"
                    name="hora"
                    value={formData.hora}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group controlId="duracion">
                  <Form.Label>Duración (minutos)</Form.Label>
                  <Form.Control
                    type="number"
                    name="duracion"
                    value={formData.duracion}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="precio">
                  <Form.Label>Precio</Form.Label>
                  <Form.Control
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="estado">
              <Form.Label>Estado</Form.Label>
              <Form.Control
                as="select"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                required
              >
                <option value="reservado">Reservado</option>
                <option value="cancelado">Cancelado</option>
                <option value="en espera">En espera</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="observaciones">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                as="textarea"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              {editMode ? "Guardar Cambios" : "Agregar Reserva"}
            </Button>{" "}
            <Button variant="secondary" onClick={() => setShowModal(false)} className="mt-3">
              Cerrar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* </> 
      ) : (
        <p>No hay reservas</p>
      )} */}
    </Container>
     </>
  );
};

export default ReservaCRUD;