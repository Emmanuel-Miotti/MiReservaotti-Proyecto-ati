import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card } from "react-bootstrap";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import NavBar from "../components/Navbar.jsx";
import Config from "../Config";
import DatePicker from "react-datepicker";
import "../../css/Home.css";


const ReservaPage = () => {
  const [paso, setPaso] = useState(1);
  const [idCliente, setIdCliente] = useState(0);
  const [cliente, setCliente] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });
  const [reserva, setReserva] = useState({
    observacion: "",
  });
  const [servicios, setServicios] = useState([]);
  const [duracionReserva, setDuracionReserva] = useState();
  const [precioReserva, setPrecioReserva] = useState();
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const url = new URL(window.location.href);
  const id = url.pathname.split("/").pop();
  const empresaId = id;

  useEffect(() => {
    obtenerServicios();
    const usuario = localStorage.getItem("usuario");
    if (usuario) {
      const usuarioData = JSON.parse(usuario);
      setCliente({
        nombre: usuarioData.name,
        email: usuarioData.email,
        telefono: usuarioData.cellphone || "",
      });
      setIdCliente(usuarioData.id);
      setIsUserLoggedIn(true);
    }
  }, []);

  const obtenerServicios = async () => {
    try {
      const response = await Config.getServicesByEmpresa(empresaId);
      setServicios(response.data);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  const handleSeleccionarServicio = (servicioId) => {
    if (serviciosSeleccionados.includes(servicioId)) {
      setServiciosSeleccionados(
        serviciosSeleccionados.filter((id) => id !== servicioId)
      );
    } else {
      setServiciosSeleccionados([...serviciosSeleccionados, servicioId]);
    }
  };

  const handleServiciosSubmit = (e) => {
    e.preventDefault();
    if (serviciosSeleccionados.length === 0) {
      alert("Selecciona al menos un servicio");
      return;
    }
    setPaso(2);
  };

  const handleFechaHoraSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert("Selecciona una fecha y hora");
      return;
    }
    setPaso(3);
  };

  const handleClienteSubmit = (e) => {
    e.preventDefault();
    if (!cliente.nombre && (!cliente.email || !cliente.telefono)) {
      alert(
        "Por favor completa el campo Nombre y al menos uno de los campos Email o Teléfono"
      );
      return;
    }
    setPaso(4);
  };

  const handleConfirmacionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!isUserLoggedIn) {
        const response = await Config.createReservaPocosDatos({
          agenda_id: empresaId,
          nombre_cliente: cliente.nombre,
          email_cliente: cliente.email,
          telefono_cliente: cliente.telefono,
          fecha: moment(selectedDate).format("YYYY-MM-DD"),
          hora: selectedTime,
          servicios: serviciosSeleccionados,
          duracion: duracionReserva,
          precio: precioReserva,
          observaciones: reserva.observacion,
          estado: "reservado",
        });
      } else {
        const reservaData = {
          cliente_id: idCliente,
          agenda_id: empresaId,
          fecha: moment(selectedDate).format("YYYY-MM-DD"),
          hora: selectedTime,
          duracion: duracionReserva,
          precio: precioReserva,
          estado: "reservado",
          observaciones: reserva.observacion,
          fecha_reserva: moment().format(),
          servicios: serviciosSeleccionados,
        };
        await Config.createReserva(reservaData);
      }
      alert("Reserva creada con éxito");
    } catch (error) {
      if (error.response) {
        alert("Error al crear la reserva");
      }
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    try {
      setDuracionReserva(0);
      setPrecioReserva(0);
      let duracionTotal = 0;
      let precioTotal = 0;
      for (const servicio of serviciosSeleccionados) {
        const response2 = await Config.getServicio(servicio);
        duracionTotal += parseInt(response2.data.duracion, 10);
        precioTotal += parseInt(response2.data.precio, 10);
      }
      setDuracionReserva(duracionTotal);
      setPrecioReserva(precioTotal);
      const response = await Config.getHorariosDisponibles({
        agenda_id: empresaId,
        fecha: moment(date).format("YYYY-MM-DD"),
        duracion_servicios: duracionTotal,
        intervalo_reserva: 30,
      });
      setAvailableTimes(response.data.horas_disponibles);
    } catch (error) {
      console.error("Error al obtener horas disponibles:", error);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const calcularDuracionTotal = (serviciosSeleccionados) => {
    let duracionTotal = 30;
    return duracionTotal;
  };

  return (
    <>
      <NavBar />
    <Container className="mt-3 containercss">
      <h2>Reservación de Servicios</h2>
      {paso === 1 && (
        <Form onSubmit={handleServiciosSubmit}>
          <h3>Selecciona tus servicios</h3>
          <Row>
            {servicios.map((servicio) => (
              <Col md={4} key={servicio.id} className="mb-3">
                <Card
                  className={`service-card ${
                    serviciosSeleccionados.includes(servicio.id)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => handleSeleccionarServicio(servicio.id)}
                >
                  <Card.Body>
                    <Card.Title>{servicio.nombre}</Card.Title>
                    <Card.Text>{servicio.descripcion}</Card.Text>
                    <Card.Text>Precio: {servicio.precio}</Card.Text>
                    <Card.Text>Duración: {servicio.duracion} minutos</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <Button variant="primary" type="submit">
            Siguiente
          </Button>
        </Form>
      )}
      {paso === 2 && (
        <Form onSubmit={handleFechaHoraSubmit}>
          <h2>Selecciona la Fecha y Hora</h2>
          <Row>
            {/* <Col md={3}> 
              <h3>Total de hora y precio</h3>
              <p>
                <strong>Duración Total:</strong> {duracionReserva} minutos
              </p>
              <p>
                <strong>Precio Total:</strong> ${precioReserva}
              </p>
            </Col> */}

            <Col md={3} className="d-flex justify-content-center">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                inline
                dateFormat="yyyy/MM/dd"
                minDate={new Date()}
                className="w-100 custom-datepicker"
                calendarClassName="custom-calendar"
              />
            </Col>
            <Col md={6}>
              <h3>Horas Disponibles</h3>
              <div className="mb-3">
                {availableTimes.map((time) => (
                  <Button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`m-1 ${
                      selectedTime === time ? "btn-selected" : "btn-available"
                    }`}
                  >
                    {time}
                  </Button>
                ))}
              </div>
              <Button variant="primary" type="submit">
                Siguiente
              </Button>
            </Col>
          </Row>
        </Form>
      )}
      {paso === 3 && (
        <Form onSubmit={handleClienteSubmit}>
          <Form.Group controlId="nombre">
            <Form.Label>Nombre:</Form.Label>
            <Form.Control
              type="text"
              value={cliente.nombre}
              onChange={(e) =>
                setCliente({ ...cliente, nombre: e.target.value })
              }
              required
              readOnly={isUserLoggedIn}
            />
          </Form.Group>
          <Form.Group controlId="email">
            <Form.Label>Email:</Form.Label>
            <Form.Control
              type="email"
              value={cliente.email}
              onChange={(e) =>
                setCliente({ ...cliente, email: e.target.value })
              }
              required
              readOnly={isUserLoggedIn}
            />
          </Form.Group>
          <Form.Group controlId="telefono">
            <Form.Label>Teléfono:</Form.Label>
            <Form.Control
              type="text"
              value={cliente.telefono}
              onChange={(e) =>
                setCliente({ ...cliente, telefono: e.target.value })
              }
              required
              readOnly={isUserLoggedIn}
            />
          </Form.Group>
          <Form.Group controlId="observacion">
            <Form.Label>Observación:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reserva.observacion}
              onChange={(e) =>
                setReserva({ ...reserva, observacion: e.target.value })
              }
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Siguiente
          </Button>
        </Form>
      )}
      {paso === 4 && (
        <div>
          <h3>Confirmación de Reserva</h3>
          <p>
            <strong>Cliente:</strong> {cliente.nombre}
          </p>
          <p>
            <strong>Email:</strong> {cliente.email}
          </p>
          <p>
            <strong>Teléfono:</strong> {cliente.telefono}
          </p>
          <p>
            <strong>Fecha:</strong>{" "}
            {moment(selectedDate).format("dddd, DD [de] MMMM [de] YYYY")}
          </p>
          <p>
            <strong>Hora:</strong> {selectedTime}
          </p>
          <p>
            <strong>Servicios Seleccionados:</strong>
          </p>
          <ul>
            {serviciosSeleccionados.map((servicioId) => {
              const servicio = servicios.find(
                (servicio) => servicio.id === servicioId
              );
              return servicio ? (
                <li key={servicio.id}>{servicio.nombre}</li>
              ) : null;
            })}
          </ul>
          <Button variant="success" onClick={handleConfirmacionSubmit}>
            Confirmar Reserva
          </Button>
        </div>
      )}
      {paso > 1 && (
        <Button
          variant="secondary"
          onClick={() => setPaso(paso - 1)}
          style={{ marginTop: "20px" }}
        >
          Volver
        </Button>
      )}
    </Container>
    </>
  );
};

export default ReservaPage;

