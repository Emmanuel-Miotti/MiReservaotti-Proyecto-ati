import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Container,
  Row,
  Col,
  Modal,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import AuthUser from "../pageauth/AuthUser";
import Config from "../Config";


const localizer = momentLocalizer(moment);

const AgendaPanel = () => {
  const { getUser } = AuthUser();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [empresaId, setEmpresaId] = useState();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ // Estado para almacenar los datos del formulario
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
});
  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  useEffect(() => {
    obtenerServicios();
    obtenerReservas();
    console.log(reservas);
  }, []);

  const handleSelectEvento = (evento) => {
    setEventoSeleccionado(evento);
  };

  const handleCloseModal = () => {
    setEventoSeleccionado(null);
  };

  //   const handleCloseModal = () => {
//     setEventoSeleccionado(null);
//   };

  const obtenerReservas = async () => {
    try {
      const userId = getUser().id;
      const [response1, response2] = await Promise.all([
        await Config.getReservasEmpresa(userId),
        await Config.getReservasSinUsuarioEmpresa(userId)
      ]);

      const reservasRegistradas = response1.data.data;
      const reservasNoRegistradas = response2.data.data;

      // Añadir una propiedad 'isRegistered' para diferenciar los tipos de reservas
      const allReservas = [
          ...reservasRegistradas.map(r => ({ ...r, isRegistered: true })),
          ...reservasNoRegistradas.map(r => ({ ...r, isRegistered: false }))
      ];

      console.log(allReservas);

      setReservas(allReservas);
      
  } catch (error) {
      console.error("Error al obtener reservas:", error);
  }
};

  const obtenerServicios = async () => {
    try {
      const response = await Config.getServicesByEmpresa(getUser().id);
      setServicios(response.data);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  const handleSeleccionarServicio = (servicioId) => {
    const newServiciosSeleccionados = serviciosSeleccionados.includes(
      servicioId
    )
      ? serviciosSeleccionados.filter((id) => id !== servicioId)
      : [...serviciosSeleccionados, servicioId];

    setServiciosSeleccionados(newServiciosSeleccionados);

    const precio = newServiciosSeleccionados.reduce((acc, id) => {
      const servicio = servicios.find((servicio) => servicio.id === id);
      return acc + (servicio ? parseInt(servicio.precio, 10) : 0);
    }, 0);

    const duracion = newServiciosSeleccionados.reduce((acc, id) => {
      const servicio = servicios.find((servicio) => servicio.id === id);
      return acc + (servicio ? parseInt(servicio.duracion, 10) : 0);
    }, 0);

    setFormData((prevFormData) => ({
      ...prevFormData,
      servicios: newServiciosSeleccionados,
      precio: precio,
      duracion: duracion,
    }));
  };

  const calcularFechaFin = (fecha, hora, duracion) => {
    const fechaInicio = new Date(fecha + "T" + hora);
    const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
    return fechaFin;
  };

  const eventos = reservas.map((reserva) => ({
    id: reserva.id,
    title: `Reserva para ${reserva.isRegistered ? reserva.cliente_id : reserva.nombre_cliente}`,
    start: new Date(reserva.fecha + "T" + reserva.hora),
    end: calcularFechaFin(reserva.fecha, reserva.hora, reserva.duracion),
    precio: reserva.precio,
    duracion: reserva.duracion,
    estado: reserva.estado,
    servicios: reserva.servicios,
  }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectSlot = (slotInfo) => {
    setFormData({
      ...formData,
      fecha: moment(slotInfo.start).format("YYYY-MM-DD"),
      hora: moment(slotInfo.start).format("HH:mm:ss"),
    });
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setSubmitError("");
    setShowSuccessModal(false);

    if (serviciosSeleccionados.length === 0) {
      setSubmitError("Debe seleccionar al menos un servicio.");
      return;
    }

    const fechaHoraSeleccionada = new Date(
      formData.fecha + "T" + formData.hora
    );
    const fechaHoraActual = new Date();

    if (fechaHoraSeleccionada <= fechaHoraActual) {
      setSubmitError(
        "La fecha y hora seleccionadas deben ser posteriores a la fecha y hora actuales."
      );
      return;
    }

    try {
      const response = await Config.createReservaPocosDatos({
        agenda_id: getUser().id,
        nombre_cliente: formData.nombre,
        email_cliente: formData.email,
        telefono_cliente: formData.telefono,
        fecha: formData.fecha,
        hora: formData.hora,
        servicios: serviciosSeleccionados,
        duracion: formData.duracion,
        precio: formData.precio,
        observaciones: formData.observaciones,
        estado: "reservado",
      });
      console.log(response);
      setShowModal(false);
      setShowSuccessModal(true);
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        fecha: "",
        hora: "",
        duracion: 60,
        precio: 0,
        estado: "reservado",
        observaciones: "",
        servicios: [],
      });
      setServiciosSeleccionados([]);
      obtenerReservas();
    } catch (error) {
      console.error("Error al agregar reserva:", error);
      if (error.response) {
        const { data } = error.response;
        setErrors(data.errors || {});
      }
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      <NavBar />
      <Container className="mt-1">
        <Row className="mt-3">
          <Col>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Agregar Reserva
            </Button>
            
            <Button
              variant="secondary"
              className="ml-2"
              onClick={() => navigate(`/reservas`)}
            >
              Ver Reservas
            </Button>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col>
            <Calendar
              localizer={localizer}
              events={eventos}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              onSelectEvent={handleSelectSlot}
              selectable
            />
          </Col>
        </Row>

        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Agregar Reserva</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              {submitError && <Alert variant="danger">{submitError}</Alert>}
              <Form.Group controlId="nombre">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  isInvalid={!!errors.nombre_cliente}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.nombre_cliente}
                </Form.Control.Feedback>
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group controlId="cliente_id">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      isInvalid={!!errors.email_cliente}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email_cliente}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="agenda_id">
                    <Form.Label>Telefono</Form.Label>
                    <Form.Control
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      isInvalid={!!errors.telefono_cliente}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.telefono_cliente}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Group controlId="fecha">
                    <Form.Label>Fecha</Form.Label>
                    <Form.Control
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleInputChange}
                      isInvalid={!!errors.fecha}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.fecha}
                    </Form.Control.Feedback>
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
                      isInvalid={!!errors.hora}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.hora}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group controlId="observaciones">
                <Form.Label>Observaciones</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group controlId="servicios">
                <Form.Label>Servicios</Form.Label>
                <Row>
                  {servicios.map((servicio) => (
                    <Col key={servicio.id}>
                      <Form.Check
                        type="checkbox"
                        id={servicio.id}
                        label={`${servicio.nombre} - $${servicio.precio}`}
                        checked={serviciosSeleccionados.includes(servicio.id)}
                        onChange={() => handleSeleccionarServicio(servicio.id)}
                      />
                    </Col>
                  ))}
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
                        isInvalid={!!errors.duracion}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.duracion}
                      </Form.Control.Feedback>
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
                        isInvalid={!!errors.precio}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.precio}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </Form.Group>

              <Button variant="primary" type="submit">
                Agregar
              </Button>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal
          show={showSuccessModal}
          onHide={handleCloseSuccessModal}
          size="sm"
        >
          <Modal.Header closeButton>
            <Modal.Title>Reserva realizada con éxito</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Tu reserva ha sido creada exitosamente.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleCloseSuccessModal}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>


        <Modal show={eventoSeleccionado !== null} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {eventoSeleccionado && (
            <div>
              <p>
                <strong>Cliente:</strong>{" "}
                {eventoSeleccionado.title.replace("Reserva para ", "")}
              </p>
              <p>
                <strong>Precio:</strong> $ {eventoSeleccionado.precio}
              </p>
              <p>
                <strong>Duración:</strong> {eventoSeleccionado.duracion} minutos
              </p>
              <p>
                <strong>Estado:</strong> {eventoSeleccionado.estado}
              </p>
              <p>
                <strong>Servicios:</strong>{" "}
                {eventoSeleccionado.servicios}
              </p>
              <p>
                <strong>Fecha y Hora de Inicio:</strong>{" "}
                {new Date(eventoSeleccionado.start).toLocaleString()}
              </p>
              <p>
                <strong>Fecha y Hora de Fin:</strong>{" "}
                {new Date(eventoSeleccionado.end).toLocaleString()}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
      </Container>
      <Footer />
    </>
  );
};

export default AgendaPanel;



// import React, { useState, useEffect } from "react";
// import { Calendar, momentLocalizer } from "react-big-calendar";
// import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import {
//   Container,
//   Row,
//   Col,
//   Modal,
//   Button,
//   Form,
//   Alert,
// } from "react-bootstrap";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import NavBar from "../components/Navbar.jsx";
// import Footer from "../components/Footer.jsx";
// import AuthUser from "../pageauth/AuthUser";
// import Config from "../Config";

// const localizer = momentLocalizer(moment);

// const AgendaPanel = () => {
//   const navigate = useNavigate();
//   const { getUser } = AuthUser();
//   const [reservas, setReservas] = useState([]);
//   const [empresaId, setEmpresaId] = useState();
//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState({
//     nombre: "",
//     email: "",
//     telefono: "",
//     fecha: "",
//     hora: "",
//     duracion: 60,
//     precio: 0,
//     estado: "reservado",
//     observaciones: "",
//     servicios: [],
//   });
//   const [servicios, setServicios] = useState([]);
//   const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [submitError, setSubmitError] = useState("");
//   const [showSuccessModal, setShowSuccessModal] = useState(false);

//   useEffect(() => {
//     obtenerServicios();
//     obtenerReservas();
//   }, []);

//   const obtenerReservas = async () => {
//     try {
//       const response = await axios.get(
//         `http://127.0.0.1:8000/api/v1/reservas/empresa/${getUser().id}`
//       );
//       setReservas(response.data.data);
//     } catch (error) {
//       console.error("Error al obtener reservas:", error);
//     }
//   };

//   const obtenerServicios = async () => {
//     try {
//       const response = await Config.getServicesByEmpresa(getUser().id);
//       setServicios(response.data);
//     } catch (error) {
//       console.error("Error al cargar servicios:", error);
//     }
//   };

//   const handleSeleccionarServicio = (servicioId) => {
//     const newServiciosSeleccionados = serviciosSeleccionados.includes(
//       servicioId
//     )
//       ? serviciosSeleccionados.filter((id) => id !== servicioId)
//       : [...serviciosSeleccionados, servicioId];

//     setServiciosSeleccionados(newServiciosSeleccionados);

//     const precio = newServiciosSeleccionados.reduce((acc, id) => {
//       const servicio = servicios.find((servicio) => servicio.id === id);
//       return acc + (servicio ? parseInt(servicio.precio, 10) : 0);
//     }, 0);

//     const duracion = newServiciosSeleccionados.reduce((acc, id) => {
//       const servicio = servicios.find((servicio) => servicio.id === id);
//       return acc + (servicio ? parseInt(servicio.duracion, 10) : 0);
//     }, 0);

//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       servicios: newServiciosSeleccionados,
//       precio: precio,
//       duracion: duracion,
//     }));
//   };

//   const calcularFechaFin = (fecha, hora, duracion) => {
//     const fechaInicio = new Date(fecha + "T" + hora);
//     const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
//     return fechaFin;
//   };

