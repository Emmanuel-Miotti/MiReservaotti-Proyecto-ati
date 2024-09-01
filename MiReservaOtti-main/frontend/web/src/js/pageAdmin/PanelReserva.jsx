import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import axios from "axios";

const ReservaForm = ({ empresaId }) => {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [duracion, setDuracion] = useState(30); // Duración por defecto en minutos
  const [servicios, setServicios] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerServicios();
  }, []);

  const obtenerServicios = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/v1/servicios/empresa/${empresaId}`
      );
      setServicios(response.data);
    } catch (error) {
      console.error("Error al obtener servicios:", error);
      setError(
        "Error al cargar servicios. Por favor, inténtalo de nuevo más tarde."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar si se ha seleccionado fecha, hora y al menos un servicio
    if (!fecha || !hora || servicios.length === 0) {
      setError("Debe seleccionar fecha, hora y al menos un servicio.");
      return;
    }
 
    try {
      // Crear la reserva en la API
      await axios.post("http://127.0.0.1:8000/api/v1/reservas", {
        cliente_id: 1, // Aquí deberías usar el ID del cliente actualmente autenticado
        agenda_id: 1, // Aquí deberías obtener el ID de la agenda activa de la empresa
        fecha,
        hora,
        duracion,
        precio: calcularPrecio(), // Aquí deberías calcular el precio según los servicios seleccionados
        estado: "reservado",
        observaciones: "",
        fecha_reserva: new Date(),
        servicios: servicios.map((servicio) => servicio.id), // Enviar solo los IDs de los servicios
      });

      // Reiniciar estado y mostrar mensaje de éxito
      setFecha("");
      setHora("");
      setDuracion(30);
      setServicios([]);
      setError("");
      alert("¡Reserva realizada con éxito!");
    } catch (error) {
      console.error("Error al hacer la reserva:", error);
      setError(
        "Error al hacer la reserva. Por favor, inténtalo de nuevo más tarde."
      );
    }
  };

  const calcularPrecio = () => {
    // Aquí deberías implementar la lógica para calcular el precio total de la reserva
    // basado en los servicios seleccionados y la duración.
    // Ejemplo básico:
    return servicios.reduce((total, servicio) => total + servicio.precio, 0);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h2>Formulario de Reserva</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formFecha">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formHora">
              <Form.Label>Hora</Form.Label>
              <Form.Control
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formServicios">
              <Form.Label>Servicios</Form.Label>
              <Form.Control
                as="select"
                multiple
                value={servicios.map((servicio) => servicio.id)}
                onChange={(e) => {
                  const selectedServices = Array.from(
                    e.target.selectedOptions,
                    (option) => Number(option.value)
                  );
                  setServicios(
                    servicios.filter((servicio) =>
                      selectedServices.includes(servicio.id)
                    )
                  );
                }}
                required
              >
                {servicios.map((servicio) => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.nombre} - {servicio.descripcion} - $
                    {servicio.precio}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">
              Realizar Reserva
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default ReservaForm;