//   const eventos = reservas.map((reserva) => ({
//     id: reserva.id,
//     title: `Reserva para ${reserva.cliente.name}`,
//     start: new Date(reserva.fecha + "T" + reserva.hora),
//     end: calcularFechaFin(reserva.fecha, reserva.hora, reserva.duracion),
//     precio: reserva.precio,
//     duracion: reserva.duracion,
//     estado: reserva.estado,
//     servicios: reserva.servicios,
//   }));

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   const handleSelectSlot = (slotInfo) => {
//     setFormData({
//       ...formData,
//       fecha: moment(slotInfo.start).format("YYYY-MM-DD"),
//       hora: moment(slotInfo.start).format("HH:mm:ss"),
//     });
//     setShowModal(true);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setErrors({});
//     setSubmitError("");
//     setShowSuccessModal(false);

//     if (serviciosSeleccionados.length === 0) {
//       setSubmitError("Debe seleccionar al menos un servicio.");
//       return;
//     }

//     const fechaHoraSeleccionada = new Date(
//       formData.fecha + "T" + formData.hora
//     );
//     const fechaHoraActual = new Date();

//     if (fechaHoraSeleccionada <= fechaHoraActual) {
//       setSubmitError(
//         "La fecha y hora seleccionadas deben ser posteriores a la fecha y hora actuales."
//       );
//       return;
//     }

//     try {
//       const response = await Config.createReservaPocosDatos({
//         agenda_id: getUser().id,
//         nombre_cliente: formData.nombre,
//         email_cliente: formData.email,
//         telefono_cliente: formData.telefono,
//         fecha: formData.fecha,
//         hora: formData.hora,
//         servicios: serviciosSeleccionados,
//         duracion: formData.duracion,
//         precio: formData.precio,
//         observaciones: formData.observaciones,
//         estado: "reservado",
//       });
//       console.log(response);
//       setShowModal(false);
//       setShowSuccessModal(true);
//       setFormData({
//         nombre: "",
//         email: "",
//         telefono: "",
//         fecha: "",
//         hora: "",
//         duracion: 60,
//         precio: 0,
//         estado: "reservado",
//         observaciones: "",
//         servicios: [],
//       });
//       setServiciosSeleccionados([]);
//       obtenerReservas();
//     } catch (error) {
//       console.error("Error al agregar reserva:", error);
//       if (error.response) {
//         const { data } = error.response;
//         setErrors(data.errors || {});
//       }
//     }
//   };

//   const handleCloseSuccessModal = () => {
//     setShowSuccessModal(false);
//   };

//   return (
//     <>
//       <NavBar />
//       <Container className="mt-1">
//         <Row className="mt-3">
//           <Col>
//             <Button variant="primary" onClick={() => setShowModal(true)}>
//               Agregar Reserva
//             </Button>
//             <Button
//               variant="secondary"
//               className="ml-2"
//               onClick={() => navigate(`/reservas`)}
//             >
//               Ver Reservas
//             </Button>
//           </Col>
//         </Row>

//         <Row className="mt-3">
//           <Col>
//             <Calendar
//               localizer={localizer}
//               events={eventos}
//               startAccessor="start"
//               endAccessor="end"
//               style={{ height: 500 }}
//               onSelectSlot={handleSelectSlot}
//               selectable
//             />
//           </Col>
//         </Row>

//         <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
//           <Modal.Header closeButton>
//             <Modal.Title>Agregar Reserva</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form onSubmit={handleSubmit}>
//               {submitError && <Alert variant="danger">{submitError}</Alert>}
//               <Form.Group controlId="nombre">
//                 <Form.Label>Nombre</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="nombre"
//                   value={formData.nombre}
//                   onChange={handleInputChange}
//                   isInvalid={!!errors.nombre_cliente}
//                   required
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.nombre_cliente}
//                 </Form.Control.Feedback>
//               </Form.Group>
//               <Row>
//                 <Col>
//                   <Form.Group controlId="cliente_id">
//                     <Form.Label>Email</Form.Label>
//                     <Form.Control
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       isInvalid={!!errors.email_cliente}
//                     />
//                     <Form.Control.Feedback type="invalid">
//                       {errors.email_cliente}
//                     </Form.Control.Feedback>
//                   </Form.Group>
//                 </Col>
//                 <Col>
//                   <Form.Group controlId="agenda_id">
//                     <Form.Label>Telefono</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="telefono"
//                       value={formData.telefono}
//                       onChange={handleInputChange}
//                       isInvalid={!!errors.telefono_cliente}
//                     />
//                     <Form.Control.Feedback type="invalid">
//                       {errors.telefono_cliente}
//                     </Form.Control.Feedback>
//                   </Form.Group>
//                 </Col>
//               </Row>

//               <Row>
//                 <Col>
//                   <Form.Group controlId="fecha">
//                     <Form.Label>Fecha</Form.Label>
//                     <Form.Control
//                       type="date"
//                       name="fecha"
//                       value={formData.fecha}
//                       onChange={handleInputChange}
//                       isInvalid={!!errors.fecha}
//                       required
//                     />
//                     <Form.Control.Feedback type="invalid">
//                       {errors.fecha}
//                     </Form.Control.Feedback>
//                   </Form.Group>
//                 </Col>
//                 <Col>
//                   <Form.Group controlId="hora">
//                     <Form.Label>Hora</Form.Label>
//                     <Form.Control
//                       type="time"
//                       name="hora"
//                       value={formData.hora}
//                       onChange={handleInputChange}
//                       isInvalid={!!errors.hora}
//                       required
//                     />
//                     <Form.Control.Feedback type="invalid">
//                       {errors.hora}
//                     </Form.Control.Feedback>
//                   </Form.Group>
//                 </Col>
//               </Row>

//               <Form.Group controlId="observaciones">
//                 <Form.Label>Observaciones</Form.Label>
//                 <Form.Control
//                   as="textarea"
//                   rows={3}
//                   name="observaciones"
//                   value={formData.observaciones}
//                   onChange={handleInputChange}
//                 />
//               </Form.Group>

//               <Form.Group controlId="servicios">
//                 <Form.Label>Servicios</Form.Label>
//                 <Row>
//                   {servicios.map((servicio) => (
//                     <Col key={servicio.id}>
//                       <Form.Check
//                         type="checkbox"
//                         id={servicio.id}
//                         label={`${servicio.nombre} - $${servicio.precio}`}
//                         checked={serviciosSeleccionados.includes(servicio.id)}
//                         onChange={() => handleSeleccionarServicio(servicio.id)}
//                       />
//                     </Col>
//                   ))}
//                 </Row>

//                 <Row>
//                   <Col>
//                     <Form.Group controlId="duracion">
//                       <Form.Label>Duración (minutos)</Form.Label>
//                       <Form.Control
//                         type="number"
//                         name="duracion"
//                         value={formData.duracion}
//                         onChange={handleInputChange}
//                         isInvalid={!!errors.duracion}
//                         required
//                       />
//                       <Form.Control.Feedback type="invalid">
//                         {errors.duracion}
//                       </Form.Control.Feedback>
//                     </Form.Group>
//                   </Col>
//                   <Col>
//                     <Form.Group controlId="precio">
//                       <Form.Label>Precio</Form.Label>
//                       <Form.Control
//                         type="number"
//                         name="precio"
//                         value={formData.precio}
//                         onChange={handleInputChange}
//                         isInvalid={!!errors.precio}
//                         required
//                       />
//                       <Form.Control.Feedback type="invalid">
//                         {errors.precio}
//                       </Form.Control.Feedback>
//                     </Form.Group>
//                   </Col>
//                 </Row>
//               </Form.Group>

//               <Button variant="primary" type="submit">
//                 Agregar
//               </Button>
//             </Form>
//           </Modal.Body>
//         </Modal>

//         <Modal
//           show={showSuccessModal}
//           onHide={handleCloseSuccessModal}
//           size="sm"
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Reserva realizada con éxito</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <p>Tu reserva ha sido creada exitosamente.</p>
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="primary" onClick={handleCloseSuccessModal}>
//               Cerrar
//             </Button>
//           </Modal.Footer>
//         </Modal>
//       </Container>
//       <Footer />
//     </>
//   );
// };

// export default AgendaPanel;

// import React, { useState, useEffect } from "react";
// import { Calendar, momentLocalizer } from "react-big-calendar";
// import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import { Container, Row, Col, Modal, Button, Form, Alert } from "react-bootstrap";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import NavBar from "../components/Navbar.jsx";
// import Footer from "../components/Footer.jsx";
// import AuthUser from "../pageauth/AuthUser";
// import Config from "../Config";

// const localizer = momentLocalizer(moment);

// const AgendaPanel = () => {
//   const navigate = useNavigate();
//   const { getUser } = AuthUser();
//   const [reservas, setReservas] = useState([]);
//   const [empresaId, setEmpresaId] = useState();
//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState({
//     nombre: "",
//     email: "",
//     telefono: "",
//     fecha: "",
//     hora: "",
//     duracion: 60,
//     precio: 0,
//     estado: "reservado",
//     observaciones: "",
//     servicios: [],
//   });
//   const [servicios, setServicios] = useState([]);
//   const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [submitError, setSubmitError] = useState(""); // State to hold the submit error
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [eventoSeleccionado, setEventoSeleccionado] = useState(null); // State to hold the selected event

//   useEffect(() => {
//     obtenerServicios();
//     obtenerReservas();
//   }, []);

//   const obtenerReservas = async () => {
//     try {
//       const response = await axios.get(
//         `http://127.0.0.1:8000/api/v1/reservas/empresa/${getUser().id}`
//       );
//       setReservas(response.data.data);
//     } catch (error) {
//       console.error("Error al obtener reservas:", error);
//     }
//   };

//   const obtenerServicios = async () => {
//     try {
//       const response = await Config.getServicesByEmpresa(getUser().id);
//       setServicios(response.data);
//     } catch (error) {
//       console.error("Error al cargar servicios:", error);
//     }
//   };

//   const handleSeleccionarServicio = (servicioId) => {
//     const newServiciosSeleccionados = serviciosSeleccionados.includes(servicioId)
//       ? serviciosSeleccionados.filter((id) => id !== servicioId)
//       : [...serviciosSeleccionados, servicioId];

//     setServiciosSeleccionados(newServiciosSeleccionados);

//     const precio = newServiciosSeleccionados.reduce((acc, id) => {
//       const servicio = servicios.find((servicio) => servicio.id === id);
//       return acc + (servicio ? parseInt(servicio.precio, 10) : 0);
//     }, 0);

//     const duracion = newServiciosSeleccionados.reduce((acc, id) => {
//       const servicio = servicios.find((servicio) => servicio.id === id);
//       return acc + (servicio ? parseInt(servicio.duracion, 10) : 0);
//     }, 0);

//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       servicios: newServiciosSeleccionados,
//       precio: precio,
//       duracion: duracion,
//     }));
//   };

//   const calcularFechaFin = (fecha, hora, duracion) => {
//     const fechaInicio = new Date(fecha + "T" + hora);
//     const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
//     return fechaFin;
//   };

//   const eventos = reservas.map((reserva) => ({
//     id: reserva.id,
//     title: `Reserva para ${reserva.cliente.name}`,
//     start: new Date(reserva.fecha + "T" + reserva.hora),
//     end: calcularFechaFin(reserva.fecha, reserva.hora, reserva.duracion),
//     precio: reserva.precio,
//     duracion: reserva.duracion,
//     estado: reserva.estado,
//     servicios: reserva.servicios,
//   }));

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   const handleSelectSlot = (slotInfo) => {
//     setFormData({
//       ...formData,
//       fecha: moment(slotInfo.start).format("YYYY-MM-DD"),
//       hora: moment(slotInfo.start).format("HH:mm:ss"),
//     });
//     setShowModal(true);
//   };

//   const handleSelectEvent = (event) => {
//     setEventoSeleccionado(event);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setErrors({});
//     setSubmitError("");
//     setShowSuccessModal(false);

//     if (serviciosSeleccionados.length === 0) {
//       setSubmitError("Debe seleccionar al menos un servicio.");
//       return;
//     }

//     try {
//       const response = await Config.createReservaPocosDatos({
//         agenda_id: getUser().id,
//         nombre_cliente: formData.nombre,
//         email_cliente: formData.email,
//         telefono_cliente: formData.telefono,
//         fecha: formData.fecha,
//         hora: formData.hora,
//         servicios: serviciosSeleccionados,
//         duracion: formData.duracion,
//         precio: formData.precio,
//         observaciones: formData.observaciones,
//         estado: "reservado"
//       });
//       console.log(response);
//       setShowModal(false);
//       setShowSuccessModal(true);
//       setFormData({
//         nombre: "",
//         email: "",
//         telefono: "",
//         fecha: "",
//         hora: "",
//         duracion: 60,
//         precio: 0,
//         estado: "reservado",
//         observaciones: "",
//         servicios: [],
//       });
//       setServiciosSeleccionados([]);
//       obtenerReservas();
//     } catch (error) {
//       console.error("Error al agregar reserva:", error);
//       if (error.response) {
//         const { data } = error.response;
//         setErrors(data.errors || {});
//       }
//     }
//   };

//   const handleCloseSuccessModal = () => {
//     setShowSuccessModal(false);
//   };

//   const handleCloseModal = () => {
//     setEventoSeleccionado(null);
//   };

//   return (
//     <>
//       <NavBar />
//       <Container className="mt-1">
//         <Row className="mt-3">
//           <Col>
//             <Button variant="primary" onClick={() => setShowModal(true)}>
//               Agregar Reserva
//             </Button>
//             <Button
//               variant="secondary"
//               className="ml-2"
//               onClick={() => navigate(`/reservas`)}
//             >
//               Ver Reservas
//             </Button>
//           </Col>
//         </Row>

//         <Row className="mt-3">
//           <Col>
//             <Calendar
//               localizer={localizer}
//               events={eventos}
//               startAccessor="start"
//               endAccessor="end"
//               style={{ height: 500 }}
//               onSelectSlot={handleSelectSlot}
//               onSelectEvent={handleSelectEvent} // Add this line
//               selectable
//             />
//           </Col>
//         </Row>

//         <Modal show={eventoSeleccionado !== null} onHide={handleCloseModal}>
//           <Modal.Header closeButton>
//             <Modal.Title>Detalles de la Reserva</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             {eventoSeleccionado && (
//               <div>
//                 <p>
//                   <strong>Cliente:</strong>{" "}
//                   {eventoSeleccionado.title.replace("Reserva para ", "")}
//                 </p>
//                 <p>
//                   <strong>Precio:</strong> $ {eventoSeleccionado.precio}
//                 </p>
//                 <p>
//                   <strong>Duración:</strong> {eventoSeleccionado.duracion} minutos
//                 </p>
//                 <p>
//                   <strong>Estado:</strong> {eventoSeleccionado.estado}
//                 </p>
//                 <p>
//                   <strong>Servicios:</strong>{" "}
//                   {eventoSeleccionado.servicios.join(", ")}
//                 </p>
//                 <p>
//                   <strong>Fecha y Hora de Inicio:</strong>{" "}
//                   {new Date(eventoSeleccionado.start).toLocaleString()}
//                 </p>
//                 <p>
//                   <strong>Fecha y Hora de Fin:</strong>{" "}
//                   {new Date(eventoSeleccionado.end).toLocaleString()}
//                 </p>
//               </div>
//             )}
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseModal}>
//               Cerrar
//             </Button>
//           </Modal.Footer>
//         </Modal>

//         <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
//           <Modal.Header closeButton>
//             <Modal.Title>Agregar Reserva</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form onSubmit={handleSubmit}>
//               <Form.Group controlId="formNombre">
//                 <Form.Label>Nombre</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="nombre"
//                   value={formData.nombre}
//                   onChange={handleInputChange}
//                   isInvalid={!!errors.nombre}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.nombre}
//                 </Form.Control.Feedback>
//               </Form.Group>
//               <Form.Group controlId="formEmail">
//                 <Form.Label>Email</Form.Label>
//                 <Form.Control
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   isInvalid={!!errors.email}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.email}
//                 </Form.Control.Feedback>
//               </Form.Group>
//               <Form.Group controlId="formTelefono">
//                 <Form.Label>Teléfono</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="telefono"
//                   value={formData.telefono}
//                   onChange={handleInputChange}
//                   isInvalid={!!errors.telefono}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.telefono}
//                 </Form.Control.Feedback>
//               </Form.Group>
//               <Form.Group controlId="formFecha">
//                 <Form.Label>Fecha</Form.Label>
//                 <Form.Control
//                   type="date"
//                   name="fecha"
//                   value={formData.fecha}
//                   onChange={handleInputChange}
//                   isInvalid={!!errors.fecha}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.fecha}
//                 </Form.Control.Feedback>
//               </Form.Group>
//               <Form.Group controlId="formHora">
//                 <Form.Label>Hora</Form.Label>
//                 <Form.Control
//                   type="time"
//                   name="hora"
//                   value={formData.hora}
//                   onChange={handleInputChange}
//                   isInvalid={!!errors.hora}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.hora}
//                 </Form.Control.Feedback>
//               </Form.Group>
//               <Form.Group controlId="formServicios">
//                 <Form.Label>Servicios</Form.Label>
//                 {servicios.map((servicio) => (
//                   <Form.Check
//                     key={servicio.id}
//                     type="checkbox"
//                     label={`${servicio.nombre} - $${servicio.precio}`}
//                     checked={serviciosSeleccionados.includes(servicio.id)}
//                     onChange={() => handleSeleccionarServicio(servicio.id)}
//                   />
//                 ))}
//                 {submitError && <Alert variant="danger">{submitError}</Alert>}
//               </Form.Group>
//               <Form.Group controlId="formObservaciones">
//                 <Form.Label>Observaciones</Form.Label>
//                 <Form.Control
//                   as="textarea"
//                   rows={3}
//                   name="observaciones"
//                   value={formData.observaciones}
//                   onChange={handleInputChange}
//                 />
//               </Form.Group>
//               <Button variant="primary" type="submit">
//                 Agregar Reserva
//               </Button>
//             </Form>
//           </Modal.Body>
//         </Modal>

//         <Modal show={showSuccessModal} onHide={handleCloseSuccessModal}>
//           <Modal.Header closeButton>
//             <Modal.Title>Reserva Agregada</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>La reserva ha sido agregada exitosamente.</Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseSuccessModal}>
//               Cerrar
//             </Button>
//           </Modal.Footer>
//         </Modal>
//       </Container>
//       <Footer />
//     </>
//   );
// };

// export default AgendaPanel;

// // import React, { useState, useEffect } from "react";
// // import { Calendar, momentLocalizer } from "react-big-calendar";
// // import moment from "moment";
// // import "react-big-calendar/lib/css/react-big-calendar.css";
// // import { Container, Row, Col, Modal, Button, Form } from "react-bootstrap";
// // import axios from "axios";
// // import { useNavigate } from "react-router-dom";
// // import NavBar from "../components/Navbar.jsx";
// // import Footer from "../components/Footer.jsx";
// // import AuthUser from "../pageauth/AuthUser";
// // import Config from "../Config";

// // const localizer = momentLocalizer(moment);

// // const AgendaPanel = () => {
// //   const { getUser } = AuthUser();
// //   const navigate = useNavigate();
// //   const [reservas, setReservas] = useState([]);
// //   const [empresaId, setEmpresaId] = useState();
// //   const [showModal, setShowModal] = useState(false);
// //   const [formData, setFormData] = useState({
// //     cliente_id: "",
// //     agenda_id: "",
// //     fecha: "",
// //     hora: "",
// //     duracion: 60,
// //     precio: 0,
// //     estado: "reservado",
// //     observaciones: "",
// //     servicios: [],
// //   });
// //   const [servicios, setServicios] = useState([]);
// //   const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);

// //   useEffect(() => {
// //     obtenerServicios();
// //     // console.log(servicios);
// //     obtenerReservas();
// //   }, []);

// //   const obtenerReservas = async () => {
// //     try {
// //       const response = await axios.get(
// //         `http://127.0.0.1:8000/api/v1/reservas/empresa/${getUser().id}`
// //       );
// //       setReservas(response.data.data);
// //     } catch (error) {
// //       console.error("Error al obtener reservas:", error);
// //     }
// //   };

// //   const obtenerServicios = async () => {
// //     try {
// //       const response = await Config.getServicesByEmpresa(getUser().id);
// //       console.log(response.data);
// //       setServicios(response.data);
// //     } catch (error) {
// //       console.error("Error al cargar servicios:", error);
// //     }
// //   };

// //   const handleSeleccionarServicio = (servicioId) => {
// //     const newServiciosSeleccionados = serviciosSeleccionados.includes(servicioId)
// //       ? serviciosSeleccionados.filter((id) => id !== servicioId)
// //       : [...serviciosSeleccionados, servicioId];

// //     setServiciosSeleccionados(newServiciosSeleccionados);

// //     const precio = newServiciosSeleccionados.reduce((acc, id) => {
// //       const servicio = servicios.find((servicio) => servicio.id === id);
// //       return acc + (servicio ? parseInt(servicio.precio, 10) : 0);
// //     }, 0);

// //     const duracion = newServiciosSeleccionados.reduce((acc, id) => {
// //       const servicio = servicios.find((servicio) => servicio.id === id);
// //       return acc + (servicio ? parseInt(servicio.duracion, 10) : 0);
// //     }, 0);

// //     setFormData((prevFormData) => ({
// //       ...prevFormData,
// //       servicios: newServiciosSeleccionados,
// //       precio: precio,
// //       duracion: duracion,
// //     }));
// //   };

// //   // const handleSeleccionarServicio = (servicioId) => {
// //   //   if (serviciosSeleccionados.includes(servicioId)) {
// //   //     setServiciosSeleccionados(
// //   //       serviciosSeleccionados.filter((id) => id !== servicioId)
// //   //     );
// //   //   } else {
// //   //     if (serviciosSeleccionados.length === 0) {
// //   //       setServiciosSeleccionados([servicioId]) // quiero agregar el servicio
// //   //     } else {
// //   //       setServiciosSeleccionados([...serviciosSeleccionados, servicioId]);
// //   //     }
// //   //     // console.log("largo: " + serviciosSeleccionados.length)

// //   //   }

// //   //   let precio = 0;
// //   //   serviciosSeleccionados.forEach(element => {

// //   //       console.log(element)
// //   //       console.log("ddd")
// //   //     const servicio2 = servicios.find((servicio) => servicio.id === element);
// //   //     console.log("ee")

// //   //     precio += parseInt(servicio2.precio);

// //   //   });
// //   //   console.log("precio: " + parseInt(precio) )
// //   //   formData.precio = precio;
// //   // };

// //   const calcularFechaFin = (fecha, hora, duracion) => {
// //     const fechaInicio = new Date(fecha + "T" + hora);
// //     const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
// //     return fechaFin;
// //   };

// //   const eventos = reservas.map((reserva) => ({
// //     id: reserva.id,
// //     title: `Reserva para ${reserva.cliente.name}`,
// //     start: new Date(reserva.fecha + "T" + reserva.hora),
// //     end: calcularFechaFin(reserva.fecha, reserva.hora, reserva.duracion),
// //     precio: reserva.precio,
// //     duracion: reserva.duracion,
// //     estado: reserva.estado,
// //     servicios: reserva.servicios,
// //   }));

// //   const handleInputChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData({
// //       ...formData,
// //       [name]: value,
// //     });
// //   };

// //   const handleSelectSlot = (slotInfo) => {
// //     setFormData({
// //       ...formData,
// //       fecha: moment(slotInfo.start).format("YYYY-MM-DD"),
// //       hora: moment(slotInfo.start).format("HH:mm:ss"),
// //     });
// //     setShowModal(true);
// //   };

// //   const handleSubmit = async (event) => {
// //     event.preventDefault();
// //     try {
// //       await axios.post("http://127.0.0.1:8000/api/v1/reservas", {
// //         ...formData,
// //         agenda_id: getUser().id,
// //       });
// //       obtenerReservas();
// //       setShowModal(false);
// //       setFormData({
// //         cliente_id: "",
// //         agenda_id: "",
// //         fecha: "",
// //         hora: "",
// //         duracion: 60,
// //         precio: 0,
// //         estado: "reservado",
// //         observaciones: "",
// //         servicios: [],
// //       });
// //     } catch (error) {
// //       console.error("Error al agregar reserva:", error);
// //     }
// //   };

// //   return (
// //     <>
// //       <NavBar />
// //       <Container className="mt-1">
// //         <Row className="mt-3">
// //           <Col>
// //             <Button variant="primary" onClick={() => setShowModal(true)}>
// //               Agregar Reserva
// //             </Button>

// //             <Button
// //               variant="secondary"
// //               className="ml-2"
// //               onClick={() => navigate(`/reservas`)}
// //             >
// //               Ver Reservas
// //             </Button>
// //           </Col>
// //         </Row>

// //         <Row className="mt-3">
// //           <Col>
// //             <Calendar
// //               localizer={localizer}
// //               events={eventos}
// //               startAccessor="start"
// //               endAccessor="end"
// //               style={{ height: 500 }}
// //               onSelectSlot={handleSelectSlot}
// //               selectable
// //             />
// //           </Col>
// //         </Row>

// //         <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
// //           <Modal.Header closeButton>
// //             <Modal.Title>Agregar Reserva</Modal.Title>
// //           </Modal.Header>
// //           <Modal.Body>
// //             <Form onSubmit={handleSubmit}>
// //             <Form.Group controlId="nombre">
// //                             <Form.Label>Nombre</Form.Label>
// //                             <Form.Control
// //                                 type="text"
// //                                 name="nombre"
// //                                 value={formData.nombre}
// //                                 onChange={handleInputChange}
// //                                 required
// //                             >
// //                             </Form.Control>
// //                         </Form.Group>
// //               <Row>
// //                 <Col>
// //                   <Form.Group controlId="cliente_id">
// //                     <Form.Label>Email</Form.Label>
// //                     <Form.Control
// //                       type="email"
// //                       name="email"
// //                       value={formData.email}
// //                       onChange={handleInputChange}
// //                       required
// //                     />
// //                   </Form.Group>
// //                 </Col>
// //                 <Col>
// //                   <Form.Group controlId="agenda_id">
// //                     <Form.Label>Telefono</Form.Label>
// //                     <Form.Control
// //                       type="text"
// //                       name="agenda_id"
// //                       value={formData.telefono}
// //                       onChange={handleInputChange}
// //                       required
// //                     />
// //                   </Form.Group>
// //                 </Col>
// //               </Row>

// //               <Row>
// //                 <Col>
// //                   <Form.Group controlId="fecha">
// //                     <Form.Label>Fecha</Form.Label>
// //                     <Form.Control
// //                       type="date"
// //                       name="fecha"
// //                       value={formData.fecha}
// //                       onChange={handleInputChange}
// //                       required
// //                     />
// //                   </Form.Group>
// //                 </Col>
// //                 <Col>
// //                   <Form.Group controlId="hora">
// //                     <Form.Label>Hora</Form.Label>
// //                     <Form.Control
// //                       type="time"
// //                       name="hora"
// //                       value={formData.hora}
// //                       onChange={handleInputChange}
// //                       required
// //                     />
// //                   </Form.Group>
// //                 </Col>
// //               </Row>

// //               <Row>
// //               <Col>
// //               {/* <Form.Group controlId="estado">
// //                             <Form.Label>Servicios</Form.Label>
// //                             <Form.Control
// //                                 as="select"
// //                                 name="estado"
// //                                 value={formData.estado}
// //                                 onChange={handleInputChange}
// //                                 required
// //                             >
// //                                 <option value="reservado">Reservado</option>
// //                                 <option value="cancelado">Cancelado</option>
// //                                 <option value="en espera">En espera</option>
// //                             </Form.Control>
// //                         </Form.Group> */}
// //                         <Form.Label><strong>Servicios</strong></Form.Label>
// //           {servicios.map((servicio) => (
// //             <Form.Check
// //               key={servicio.id}
// //               type="checkbox"
// //               id={`checkbox-${servicio.id}`}
// //               label={`${servicio.nombre} - ${servicio.descripcion} - ${servicio.precio} - ${servicio.duracion} minutos` }
// //               onChange={() => handleSeleccionarServicio(servicio.id)}
// //             />
// //           ))}
// //                         </Col>
// //               </Row>
// //                 <Row>
// //                   <Col>
// //                     <Form.Group controlId="duracion">
// //                       <Form.Label>Duración (minutos)</Form.Label>
// //                       <Form.Control
// //                         type="number"
// //                         name="duracion"
// //                         value={formData.duracion}
// //                         onChange={handleInputChange}
// //                         required
// //                       />
// //                     </Form.Group>
// //                   </Col>
// //                   <Col>
// //                     <Form.Group controlId="precio">
// //                       <Form.Label>Precio</Form.Label>
// //                       <Form.Control
// //                         type="number"
// //                         name="precio"
// //                         value={formData.precio}
// //                         onChange={handleInputChange}
// //                         required
// //                       />
// //                     </Form.Group>
// //                   </Col>
// //                 </Row>

// //               <Form.Group controlId="observaciones">
// //                 <Form.Label>Observaciones</Form.Label>
// //                 <Form.Control
// //                   as="textarea"
// //                   name="observaciones"
// //                   value={formData.observaciones}
// //                   onChange={handleInputChange}
// //                 />
// //               </Form.Group>
// //               <Button variant="primary" type="submit">
// //                 Agregar Reserva
// //               </Button>{" "}
// //               <Button variant="secondary" onClick={() => setShowModal(false)}>
// //                 Cancelar
// //               </Button>
// //             </Form>
// //           </Modal.Body>
// //         </Modal>
// //         <Footer />
// //       </Container>
// //     </>
// //   );
// // };

// // export default AgendaPanel;

// // // import React, { useState, useEffect } from "react";
// // // import { Calendar, momentLocalizer } from "react-big-calendar";
// // // import moment from "moment";
// // // import "react-big-calendar/lib/css/react-big-calendar.css";
// // // import { Container, Row, Col, Button } from "react-bootstrap";
// // // import axios from "axios";
// // // import { useNavigate } from "react-router-dom";
// // // import NavBar from "../components/Navbar.jsx";
// // // import Footer from "../components/Footer.jsx";

// // // const localizer = momentLocalizer(moment);

// // // const AgendaPanel = () => {
// // //   const navigate = useNavigate();
// // //   const [reservas, setReservas] = useState([]);
// // //   const [intervalos, setIntervalos] = useState([]);
// // //   const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

// // //   useEffect(() => {
// // //     obtenerReservas();
// // //     obtenerIntervalos();
// // //   }, []);

// // //   const obtenerReservas = async () => {
// // //     try {
// // //       const response = await axios.get(
// // //         `http://127.0.0.1:8000/api/v1/reservas/empresa/1`
// // //       );
// // //       setReservas(response.data.data);
// // //     } catch (error) {
// // //       console.error("Error al obtener reservas:", error);
// // //     }
// // //   };

// // //   const obtenerIntervalos = async () => {
// // //     try {
// // //       const response = await axios.get(
// // //         `http://127.0.0.1:8000/api/v1/intervalos/empresa/1`
// // //       );
// // //       setIntervalos(response.data.data);
// // //     } catch (error) {
// // //       console.error("Error al obtener intervalos:", error);
// // //     }
// // //   };

// // //   const calcularFechaFin = (fecha, hora, duracion) => {
// // //     const fechaInicio = new Date(fecha + "T" + hora);
// // //     const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
// // //     return fechaFin;
// // //   };

// // //   const eventos = reservas.map((reserva) => ({
// // //     id: reserva.id,
// // //     title: `Reserva para ${reserva.cliente.name}`,
// // //     start: new Date(reserva.fecha + "T" + reserva.hora),
// // //     end: calcularFechaFin(reserva.fecha, reserva.hora, reserva.duracion),
// // //     precio: reserva.precio,
// // //     duracion: reserva.duracion,
// // //     estado: reserva.estado,
// // //     servicios: reserva.servicios,
// // //   }));

// // //   const handleSelectEvento = (evento) => {
// // //     setEventoSeleccionado(evento);
// // //   };

// // //   const verReservas = () => {
// // //     navigate(`/reservas`);
// // //   };

// // //   return (
// // //     <>
// // //       <NavBar />
// // //       <Container className="mt-1">
// // //         <Row className="mt-3">
// // //           <Col>
// // //             <Button variant="primary" onClick={() => navigate('/agregar-reserva')}>
// // //               Agregar Reserva
// // //             </Button>
// // //             <Button
// // //               variant="secondary"
// // //               className="ml-2"
// // //               onClick={() => verReservas()}
// // //             >
// // //               Ver Reservas
// // //             </Button>
// // //           </Col>
// // //         </Row>

// // //         <Row className="mt-3">
// // //           <Col>
// // //             <Calendar
// // //               localizer={localizer}
// // //               events={eventos}
// // //               startAccessor="start"
// // //               endAccessor="end"
// // //               style={{ height: 500 }}
// // //               onSelectEvent={handleSelectEvento}
// // //               selectable
// // //             />
// // //           </Col>
// // //         </Row>
// // //         <Footer />
// // //       </Container>
// // //     </>
// // //   );
// // // };

// // // export default AgendaPanel;

// // // import React, { useState, useEffect } from "react";
// // // import { Calendar, momentLocalizer } from "react-big-calendar";
// // // import moment from "moment";
// // // import "react-big-calendar/lib/css/react-big-calendar.css";
// // // import { Container, Row, Col, Modal, Button, Form } from "react-bootstrap";
// // // import axios from "axios";
// // // import { useNavigate } from "react-router-dom";
// // // import NavBar from "../components/Navbar.jsx";
// // // import Footer from "../components/Footer.jsx";

// // // const localizer = momentLocalizer(moment);

// // // const AgendaPanel = () => {
// // //   const navigate = useNavigate();
// // //   const [reservas, setReservas] = useState([]);
// // //   const [intervalos, setIntervalos] = useState([]);
// // //   const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
// // //   const [fechaHoraSeleccionada, setFechaHoraSeleccionada] = useState(null);
// // //   const [modalAbierto, setModalAbierto] = useState(false);
// // //   const [cliente, setCliente] = useState("");
// // //   const [emailCliente, setEmailCliente] = useState("");
// // //   const [telefonoCliente, setTelefonoCliente] = useState("");
// // //   const [duracion, setDuracion] = useState(60); // Duración inicial en minutos
// // //   const [precio, setPrecio] = useState(0);

// // //   const [observaciones, setObservaciones] = useState("");
// // //   const [servicios, setServicios] = useState([]);
// // //   const [formErrors, setFormErrors] = useState({
// // //     cliente: "",
// // //     duracion: "",
// // //     precio: "",
// // //     fecha: "",
// // //     hora: "",
// // //   });

// // //   useEffect(() => {
// // //     obtenerReservas();
// // //     obtenerIntervalos();
// // //   }, []);

// // //   const obtenerReservas = async () => {
// // //     try {
// // //       const response = await axios.get(
// // //         `http://127.0.0.1:8000/api/v1/reservas/empresa/1`
// // //       );
// // //       setReservas(response.data.data);
// // //     } catch (error) {
// // //       console.error("Error al obtener reservas:", error);
// // //     }
// // //   };

// // //   const obtenerIntervalos = async () => {
// // //     try {
// // //       const response = await axios.get(
// // //         `http://127.0.0.1:8000/api/v1/intervalos/empresa/1`
// // //       );
// // //       setIntervalos(response.data.data);
// // //     } catch (error) {
// // //       console.error("Error al obtener intervalos:", error);
// // //     }
// // //   };

// // //   const calcularFechaFin = (fecha, hora, duracion) => {
// // //     const fechaInicio = new Date(fecha + "T" + hora);
// // //     const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
// // //     return fechaFin;
// // //   };

// // //   const eventos = reservas.map((reserva) => ({
// // //     id: reserva.id,
// // //     title: `Reserva para ${reserva.cliente.name}`,
// // //     start: new Date(reserva.fecha + "T" + reserva.hora),
// // //     end: calcularFechaFin(reserva.fecha, reserva.hora, reserva.duracion),
// // //     precio: reserva.precio,
// // //     duracion: reserva.duracion,
// // //     estado: reserva.estado,
// // //     servicios: reserva.servicios,
// // //   }));

// // //   const handleSelectEvento = (evento) => {
// // //     setEventoSeleccionado(evento);
// // //   };

// // //   const handleCloseModal = () => {
// // //     setEventoSeleccionado(null);
// // //   };

// // //   const handleSelectSlot = (slotInfo) => {
// // //     setFechaHoraSeleccionada(slotInfo.start); // Almacena la fecha y hora seleccionadas
// // //     setModalAbierto(true); // Abre el modal para agregar la reserva
// // //   };

// // //   const handleSubmit = async (event) => {
// // //     event.preventDefault();
// // //     try {
// // //       const response = await axios.post(
// // //         "http://127.0.0.1:8000/api/v1/reservas",
// // //         {
// // //           agenda_id: 1, // Ajusta según tu lógica
// // //           nombre_cliente: cliente,
// // //           email_cliente: emailCliente,
// // //           telefono_cliente: telefonoCliente,
// // //           fecha: moment(fechaHoraSeleccionada).format("YYYY-MM-DD"),
// // //           hora: moment(fechaHoraSeleccionada).format("HH:mm:ss"),
// // //           duracion: duracion,
// // //           precio: precio,
// // //           estado: "reservado",
// // //           observaciones: observaciones,
// // //           fecha_reserva: moment().format("YYYY-MM-DD HH:mm:ss"),
// // //           servicios: servicios, // Ajusta según tu estructura de servicios
// // //         }
// // //       );

// // //       // Actualizar el estado de reservas para reflejar la nueva reserva
// // //       setReservas([...reservas, response.data.data]);

// // //       // Limpiar el formulario y cerrar el modal
// // //       limpiarFormulario();
// // //       setModalAbierto(false);

// // //       // Opcional: Refrescar la lista de reservas después de agregar una nueva
// // //       obtenerReservas();
// // //     } catch (error) {
// // //       if (error.response && error.response.status === 422) {
// // //         // Si la API devuelve errores de validación, actualiza el estado de formErrors
// // //         setFormErrors(error.response.data);
// // //       } else {
// // //         console.error("Error al agregar reserva:", error);
// // //       }
// // //     }
// // //   };

// // //   const limpiarFormulario = () => {
// // //     setCliente("");
// // //     setEmailCliente("");
// // //     setTelefonoCliente("");
// // //     setDuracion(60);
// // //     setPrecio(0);
// // //     setObservaciones("");
// // //     setServicios([]);
// // //     setFormErrors({
// // //       cliente: "",
// // //       duracion: "",
// // //       precio: "",
// // //       fecha: "",
// // //       hora: "",
// // //     });
// // //   };

// // //   const verReservas = () => {
// // //     navigate(`/reservas`);
// // //   };

// // //   return (
// // //     <>
// // //       <NavBar />
// // //       <Container className="mt-1">
// // //         <Row className="mt-3">
// // //           <Col>
// // //             <Button variant="primary" onClick={() => setModalAbierto(true)}>
// // //               Agregar Reserva
// // //             </Button>
// // //             <Button
// // //               variant="secondary"
// // //               className="ml-2"
// // //               onClick={() => verReservas()}
// // //             >
// // //               Ver Reservas
// // //             </Button>
// // //           </Col>
// // //         </Row>

// // //         <Row className="mt-3">
// // //           <Col>
// // //             <Calendar
// // //               localizer={localizer}
// // //               events={eventos}
// // //               startAccessor="start"
// // //               endAccessor="end"
// // //               style={{ height: 500 }}
// // //               onSelectEvent={handleSelectEvento}
// // //               onSelectSlot={handleSelectSlot}
// // //             />
// // //           </Col>
// // //         </Row>

// // //         <Modal show={modalAbierto} onHide={() => setModalAbierto(false)}>
// // //           <Modal.Header closeButton>
// // //             <Modal.Title>Agregar Reserva</Modal.Title>
// // //           </Modal.Header>
// // //           <Modal.Body>
// // //             <Form onSubmit={handleSubmit}>
// // //               <Form.Group controlId="cliente">
// // //                 <Form.Label>Cliente</Form.Label>
// // //                 <Form.Control
// // //                   type="text"
// // //                   value={cliente}
// // //                   onChange={(e) => setCliente(e.target.value)}
// // //                   isInvalid={!!formErrors.cliente} // Marca el campo como inválido si hay un error
// // //                   required // Campo obligatorio
// // //                 />
// // //                 <Form.Control.Feedback type="invalid">
// // //                   {formErrors.cliente}
// // //                 </Form.Control.Feedback>
// // //               </Form.Group>
// // //               <Form.Group controlId="emailCliente">
// // //                 <Form.Label>Email del Cliente</Form.Label>
// // //                 <Form.Control
// // //                   type="email"
// // //                   value={emailCliente}
// // //                   onChange={(e) => setEmailCliente(e.target.value)}
// // //                   // Aquí podrías añadir una validación de formato de email si deseas
// // //                 />
// // //               </Form.Group>
// // //               <Form.Group controlId="telefonoCliente">
// // //                 <Form.Label>Teléfono del Cliente</Form.Label>
// // //                 <Form.Control
// // //                   type="tel"
// // //                   value={telefonoCliente}
// // //                   onChange={(e) => setTelefonoCliente(e.target.value)}
// // //                   // Aquí podrías añadir una validación de formato de teléfono si deseas
// // //                 />
// // //               </Form.Group>
// // //               <Form.Group controlId="fecha">
// // //                 <Form.Label>Fecha</Form.Label>
// // //                 <Form.Control
// // //                   type="date"
// // //                   value={moment(fechaHoraSeleccionada).format("YYYY-MM-DD")}
// // //                   onChange={(e) =>
// // //                     setFechaHoraSeleccionada(
// // //                       moment(
// // //                         e.target.value +
// // //                           "T" +
// // //                           moment(fechaHoraSeleccionada).format("HH:mm:ss")
// // //                       ).toDate()
// // //                     )
// // //                   }
// // //                   isInvalid={!!formErrors.fecha} // Marca el campo como inválido si hay un error
// // //                   required // Campo obligatorio
// // //                 />
// // //                 <Form.Control.Feedback type="invalid">
// // //                   {formErrors.fecha}
// // //                 </Form.Control.Feedback>
// // //               </Form.Group>
// // //               <Form.Group controlId="hora">
// // //                 <Form.Label>Hora</Form.Label>
// // //                 <Form.Control
// // //                   type="time"
// // //                   value={moment(fechaHoraSeleccionada).format("HH:mm")}
// // //                   onChange={(e) =>
// // //                     setFechaHoraSeleccionada(
// // //                       moment(
// // //                         moment(fechaHoraSeleccionada).format("YYYY-MM-DD") +
// // //                           "T" +
// // //                           e.target.value
// // //                       ).toDate()
// // //                     )
// // //                   }
// // //                   isInvalid={!!formErrors.hora} // Marca el campo como inválido si hay un error
// // //                   required // Campo obligatorio
// // //                 />
// // //                 <Form.Control.Feedback type="invalid">
// // //                   {formErrors.hora}
// // //                 </Form.Control.Feedback>
// // //               </Form.Group>
// // //               <Form.Group controlId="duracion">
// // //                 <Form.Label>Duración (minutos)</Form.Label>
// // //                 <Form.Control
// // //                   type="number"
// // //                   value={duracion}
// // //                   onChange={(e) => setDuracion(parseInt(e.target.value))}
// // //                   isInvalid={!!formErrors.duracion} // Marca el campo como inválido si hay un error
// // //                   required // Campo obligatorio
// // //                 />
// // //                 <Form.Control.Feedback type="invalid">
// // //                   {formErrors.duracion}
// // //                 </Form.Control.Feedback>
// // //               </Form.Group>

// // //               <Form.Group controlId="precio">
// // //                 <Form.Label>Precio</Form.Label>
// // //                 <Form.Control
// // //                   type="number"
// // //                   value={precio}
// // //                   onChange={(e) => setPrecio(parseFloat(e.target.value))}
// // //                   isInvalid={!!formErrors.precio} // Marca el campo como inválido si hay un error
// // //                   required // Campo obligatorio
// // //                 />
// // //                 <Form.Control.Feedback type="invalid">
// // //                   {formErrors.precio}
// // //                 </Form.Control.Feedback>
// // //               </Form.Group>

// // //               <Form.Group controlId="observaciones">
// // //                 <Form.Label>Observaciones</Form.Label>
// // //                 <Form.Control
// // //                   as="textarea"
// // //                   rows={3}
// // //                   value={observaciones}
// // //                   onChange={(e) => setObservaciones(e.target.value)}
// // //                 />
// // //               </Form.Group>

// // //               <Form.Group controlId="servicios">
// // //                 <Form.Label>Servicios</Form.Label>
// // //                 <Form.Control
// // //                   type="text"
// // //                   placeholder="Separados por comas"
// // //                   value={servicios.join(",")}
// // //                   onChange={(e) => setServicios(e.target.value.split(","))}
// // //                 />
// // //               </Form.Group>

// // //               <Button variant="primary" type="submit">
// // //                 Guardar Reserva
// // //               </Button>
// // //               <Button
// // //                 variant="secondary"
// // //                 onClick={limpiarFormulario}
// // //                 className="ml-2"
// // //               >
// // //                 Cancelar
// // //               </Button>
// // //             </Form>
// // //           </Modal.Body>
// // //         </Modal>
// // //         <Footer />
// // //       </Container>
// // //     </>
// // //   );
// // // };

// // // export default AgendaPanel;

// // // import React, { useState, useEffect } from "react";
// // // import { Calendar, momentLocalizer } from "react-big-calendar";
// // // import moment from "moment";
// // // import "react-big-calendar/lib/css/react-big-calendar.css";
// // // import { Container, Row, Col, Modal, Button, Form } from "react-bootstrap";
// // // import axios from "axios";
// // // import { useNavigate } from "react-router-dom";
// // // import NavBar from "../components/Navbar.jsx";
// // // import Footer from "../components/Footer.jsx";

// // // const localizer = momentLocalizer(moment);

// // // const AgendaPanel = () => {
// // //   const navigate = useNavigate();
// // //   const [reservas, setReservas] = useState([]);
// // //   const [intervalos, setIntervalos] = useState([]);
// // //   const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
// // //   const [fechaHoraSeleccionada, setFechaHoraSeleccionada] = useState(null);
// // //   const [modalAbierto, setModalAbierto] = useState(false);
// // //   const [cliente, setCliente] = useState("");
// // //   const [emailCliente, setEmailCliente] = useState("");
// // //   const [telefonoCliente, setTelefonoCliente] = useState("");
// // //   const [duracion, setDuracion] = useState(60); // Duración inicial en minutos
// // //   const [precio, setPrecio] = useState(0);
// // //   const [formErrors, setFormErrors] = useState({}); // Estado para manejar errores del formulario

// // //   useEffect(() => {
// // //     obtenerReservas();
// // //     obtenerIntervalos();
// // //   }, []);

// // //   const obtenerReservas = async () => {
// // //     try {
// // //       const response = await axios.get(
// // //         `http://127.0.0.1:8000/api/v1/reservas/empresa/1`
// // //       );
// // //       setReservas(response.data.data);
// // //     } catch (error) {
// // //       console.error("Error al obtener reservas:", error);
// // //     }
// // //   };

// // //   const obtenerIntervalos = async () => {
// // //     try {
// // //       const response = await axios.get(
// // //         `http://127.0.0.1:8000/api/v1/intervalos/empresa/1`
// // //       );
// // //       setIntervalos(response.data.data);
// // //     } catch (error) {
// // //       console.error("Error al obtener intervalos:", error);
// // //     }
// // //   };

// // //   const calcularFechaFin = (fecha, hora, duracion) => {
// // //     const fechaInicio = new Date(fecha + "T" + hora);
// // //     const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
// // //     return fechaFin;
// // //   };

// // //   const eventos = reservas.map((reserva) => ({
// // //     id: reserva.id,
// // //     title: `Reserva para ${reserva.cliente.name}`,
// // //     start: new Date(reserva.fecha + "T" + reserva.hora),
// // //     end: calcularFechaFin(reserva.fecha, reserva.hora, reserva.duracion),
// // //     precio: reserva.precio,
// // //     duracion: reserva.duracion,
// // //     estado: reserva.estado,
// // //     servicios: reserva.servicios,
// // //   }));

// // //   const handleSelectEvento = (evento) => {
// // //     setEventoSeleccionado(evento);
// // //   };

// // //   const handleCloseModal = () => {
// // //     setEventoSeleccionado(null);
// // //   };

// // //   const handleSelectSlot = (slotInfo) => {
// // //     setFechaHoraSeleccionada(slotInfo.start); // Almacena la fecha y hora seleccionadas
// // //     setModalAbierto(true); // Abre el modal para agregar la reserva
// // //   };

// // //   const handleSubmit = async (event) => {
// // //     event.preventDefault();

// // //     // Validación básica del formulario antes de enviar la solicitud
// // //     if (!cliente || !duracion || !precio) {
// // //       setFormErrors({
// // //         cliente: !cliente ? "Por favor ingresa el nombre del cliente." : "",
// // //         duracion: !duracion ? "Por favor ingresa la duración en minutos." : "",
// // //         precio: !precio ? "Por favor ingresa el precio." : "",
// // //       });
// // //       return;
// // //     }

// // //     try {
// // //       const response = await axios.post(
// // //         "http://127.0.0.1:8000/api/v1/reservas/usuarioNoRegistrado",
// // //         {
// // //           agenda_id: 1, // Ajusta según tu lógica
// // //           nombre_cliente: cliente,
// // //           email_cliente: emailCliente || null,
// // //           telefono_cliente: telefonoCliente || null,
// // //           fecha: moment(fechaHoraSeleccionada).format("YYYY-MM-DD"),
// // //           hora: moment(fechaHoraSeleccionada).format("HH:mm"),
// // //           duracion: duracion,
// // //           precio: precio,
// // //           estado: "reservado",
// // //           observaciones: "",
// // //           servicios: [], // Ajusta según tu estructura de servicios
// // //         }
// // //       );

// // //       // Actualizar el estado de reservas para reflejar la nueva reserva
// // //       setReservas([...reservas, response.data.data]);

// // //       // Limpiar el formulario y cerrar el modal
// // //       setCliente("");
// // //       setEmailCliente("");
// // //       setTelefonoCliente("");
// // //       setDuracion(60);
// // //       setPrecio(0);
// // //       setModalAbierto(false);

// // //       // Opcional: Refrescar la lista de reservas después de agregar una nueva
// // //       obtenerReservas();
// // //     } catch (error) {
// // //       if (error.response && error.response.status === 422) {
// // //         // Manejar errores de validación devueltos por la API
// // //         setFormErrors(error.response.data);
// // //       } else {
// // //         console.error("Error al agregar reserva:", error);
// // //       }
// // //     }
// // //   };

// // //   const verReservas = () => {
// // //     navigate(`/reservas`);
// // //   };

// // //   return (
// // //     <>
// // //       <NavBar />
// // //       <Container className="mt-1">
// // //         <Row className="mt-3">
// // //           <Col>
// // //             <Button variant="primary" onClick={() => setModalAbierto(true)}>
// // //               Agregar Reserva
// // //             </Button>
// // //             <Button
// // //               variant="secondary"
// // //               className="ml-2"
// // //               onClick={() => verReservas()}
// // //             >
// // //               Ver Reservas
// // //             </Button>
// // //           </Col>
// // //         </Row>

// // //         <Row className="mt-3">
// // //           <Col>
// // //             <Calendar
// // //               localizer={localizer}
// // //               events={eventos}
// // //               startAccessor="start"
// // //               endAccessor="end"
// // //               style={{ height: 500 }}
// // //               onSelectEvent={handleSelectEvento}
// // //               onSelectSlot={handleSelectSlot}
// // //             />
// // //           </Col>
// // //         </Row>

// // //         <Modal show={modalAbierto} onHide={() => setModalAbierto(false)}>
// // //           <Modal.Header closeButton>
// // //             <Modal.Title>Agregar Reserva</Modal.Title>
// // //           </Modal.Header>
// // //           <Modal.Body>
// // //             <Form onSubmit={handleSubmit}>
// // //               <Form.Group controlId="cliente">
// // //                 <Form.Label>Cliente</Form.Label>
// // //                 <Form.Control
// // //                   type="text"
// // //                   value={cliente}
// // //                   onChange={(e) => setCliente(e.target.value)}
// // //                   isInvalid={!!formErrors.cliente} // Marca el campo como inválido si hay un error
// // //                   required // Campo obligatorio
// // //                 />
// // //                 <Form.Control.Feedback type="invalid">
// // //                   {formErrors.cliente}
// // //                 </Form.Control.Feedback>
// // //               </Form.Group>
// // //               <Form.Group controlId="emailCliente">
// // //                 <Form.Label>Email del Cliente</Form.Label>
// // //                 <Form.Control
// // //                   type="email"
// // //                   value={emailCliente}
// // //                   onChange={(e) => setEmailCliente(e.target.value)}
// // //                   isInvalid={!!formErrors.email_cliente} // Marca el campo como inválido si hay un error
// // //                 />
// // //                 <Form.Control.Feedback type="invalid">
// // //                   {formErrors.email_cliente}
// // //                 </Form.Control.Feedback>
// // //               </Form.Group>
// // //               <Form.Group controlId="telefonoCliente">
// // //                 <Form.Label>Teléfono del Cliente</Form.Label>
// // //                 <Form.Control
// // //                   type="tel"
// // //                   value={telefonoCliente}
// // //                   onChange={(e) => setTelefonoCliente(e.target.value)}
// // //                   isInvalid={!!formErrors.telefono_cliente} // Marca el campo como inválido si hay un error
// // //                 />
// // //                 <Form.Control.Feedback type="invalid">
// // //                   {formErrors.telefono_cliente}
// // //                 </Form.Control.Feedback>
// // //               </Form.Group>
// // //               <Form.Group controlId="duracion">
// // //                 <Form.Label>Duración (minutos)</Form.Label>
// // //                 <Form.Control
// // //                   type="number"
// // //                   value={duracion}
// // //                   onChange={(e) => setDuracion(parseInt(e.target.value))}
// // //                   isInvalid={!!formErrors.duracion} // Marca el campo como inválido si hay un error
// // //                   required // Campo obligatorio
// // //                 />
// // //                 <Form.Control.Feedback type="invalid">
// // //                   {formErrors.duracion}
// // //                 </Form.Control.Feedback>
// // //               </Form.Group>
// // //               <Form.Group controlId="precio">
// // //                 <Form.Label>Precio</Form.Label>
// // //                 <Form.Control
// // //                                    type="number"
// // //                   value={precio}
// // //                   onChange={(e) => setPrecio(parseFloat(e.target.value))}
// // //                   isInvalid={!!formErrors.precio} // Marca el campo como inválido si hay un error
// // //                   required // Campo obligatorio
// // //                 />
// // //                 <Form.Control.Feedback type="invalid">
// // //                   {formErrors.precio}
// // //                 </Form.Control.Feedback>
// // //               </Form.Group>
// // //               <Button variant="primary" type="submit">
// // //                 Agregar Reserva
// // //               </Button>
// // //             </Form>
// // //           </Modal.Body>
// // //           <Modal.Footer>
// // //             <Button variant="secondary" onClick={() => setModalAbierto(false)}>
// // //               Cancelar
// // //             </Button>
// // //           </Modal.Footer>
// // //         </Modal>

// // //         <Modal show={eventoSeleccionado !== null} onHide={handleCloseModal}>
// // //           <Modal.Header closeButton>
// // //             <Modal.Title>Detalles de la Reserva</Modal.Title>
// // //           </Modal.Header>
// // //           <Modal.Body>
// // //             {eventoSeleccionado && (
// // //               <div>
// // //                 <p>
// // //                   <strong>Cliente:</strong>{" "}
// // //                   {eventoSeleccionado.title.replace("Reserva para ", "")}
// // //                 </p>
// // //                 <p>
// // //                   <strong>Precio:</strong> $ {eventoSeleccionado.precio}
// // //                 </p>
// // //                 <p>
// // //                   <strong>Duración:</strong> {eventoSeleccionado.duracion} minutos
// // //                 </p>
// // //                 <p>
// // //                   <strong>Estado:</strong> {eventoSeleccionado.estado}
// // //                 </p>
// // //                 <p>
// // //                   <strong>Servicios:</strong>{" "}
// // //                   {eventoSeleccionado.servicios}
// // //                 </p>
// // //                 <p>
// // //                   <strong>Fecha y Hora de Inicio:</strong>{" "}
// // //                   {new Date(eventoSeleccionado.start).toLocaleString()}
// // //                 </p>
// // //                 <p>
// // //                   <strong>Fecha y Hora de Fin:</strong>{" "}
// // //                   {new Date(eventoSeleccionado.end).toLocaleString()}
// // //                 </p>
// // //               </div>
// // //             )}
// // //           </Modal.Body>
// // //           <Modal.Footer>
// // //             <Button variant="secondary" onClick={handleCloseModal}>
// // //               Cerrar
// // //             </Button>
// // //           </Modal.Footer>
// // //         </Modal>
// // //       </Container>
// // //       <Footer />
// // //     </>
// // //   );
// // // };

// // // export default AgendaPanel;

// // // // import React, { useState, useEffect } from "react";
// // // // import { Calendar, momentLocalizer } from "react-big-calendar";
// // // // import moment from "moment";
// // // // import "react-big-calendar/lib/css/react-big-calendar.css";
// // // // import { Container, Row, Col, Modal, Button, Form } from "react-bootstrap";
// // // // import axios from "axios";
// // // // import { useNavigate } from "react-router-dom";
// // // // import NavBar from "../components/Navbar.jsx";
// // // // import Footer from "../components/Footer.jsx";

// // // // const localizer = momentLocalizer(moment);

// // // // const AgendaPanel = () => {
// // // //   const navigate = useNavigate();
// // // //   const [reservas, setReservas] = useState([]);
// // // //   const [intervalos, setIntervalos] = useState([]);
// // // //   const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
// // // //   const [fechaHoraSeleccionada, setFechaHoraSeleccionada] = useState(null);
// // // //   const [modalAbierto, setModalAbierto] = useState(false);
// // // //   const [cliente, setCliente] = useState("");
// // // //   const [emailCliente, setEmailCliente] = useState("");
// // // //   const [telefonoCliente, setTelefonoCliente] = useState("");
// // // //   const [duracion, setDuracion] = useState(60); // Duración inicial en minutos
// // // //   const [precio, setPrecio] = useState(0);

// // // //   useEffect(() => {
// // // //     obtenerReservas();
// // // //     obtenerIntervalos();
// // // //   }, []);

// // // //   const obtenerReservas = async () => {
// // // //     try {
// // // //       const response = await axios.get(
// // // //         `http://127.0.0.1:8000/api/v1/reservas/empresa/1`
// // // //       );
// // // //       setReservas(response.data.data);
// // // //     } catch (error) {
// // // //       console.error("Error al obtener reservas:", error);
// // // //     }
// // // //   };

// // // //   const obtenerIntervalos = async () => {
// // // //     try {
// // // //       const response = await axios.get(
// // // //         `http://127.0.0.1:8000/api/v1/intervalos/empresa/1`
// // // //       );
// // // //       setIntervalos(response.data.data);
// // // //     } catch (error) {
// // // //       console.error("Error al obtener intervalos:", error);
// // // //     }
// // // //   };

// // // //   const calcularFechaFin = (fecha, hora, duracion) => {
// // // //     const fechaInicio = new Date(fecha + "T" + hora);
// // // //     const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
// // // //     return fechaFin;
// // // //   };

// // // //   const eventos = reservas.map((reserva) => ({
// // // //     id: reserva.id,
// // // //     title: `Reserva para ${reserva.cliente.name}`,
// // // //     start: new Date(reserva.fecha + "T" + reserva.hora),
// // // //     end: calcularFechaFin(reserva.fecha, reserva.hora, reserva.duracion),
// // // //     precio: reserva.precio,
// // // //     duracion: reserva.duracion,
// // // //     estado: reserva.estado,
// // // //     servicios: reserva.servicios,
// // // //   }));

// // // //   const handleSelectEvento = (evento) => {
// // // //     setEventoSeleccionado(evento);
// // // //   };

// // // //   const handleCloseModal = () => {
// // // //     setEventoSeleccionado(null);
// // // //   };

// // // //   const handleSelectSlot = (slotInfo) => {
// // // //     setFechaHoraSeleccionada(slotInfo.start); // Almacena la fecha y hora seleccionadas
// // // //     setModalAbierto(true); // Abre el modal para agregar la reserva
// // // //   };

// // // //   const handleSubmit = async (event) => {
// // // //     event.preventDefault();
// // // //     try {
// // // //       const response = await axios.post(
// // // //         "http://127.0.0.1:8000/api/v1/reservas",
// // // //         {
// // // //           agenda_id: 1, // Ajusta según tu lógica
// // // //           nombre_cliente: cliente,
// // // //           email_cliente: emailCliente,
// // // //           telefono_cliente: telefonoCliente,
// // // //           fecha: moment(fechaHoraSeleccionada).format("YYYY-MM-DD"),
// // // //           hora: moment(fechaHoraSeleccionada).format("HH:mm:ss"),
// // // //           duracion: duracion,
// // // //           precio: precio,
// // // //           estado: "reservado",
// // // //           observaciones: "",
// // // //           fecha_reserva: moment().format("YYYY-MM-DD HH:mm:ss"),
// // // //           servicios: [], // Ajusta según tu estructura de servicios
// // // //         }
// // // //       );

// // // //       // Actualizar el estado de reservas para reflejar la nueva reserva
// // // //       setReservas([...reservas, response.data.data]);

// // // //       // Limpiar el formulario y cerrar el modal
// // // //       setCliente("");
// // // //       setEmailCliente("");
// // // //       setTelefonoCliente("");
// // // //       setDuracion(60);
// // // //       setPrecio(0);
// // // //       setModalAbierto(false);

// // // //       // Opcional: Refrescar la lista de reservas después de agregar una nueva
// // // //       obtenerReservas();
// // // //     } catch (error) {
// // // //       console.error("Error al agregar reserva:", error);
// // // //     }
// // // //   };

// // // //   const verReservas = () => {
// // // //     navigate(`/reservas`);
// // // //   };

// // // //   return (
// // // //     <>
// // // //       <NavBar />
// // // //       <Container className="mt-1">
// // // //         <Row className="mt-3">
// // // //           <Col>
// // // //             <Button variant="primary" onClick={() => setModalAbierto(true)}>
// // // //               Agregar Reserva
// // // //             </Button>
// // // //             <Button
// // // //               variant="secondary"
// // // //               className="ml-2"
// // // //               onClick={() => verReservas()}
// // // //             >
// // // //               Ver Reservas
// // // //             </Button>
// // // //           </Col>
// // // //         </Row>

// // // //         <Row className="mt-3">
// // // //           <Col>
// // // //             <Calendar
// // // //               localizer={localizer}
// // // //               events={eventos}
// // // //               startAccessor="start"
// // // //               endAccessor="end"
// // // //               style={{ height: 500 }}
// // // //               onSelectEvent={handleSelectEvento}
// // // //               onSelectSlot={handleSelectSlot}
// // // //             />
// // // //           </Col>
// // // //         </Row>

// // // //         <Modal show={modalAbierto} onHide={() => setModalAbierto(false)}>
// // // //           <Modal.Header closeButton>
// // // //             <Modal.Title>Agregar Reserva</Modal.Title>
// // // //           </Modal.Header>
// // // //           <Modal.Body>
// // // //             <Form onSubmit={handleSubmit}>
// // // //               <Form.Group controlId="cliente">
// // // //                 <Form.Label>Cliente</Form.Label>
// // // //                 <Form.Control
// // // //                   type="text"
// // // //                   value={cliente}
// // // //                   onChange={(e) => setCliente(e.target.value)}
// // // //                   required // Campo obligatorio
// // // //                 />
// // // //                 <Form.Control.Feedback type="invalid">
// // // //                   Por favor ingresa el nombre del cliente.
// // // //                 </Form.Control.Feedback>
// // // //               </Form.Group>
// // // //               <Form.Group controlId="emailCliente">
// // // //                 <Form.Label>Email del Cliente</Form.Label>
// // // //                 <Form.Control
// // // //                   type="email"
// // // //                   value={emailCliente}
// // // //                   onChange={(e) => setEmailCliente(e.target.value)}
// // // //                   // Aquí podrías añadir una validación de formato de email si deseas
// // // //                 />
// // // //               </Form.Group>
// // // //               <Form.Group controlId="telefonoCliente">
// // // //                 <Form.Label>Teléfono del Cliente</Form.Label>
// // // //                 <Form.Control
// // // //                   type="tel"
// // // //                   value={telefonoCliente}
// // // //                   onChange={(e) => setTelefonoCliente(e.target.value)}
// // // //                   // Aquí podrías añadir una validación de formato de teléfono si deseas
// // // //                 />
// // // //               </Form.Group>
// // // //               <Form.Group controlId="duracion">
// // // //                 <Form.Label>Duración (minutos)</Form.Label>
// // // //                 <Form.Control
// // // //                   type="number"
// // // //                   value={duracion}
// // // //                   onChange={(e) => setDuracion(parseInt(e.target.value))}
// // // //                   required // Campo obligatorio
// // // //                 />
// // // //                 <Form.Control.Feedback type="invalid">
// // // //                   Por favor ingresa la duración en minutos.
// // // //                 </Form.Control.Feedback>
// // // //               </Form.Group>
// // // //               <Form.Group controlId="precio">
// // // //                 <Form.Label>Precio</Form.Label>
// // // //                 <Form.Control
// // // //                   type="number"
// // // //                   value={precio}
// // // //                   onChange={(e) => setPrecio(parseFloat(e.target.value))}
// // // //                   required // Campo obligatorio
// // // //                 />
// // // //                 <Form.Control.Feedback type="invalid">
// // // //                   Por favor ingresa el precio.
// // // //                 </Form.Control.Feedback>
// // // //               </Form.Group>
// // // //               <Button variant="primary" type="submit">
// // // //                 Agregar Reserva
// // // //               </Button>
// // // //             </Form>
// // // //           </Modal.Body>
// // // //           <Modal.Footer>
// // // //             <Button variant="secondary" onClick={() => setModalAbierto(false)}>
// // // //               Cancelar
// // // //             </Button>
// // // //           </Modal.Footer>
// // // //         </Modal>

// // // //         <Modal show={eventoSeleccionado !== null} onHide={handleCloseModal}>
// // // //           <Modal.Header closeButton>
// // // //             <Modal.Title>Detalles de la Reserva</Modal.Title>
// // // //           </Modal.Header>
// // // //           <Modal.Body>
// // // //             {eventoSeleccionado && (
// // // //               <div>
// // // //                 <p>
// // // //                   <strong>Cliente:</strong>{" "}
// // // //                   {eventoSeleccionado.title.replace("Reserva para ", "")}
// // // //                 </p>
// // // //                 <p>
// // // //                   <strong>Precio:</strong> $ {eventoSeleccionado.precio}
// // // //                 </p>
// // // //                 <p>
// // // //                   <strong>Duración:</strong> {eventoSeleccionado.duracion} minutos
// // // //                 </p>
// // // //                 <p>
// // // //                   <strong>Estado:</strong> {eventoSeleccionado.estado}
// // // //                 </p>
// // // //                 <p>
// // // //                   <strong>Servicios:</strong>{" "}
// // // //                   {eventoSeleccionado.servicios}
// // // //                 </p>
// // // //                 <p>
// // // //                   <strong>Fecha y Hora de Inicio:</strong>{" "}
// // // //                   {new Date(eventoSeleccionado.start).toLocaleString()}
// // // //                 </p>
// // // //                 <p>
// // // //                   <strong>Fecha y Hora de Fin:</strong>{" "}
// // // //                   {new Date(eventoSeleccionado.end).toLocaleString()}
// // // //                 </p>
// // // //               </div>
// // // //             )}
// // // //           </Modal.Body>

// // // // <Modal.Footer>
// // // // <Button variant="secondary" onClick={handleCloseModal}>
// // // //   Cerrar
// // // // </Button>
// // // // </Modal.Footer>
// // // // </Modal>
// // // // </Container>
// // // // <Footer />
// // // // </>
// // // // );
// // // // };

// // // // export default AgendaPanel;

// // // // // import React, { useState, useEffect } from "react";
// // // // // import { Calendar, momentLocalizer } from "react-big-calendar";
// // // // // import moment from "moment";
// // // // // import "react-big-calendar/lib/css/react-big-calendar.css";
// // // // // import { Container, Row, Col, Modal, Button, Form } from "react-bootstrap";
// // // // // import axios from "axios";
// // // // // import { useNavigate } from "react-router-dom";
// // // // // import NavBar from "../components/Navbar.jsx";
// // // // // import Footer from "../components/Footer.jsx";

// // // // // const localizer = momentLocalizer(moment);

// // // // // const AgendaPanel = () => {
// // // // //   const navigate = useNavigate();
// // // // //   const [reservas, setReservas] = useState([]);
// // // // //   const [intervalos, setIntervalos] = useState([]);
// // // // //   const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
// // // // //   const [fechaHoraSeleccionada, setFechaHoraSeleccionada] = useState(null);
// // // // //   const [modalAbierto, setModalAbierto] = useState(false);
// // // // //   const [cliente, setCliente] = useState("");
// // // // //   const [emailCliente, setEmailCliente] = useState("");
// // // // //   const [telefonoCliente, setTelefonoCliente] = useState("");
// // // // //   const [duracion, setDuracion] = useState(60); // Duración inicial en minutos
// // // // //   const [precio, setPrecio] = useState(0);

// // // // //   useEffect(() => {
// // // // //     obtenerReservas();
// // // // //     obtenerIntervalos();
// // // // //   }, []);

// // // // //   const obtenerReservas = async () => {
// // // // //     try {
// // // // //       const response = await axios.get(
// // // // //         `http://127.0.0.1:8000/api/v1/reservas/empresa/1`
// // // // //       );
// // // // //       setReservas(response.data.data);
// // // // //     } catch (error) {
// // // // //       console.error("Error al obtener reservas:", error);
// // // // //     }
// // // // //   };

// // // // //   const obtenerIntervalos = async () => {
// // // // //     try {
// // // // //       const response = await axios.get(
// // // // //         `http://127.0.0.1:8000/api/v1/intervalos/empresa/1`
// // // // //       );
// // // // //       setIntervalos(response.data.data);
// // // // //     } catch (error) {
// // // // //       console.error("Error al obtener intervalos:", error);
// // // // //     }
// // // // //   };

// // // // //   const calcularFechaFin = (fecha, hora, duracion) => {
// // // // //     const fechaInicio = new Date(fecha + "T" + hora);
// // // // //     const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
// // // // //     return fechaFin;
// // // // //   };

// // // // //   const eventos = reservas.map((reserva) => ({
// // // // //     id: reserva.id,
// // // // //     title: `Reserva para ${reserva.cliente.name}`,
// // // // //     start: new Date(reserva.fecha + "T" + reserva.hora),
// // // // //     end: calcularFechaFin(reserva.fecha, reserva.hora, reserva.duracion),
// // // // //     precio: reserva.precio,
// // // // //     duracion: reserva.duracion,
// // // // //     estado: reserva.estado,
// // // // //     servicios: reserva.servicios,
// // // // //   }));

// // // // //   const handleSelectEvento = (evento) => {
// // // // //     setEventoSeleccionado(evento);
// // // // //   };

// // // // //   const handleCloseModal = () => {
// // // // //     setEventoSeleccionado(null);
// // // // //   };

// // // // //   const handleSelectSlot = (slotInfo) => {
// // // // //     setFechaHoraSeleccionada(slotInfo.start); // Almacena la fecha y hora seleccionadas
// // // // //     setModalAbierto(true); // Abre el modal para agregar la reserva
// // // // //   };

// // // // //   const handleSubmit = async (event) => {
// // // // //     event.preventDefault();
// // // // //     try {
// // // // //       const response = await axios.post(
// // // // //         "http://127.0.0.1:8000/api/v1/reservas",
// // // // //         {
// // // // //           agenda_id: 1, // Ajusta según tu lógica
// // // // //           nombre_cliente: cliente,
// // // // //           email_cliente: emailCliente,
// // // // //           telefono_cliente: telefonoCliente,
// // // // //           fecha: moment(fechaHoraSeleccionada).format("YYYY-MM-DD"),
// // // // //           hora: moment(fechaHoraSeleccionada).format("HH:mm:ss"),
// // // // //           duracion: duracion,
// // // // //           precio: precio,
// // // // //           estado: "reservado",
// // // // //           observaciones: "",
// // // // //           fecha_reserva: moment().format("YYYY-MM-DD HH:mm:ss"),
// // // // //           servicios: [], // Ajusta según tu estructura de servicios
// // // // //         }
// // // // //       );

// // // // //       // Actualizar el estado de reservas para reflejar la nueva reserva
// // // // //       setReservas([...reservas, response.data.data]);

// // // // //       // Limpiar el formulario y cerrar el modal
// // // // //       setCliente("");
// // // // //       setEmailCliente("");
// // // // //       setTelefonoCliente("");
// // // // //       setDuracion(60);
// // // // //       setPrecio(0);
// // // // //       setModalAbierto(false);

// // // // //       // Opcional: Refrescar la lista de reservas después de agregar una nueva
// // // // //       obtenerReservas();
// // // // //     } catch (error) {
// // // // //       console.error("Error al agregar reserva:", error);
// // // // //     }
// // // // //   };

// // // // //   const verReservas = () => {
// // // // //     navigate(`/reservas`);
// // // // //   };

// // // // //   return (
// // // // //     <>
// // // // //       <NavBar />
// // // // //       <Container className="mt-1">
// // // // //         <Row className="mt-3">
// // // // //           <Col>
// // // // //             <Button variant="primary" onClick={() => setModalAbierto(true)}>
// // // // //               Agregar Reserva
// // // // //             </Button>
// // // // //             <Button
// // // // //               variant="secondary"
// // // // //               className="ml-2"
// // // // //               onClick={() => verReservas()}
// // // // //             >
// // // // //               Ver Reservas
// // // // //             </Button>
// // // // //           </Col>
// // // // //         </Row>

// // // // //         <Row className="mt-3">
// // // // //           <Col>
// // // // //             <Calendar
// // // // //               localizer={localizer}
// // // // //               events={eventos}
// // // // //               startAccessor="start"
// // // // //               endAccessor="end"
// // // // //               style={{ height: 500 }}
// // // // //               onSelectEvent={handleSelectEvento}
// // // // //               onSelectSlot={handleSelectSlot}
// // // // //             />
// // // // //           </Col>
// // // // //         </Row>

// // // // //         <Modal show={modalAbierto} onHide={() => setModalAbierto(false)}>
// // // // //           <Modal.Header closeButton>
// // // // //             <Modal.Title>Agregar Reserva</Modal.Title>
// // // // //           </Modal.Header>
// // // // //           <Modal.Body>
// // // // //             <Form onSubmit={handleSubmit}>
// // // // //               <Form.Group controlId="cliente">
// // // // //                 <Form.Label>Cliente</Form.Label>
// // // // //                 <Form.Control
// // // // //                   type="text"
// // // // //                   value={cliente}
// // // // //                   onChange={(e) => setCliente(e.target.value)}
// // // // //                   required
// // // // //                 />
// // // // //               </Form.Group>
// // // // //               <Form.Group controlId="emailCliente">
// // // // //                 <Form.Label>Email del Cliente</Form.Label>
// // // // //                 <Form.Control
// // // // //                   type="email"
// // // // //                   value={emailCliente}
// // // // //                   onChange={(e) => setEmailCliente(e.target.value)}
// // // // //                 />
// // // // //               </Form.Group>
// // // // //               <Form.Group controlId="telefonoCliente">
// // // // //                 <Form.Label>Teléfono del Cliente</Form.Label>
// // // // //                 <Form.Control
// // // // //                   type="tel"
// // // // //                   value={telefonoCliente}
// // // // //                   onChange={(e) => setTelefonoCliente(e.target.value)}
// // // // //                 />
// // // // //               </Form.Group>
// // // // //               <Form.Group controlId="duracion">
// // // // //                 <Form.Label>Duración (minutos)</Form.Label>
// // // // //                 <Form.Control
// // // // //                   type="number"
// // // // //                   value={duracion}
// // // // //                   onChange={(e) => setDuracion(e.target.value)}
// // // // //                   required
// // // // //                 />
// // // // //               </Form.Group>
// // // // //               <Form.Group controlId="precio">
// // // // //                 <Form.Label>Precio</Form.Label>
// // // // //                 <Form.Control
// // // // //                   type="number"
// // // // //                   value={precio}
// // // // //                   onChange={(e) => setPrecio(e.target.value)}
// // // // //                   required
// // // // //                 />
// // // // //               </Form.Group>
// // // // //               <Button variant="primary" type="submit">
// // // // //                 Agregar Reserva
// // // // //               </Button>
// // // // //             </Form>
// // // // //           </Modal.Body>
// // // // //           <Modal.Footer>
// // // // //             <Button variant="secondary" onClick={() => setModalAbierto(false)}>
// // // // //               Cancelar
// // // // //             </Button>
// // // // //           </Modal.Footer>
// // // // //         </Modal>

// // // // //         <Modal show={eventoSeleccionado !== null} onHide={handleCloseModal}>
// // // // //           <Modal.Header closeButton>
// // // // //             <Modal.Title>Detalles de la Reserva</Modal.Title>
// // // // //           </Modal.Header>
// // // // //           <Modal.Body>
// // // // //             {eventoSeleccionado && (
// // // // //               <div>
// // // // //                 <p>
// // // // //                   <strong>Cliente:</strong>{" "}
// // // // //                   {eventoSeleccionado.title.replace("Reserva para ", "")}
// // // // //                 </p>
// // // // //                 <p>
// // // // //                   <strong>Precio:</strong> $ {eventoSeleccionado.precio}
// // // // //                 </p>
// // // // //                 <p>
// // // // //                   <strong>Duración:</strong> {eventoSeleccionado.duracion} minutos
// // // // //                 </p>
// // // // //                 <p>
// // // // //                   <strong>Estado:</strong> {eventoSeleccionado.estado}
// // // // //                 </p>
// // // // //                 <p>
// // // // //                   <strong>Servicios:</strong>{" "}
// // // // //                   {eventoSeleccionado.servicios}
// // // // //                 </p>
// // // // //                 <p>
// // // // //                   <strong>Fecha y Hora de Inicio:</strong>{" "}
// // // // //                   {new Date(eventoSeleccionado.start).toLocaleString()}
// // // // //                 </p>
// // // // //                 <p>
// // // // //                   <strong>Fecha y Hora de Fin:</strong>{" "}
// // // // //                   {new Date(eventoSeleccionado.end).toLocaleString()}
// // // // //                 </p>
// // // // //               </div>
// // // // //             )}
// // // // //           </Modal.Body>
// // // // //           <Modal.Footer>
// // // // //             <Button variant="secondary" onClick={handleCloseModal}>
// // // // //               Cerrar
// // // // //             </Button>
// // // // //           </Modal.Footer>
// // // // //         </Modal>
// // // // //       </Container>
// // // // //       <Footer />
// // // // //     </>
// // // // //   );
// // // // // };

// // // // // export default AgendaPanel;

// // // // // // import React, { useState, useEffect } from "react";
// // // // // // import { Calendar, momentLocalizer } from "react-big-calendar";
// // // // // // import moment from "moment";
// // // // // // import "react-big-calendar/lib/css/react-big-calendar.css";
// // // // // // import { Container, Row, Col, Modal, Button, Form } from "react-bootstrap";
// // // // // // import axios from "axios";
// // // // // // import AuthUser from "../pageauth/AuthUser";
// // // // // // import { useNavigate } from "react-router-dom";
// // // // // // import NavBar from "../components/Navbar.jsx";
// // // // // // import Footer from "../components/Footer.jsx";

// // // // // // const localizer = momentLocalizer(moment);

// // // // // // const AgendaPanel = () => {
// // // // // //   const { getUser } = AuthUser();
// // // // // //   const navigate = useNavigate();
// // // // // //   const [reservas, setReservas] = useState([]);
// // // // // //   const [intervalos, setIntervalos] = useState([]);
// // // // // //   const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
// // // // // //   const [fechaHoraSeleccionada, setFechaHoraSeleccionada] = useState(null);
// // // // // //   const [modalAbierto, setModalAbierto] = useState(false);
// // // // // //   const [cliente, setCliente] = useState("");
// // // // // //   const [duracion, setDuracion] = useState(60); // Duración inicial en minutos
// // // // // //   const [precio, setPrecio] = useState(0);

// // // // // //   useEffect(() => {
// // // // // //     obtenerReservas();
// // // // // //     obtenerIntervalos();
// // // // // //   }, []);

// // // // // //   const obtenerReservas = async () => {
// // // // // //     try {
// // // // // //       const response = await axios.get(
// // // // // //         `http://127.0.0.1:8000/api/v1/reservas/empresa/${getUser().id}`
// // // // // //       );
// // // // // //       setReservas(response.data.data);
// // // // // //     } catch (error) {
// // // // // //       console.error("Error al obtener reservas:", error);
// // // // // //     }
// // // // // //   };

// // // // // //   const obtenerIntervalos = async () => {
// // // // // //     try {
// // // // // //       const response = await axios.get(
// // // // // //         `http://127.0.0.1:8000/api/v1/intervalos/empresa/${getUser().id}`
// // // // // //       );
// // // // // //       setIntervalos(response.data.data);
// // // // // //     } catch (error) {
// // // // // //       console.error("Error al obtener intervalos:", error);
// // // // // //     }
// // // // // //   };

// // // // // //   const calcularFechaFin = (fecha, hora, duracion) => {
// // // // // //     const fechaInicio = new Date(fecha + "T" + hora);
// // // // // //     const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
// // // // // //     return fechaFin;
// // // // // //   };

// // // // // //   const eventos = reservas.map((reserva) => ({
// // // // // //     id: reserva.id,
// // // // // //     title: `Reserva para ${reserva.cliente.name}`,
// // // // // //     start: new Date(reserva.fecha + "T" + reserva.hora),
// // // // // //     end: calcularFechaFin(reserva.fecha, reserva.hora, reserva.duracion),
// // // // // //     precio: reserva.precio,
// // // // // //     duracion: reserva.duracion,
// // // // // //     estado: reserva.estado,
// // // // // //     servicios: reserva.servicios,
// // // // // //   }));

// // // // // //   const handleSelectEvento = (evento) => {
// // // // // //     setEventoSeleccionado(evento);
// // // // // //   };

// // // // // //   const handleCloseModal = () => {
// // // // // //     setEventoSeleccionado(null);
// // // // // //   };

// // // // // //   const handleSelectSlot = (slotInfo) => {
// // // // // //     setFechaHoraSeleccionada(slotInfo.start); // Almacena la fecha y hora seleccionadas
// // // // // //     setModalAbierto(true); // Abre el modal para agregar la reserva
// // // // // //   };
// // // // // //   const handleSubmit = async (event) => {
// // // // // //     event.preventDefault();
// // // // // //     try {
// // // // // //       const response = await axios.post(
// // // // // //         "http://127.0.0.1:8000/api/v1/reservas",
// // // // // //         {
// // // // // //           cliente_id: 1,
// // // // // //           agenda_id: 1, // Ajusta según tu lógica
// // // // // //           fecha: moment(fechaHoraSeleccionada).format("YYYY-MM-DD"),
// // // // // //           hora: moment(fechaHoraSeleccionada).format("HH:mm:ss"),
// // // // // //           duracion: duracion,
// // // // // //           precio: precio,
// // // // // //           estado: "reservado",
// // // // // //           observaciones: "",
// // // // // //           fecha_reserva: moment().format("YYYY-MM-DD HH:mm:ss"),
// // // // // //           servicios: [], // Ajusta según tu estructura de servicios
// // // // // //         }
// // // // // //       );

// // // // // //       // Actualizar el estado de reservas para reflejar la nueva reserva
// // // // // //       setReservas([...reservas, response.data.data]);

// // // // // //       // Limpiar el formulario y cerrar el modal
// // // // // //       setCliente("");
// // // // // //       setDuracion(60);
// // // // // //       setPrecio(0);
// // // // // //       setModalAbierto(false);

// // // // // //       // Opcional: Refrescar la lista de reservas después de agregar una nueva
// // // // // //       obtenerReservas();
// // // // // //     } catch (error) {
// // // // // //       console.error("Error al agregar reserva:", error);
// // // // // //     }
// // // // // //   };

// // // // // //   const verReservas = () => {
// // // // // //     navigate(`/reservas`);

// // // // // //   }

// // // // // //   return (
// // // // // //     <>
// // // // // //     <NavBar />
// // // // // //     <Container className="mt-1">
// // // // // //       <Row className="mt-3">
// // // // // //         <Col>
// // // // // //           <Button variant="primary" onClick={() => setModalAbierto(true)}>
// // // // // //             Agregar Reserva
// // // // // //           </Button>
// // // // // //           <Button variant="secondary" className="ml-2" onClick={() => verReservas()}>
// // // // // //             Ver Reservas
// // // // // //           </Button>
// // // // // //         </Col>
// // // // // //       </Row>

// // // // // //       <Row className="mt-3">
// // // // // //         <Col>
// // // // // //           <Calendar
// // // // // //             localizer={localizer}
// // // // // //             events={eventos}
// // // // // //             startAccessor="start"
// // // // // //             endAccessor="end"
// // // // // //             style={{ height: 500 }}
// // // // // //             onSelectEvent={handleSelectEvento}
// // // // // //             onSelectSlot={handleSelectSlot}
// // // // // //           />
// // // // // //         </Col>
// // // // // //       </Row>

// // // // // //       <Modal show={modalAbierto} onHide={() => setModalAbierto(false)}>
// // // // // //         <Modal.Header closeButton>
// // // // // //           <Modal.Title>Agregar Reserva</Modal.Title>
// // // // // //         </Modal.Header>
// // // // // //         <Modal.Body>
// // // // // //           <Form onSubmit={handleSubmit}>
// // // // // //             <Form.Group controlId="cliente">
// // // // // //               <Form.Label>Cliente</Form.Label>
// // // // // //               <Form.Control
// // // // // //                 type="text"
// // // // // //                 value={cliente}
// // // // // //                 onChange={(e) => setCliente(e.target.value)}
// // // // // //                 required
// // // // // //               />
// // // // // //             </Form.Group>
// // // // // //             <Form.Group controlId="duracion">
// // // // // //               <Form.Label>Duración (minutos)</Form.Label>
// // // // // //               <Form.Control
// // // // // //                 type="number"
// // // // // //                 value={duracion}
// // // // // //                 onChange={(e) => setDuracion(e.target.value)}
// // // // // //                 required
// // // // // //               />
// // // // // //             </Form.Group>
// // // // // //             <Form.Group controlId="precio">
// // // // // //               <Form.Label>Precio</Form.Label>
// // // // // //               <Form.Control
// // // // // //                 type="number"
// // // // // //                 value={precio}
// // // // // //                 onChange={(e) => setPrecio(e.target.value)}
// // // // // //                 required
// // // // // //               />
// // // // // //             </Form.Group>
// // // // // //             <Button variant="primary" type="submit">
// // // // // //               Agregar Reserva
// // // // // //             </Button>
// // // // // //           </Form>
// // // // // //         </Modal.Body>
// // // // // //         <Modal.Footer>
// // // // // //           <Button variant="secondary" onClick={() => setModalAbierto(false)}>
// // // // // //             Cancelar
// // // // // //           </Button>
// // // // // //         </Modal.Footer>
// // // // // //       </Modal>

// // // // // //     {/* //------------------------------------------- */}

// // // // // //       <Modal show={eventoSeleccionado !== null} onHide={handleCloseModal}>
// // // // // //         <Modal.Header closeButton>
// // // // // //           <Modal.Title>Detalles de la Reserva</Modal.Title>
// // // // // //         </Modal.Header>
// // // // // //         <Modal.Body>
// // // // // //           {eventoSeleccionado && (
// // // // // //             <div>
// // // // // //               <p>
// // // // // //                 <strong>Cliente:</strong>{" "}
// // // // // //                 {eventoSeleccionado.title.replace("Reserva para ", "")}
// // // // // //               </p>
// // // // // //               <p>
// // // // // //                 <strong>Precio:</strong> $ {eventoSeleccionado.precio}
// // // // // //               </p>
// // // // // //               <p>
// // // // // //                 <strong>Duración:</strong> {eventoSeleccionado.duracion} minutos
// // // // // //               </p>
// // // // // //               <p>
// // // // // //                 <strong>Estado:</strong> {eventoSeleccionado.estado}
// // // // // //               </p>
// // // // // //               <p>
// // // // // //                 <strong>Servicios:</strong>{" "}
// // // // // //                 {eventoSeleccionado.servicios}
// // // // // //               </p>
// // // // // //               <p>
// // // // // //                 <strong>Fecha y Hora de Inicio:</strong>{" "}
// // // // // //                 {new Date(eventoSeleccionado.start).toLocaleString()}
// // // // // //               </p>
// // // // // //               <p>
// // // // // //                 <strong>Fecha y Hora de Fin:</strong>{" "}
// // // // // //                 {new Date(eventoSeleccionado.end).toLocaleString()}
// // // // // //               </p>
// // // // // //             </div>
// // // // // //           )}
// // // // // //         </Modal.Body>
// // // // // //         <Modal.Footer>
// // // // // //           <Button variant="secondary" onClick={handleCloseModal}>
// // // // // //             Cerrar
// // // // // //           </Button>
// // // // // //         </Modal.Footer>
// // // // // //       </Modal>
// // // // // //     </Container>
// // // // // //     <Footer />
// // // // // //     </>
// // // // // //   );
// // // // // // };

// // // // // // export default AgendaPanel;

// // // // // // // import React, { useState, useEffect } from "react";
// // // // // // // import { Calendar, momentLocalizer } from "react-big-calendar";
// // // // // // // import moment from "moment";
// // // // // // // import "react-big-calendar/lib/css/react-big-calendar.css";
// // // // // // // import { Container, Row, Col, Modal, Button } from "react-bootstrap";
// // // // // // // import axios from "axios";
// // // // // // // import AuthUser from "../pageauth/AuthUser";

// // // // // // // const localizer = momentLocalizer(moment);

// // // // // // // const AgendaPanel = () => {
// // // // // // //   const { getUser } = AuthUser();
// // // // // // //   const [reservas, setReservas] = useState([]);
// // // // // // //   const [intervalos, setIntervalos] = useState([]);
// // // // // // //   const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

// // // // // // //   useEffect(() => {
// // // // // // //     obtenerReservas();
// // // // // // //     obtenerIntervalos();
// // // // // // //   }, []);

// // // // // // //   const obtenerReservas = async () => {
// // // // // // //     try {
// // // // // // //       const response = await axios.get(
// // // // // // //         `http://127.0.0.1:8000/api/v1/reservas/empresa/${getUser().id}`
// // // // // // //       );
// // // // // // //       setReservas(response.data.data);
// // // // // // //     } catch (error) {
// // // // // // //       console.error("Error al obtener reservas:", error);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const obtenerIntervalos = async () => {
// // // // // // //     try {
// // // // // // //       const response = await axios.get(
// // // // // // //         `http://127.0.0.1:8000/api/v1/intervalos/empresa/${getUser().id}`
// // // // // // //       );
// // // // // // //       setIntervalos(response.data.data);
// // // // // // //     } catch (error) {
// // // // // // //       console.error("Error al obtener intervalos:", error);
// // // // // // //     }
// // // // // // //   };
// // // // // // //   console.log("setIntervalos", intervalos);

// // // // // // //   const calcularFechaFin = (fecha, hora, duracion) => {
// // // // // // //     const fechaInicio = new Date(fecha + "T" + hora);
// // // // // // //     const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
// // // // // // //     return fechaFin;
// // // // // // //   };

// // // // // // //   const eventos = reservas.map((reserva) => ({
// // // // // // //     id: reserva.id,
// // // // // // //     title: `Reserva para ${reserva.cliente.nombre}`,
// // // // // // //     start: new Date(reserva.fecha + "T" + reserva.hora),
// // // // // // //     end: calcularFechaFin(reserva.fecha, reserva.hora, reserva.duracion),
// // // // // // //   }));

// // // // // // //   const handleSelectEvento = (evento) => {
// // // // // // //     setEventoSeleccionado(evento);
// // // // // // //   };

// // // // // // //   const handleCloseModal = () => {
// // // // // // //     setEventoSeleccionado(null);
// // // // // // //   };

// // // // // // //   const customDayPropGetter = (date) => {
// // // // // // //     const day = date.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
// // // // // // //     const horaActual = moment(date).format("HH:mm:ss");

// // // // // // //     // Filtrar por intervalos
// // // // // // //     const intervaloDiaActual = intervalos.find(
// // // // // // //       (intervalo) =>
// // // // // // //         intervalo.dias_semanas.includes(day) &&
// // // // // // //         moment(horaActual, "HH:mm:ss").isBetween(
// // // // // // //           moment(intervalo.hora_inicio, "HH:mm:ss"),
// // // // // // //           moment(intervalo.hora_fin, "HH:mm:ss"),
// // // // // // //           null,
// // // // // // //           "[]"
// // // // // // //         )
// // // // // // //     );

// // // // // // //     return {
// // // // // // //       className: intervaloDiaActual ? "intervalo-habilitado" : "intervalo-deshabilitado",
// // // // // // //     };
// // // // // // //   };

// // // // // // //   return (
// // // // // // //     <Container className="mt-5">
// // // // // // //       <Row className="mt-3">
// // // // // // //         <Col>
// // // // // // //           <Calendar
// // // // // // //             localizer={localizer}
// // // // // // //             events={eventos}
// // // // // // //             startAccessor="start"
// // // // // // //             endAccessor="end"
// // // // // // //             style={{ height: 500 }}
// // // // // // //             onSelectEvent={handleSelectEvento}
// // // // // // //             dayPropGetter={customDayPropGetter}
// // // // // // //           />
// // // // // // //         </Col>
// // // // // // //       </Row>

// // // // // // //       <Modal show={eventoSeleccionado !== null} onHide={handleCloseModal}>
// // // // // // //         <Modal.Header closeButton>
// // // // // // //           <Modal.Title>Detalles de la Reserva</Modal.Title>
// // // // // // //         </Modal.Header>
// // // // // // //         <Modal.Body>
// // // // // // //           {eventoSeleccionado && (
// // // // // // //             <div>
// // // // // // //               <p><strong>Título:</strong> {eventoSeleccionado.title}</p>
// // // // // // //               <p><strong>Fecha y Hora de Inicio:</strong> {eventoSeleccionado.start.toLocaleString()}</p>
// // // // // // //               <p><strong>Fecha y Hora de Fin:</strong> {eventoSeleccionado.end.toLocaleString()}</p>
// // // // // // //             </div>
// // // // // // //           )}
// // // // // // //         </Modal.Body>
// // // // // // //         <Modal.Footer>
// // // // // // //           <Button variant="secondary" onClick={handleCloseModal}>
// // // // // // //             Cerrar
// // // // // // //           </Button>
// // // // // // //         </Modal.Footer>
// // // // // // //       </Modal>
// // // // // // //     </Container>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default AgendaPanel;
