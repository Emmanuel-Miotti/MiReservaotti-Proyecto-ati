import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Image,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import NavBar from "../components/Navbar.jsx";
import Config from "../Config";
import DatePicker from "react-datepicker";
import "../../css/Home.css";
import ProgressBar from "react-bootstrap/ProgressBar";
import { FaTimes } from "react-icons/fa";

const ReservaPage = () => {
  const [showError, setShowError] = useState({
    servicios: false,
    fechaHora: false,
    cliente: false,
    confirmacion: false,
    success: false,
  });
  const [errorMessage, setErrorMessage] = useState("");

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
  const [isLoadingTimes, setIsLoadingTimes] = useState(false); // Estado para controlar la carga de horarios
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [noAvailableTimes, setNoAvailableTimes] = useState(false);
  const [empresa, setEmpresa] = useState(null);

  const url = new URL(window.location.href);
  const id = url.pathname.split("/").pop();
  const empresaId = id;
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistDate, setWaitlistDate] = useState(null);
  const [waitlistStartTime, setWaitlistStartTime] = useState(null);
  const [waitlistEndTime, setWaitlistEndTime] = useState(null);
  const [waitlistObservations, setWaitlistObservations] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    obtenerEmpresa();
    obtenerServicios();
    const usuario = localStorage.getItem("usuario");
    console.log(usuario)
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

  

  const obtenerEmpresa = async () => {
    try {
      const response = await Config.getEmpresaId(empresaId);
      console.log(response.data);
      setEmpresa(response.data.data);
    } catch (error) {
      console.error("Error al cargar empresa:", error);
    }
  };

  const obtenerServicios = async () => {
    try {
      const response = await Config.getServicesActivosByEmpresa(empresaId);
      console.log(response.data)
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
      setErrorMessage("Selecciona al menos un servicio");
      setShowError({ ...showError, servicios: true });
      return;
    }

    setShowError({
      servicios: false,
      fechaHora: false,
      cliente: false,
      confirmacion: false,
      success: false,
    });

    setPaso(2);
  };

  const handleFechaHoraSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setErrorMessage("Selecciona una fecha y hora");
      setShowError({ ...showError, fechaHora: true });
      return;
    }

    setShowError({
      servicios: false,
      fechaHora: false,
      cliente: false,
      confirmacion: false,
      success: false,
    });

    setPaso(3);
  };

  const handleClienteSubmit = (e) => {
    e.preventDefault();
    if (!cliente.nombre && (!cliente.email || !cliente.telefono)) {
      setErrorMessage(
        "El nombre es obligatorio"
      );
      setShowError({ ...showError, cliente: true });
      return;
    }

    if (!cliente.email) {
      if (!cliente.telefono) {
        setErrorMessage(
          "Completa al menos uno de los campos Email o Teléfono"
        );
        setShowError({ ...showError, cliente: true });
        return;
      }
      
    }



    setShowError({
      servicios: false,
      fechaHora: false,
      cliente: false,
      confirmacion: false,
      success: false,
    });

    setPaso(4);
  };

  const handleConfirmacionSubmit = async (e) => {
    e.preventDefault();

    // Verificar datos antes de enviar
    if (
      !cliente.nombre ||
      // !cliente.email ||
      // !cliente.telefono ||
      !selectedDate ||
      !selectedTime ||
      serviciosSeleccionados.length === 0
    ) {
      setErrorMessage("Todos los campos son requeridos.");
      setShowError({ ...showError, confirmacion: true });
      return;
    }

    try {
      if (!isUserLoggedIn) {
        await Config.createReservaPocosDatos({
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
      setErrorMessage("Reserva creada con éxito");
      setShowError({
        servicios: false,
        fechaHora: false,
        cliente: false,
        confirmacion: false,
        success: true,
      });
      setPaso(5); // Cambio el paso a 5 para mostrar la alerta de éxito
    } catch (error) {
      if (error.response) {
        const errorMsg =
          error.response.data.message || "Error al crear la reserva";
        setErrorMessage(errorMsg);
        setShowError({ ...showError, confirmacion: true });
      } else {
        setErrorMessage("Error desconocido al crear la reserva");
        setShowError({ ...showError, confirmacion: true });
      }
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setIsLoadingTimes(true); // Establecer isLoadingTimes a true cuando comienza la carga
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
        intervalo_reserva: 15,
      });
      console.log(response)
      setAvailableTimes(response.data.horas_disponibles);
      setNoAvailableTimes(response.data.horas_disponibles.length === 0);
      setIsLoadingTimes(false); // Establecer isLoadingTimes a false cuando termina la carga
    } catch (error) {
      console.error("Error al obtener horas disponibles:", error);
      setIsLoadingTimes(false); // Establecer isLoadingTimes a false si hay un error
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const calcularDuracionTotal = (serviciosSeleccionados) => {
    let duracionTotal = 30;
    return duracionTotal;
  };

  const handleSuccessAlert = () => {
    navigate(`/${empresa.url}`);
  };

  const handleWaitlistSubmit = async () => {
    try {
      await Config.createWaitlist({
        cliente_id: idCliente || null,
        nombre_cliente: cliente.nombre,
        email_cliente: cliente.email,
        telefono_cliente: cliente.telefono,
        agenda_id: empresaId,
        fecha: moment(waitlistDate).format("YYYY-MM-DD"),
        hora_inicio: waitlistStartTime,
        hora_fin: waitlistEndTime,
        observaciones: waitlistObservations,
      });
      setShowWaitlistModal(false);
      setErrorMessage("Te has inscrito en la lista de espera.");
      setShowError({ ...showError, success: true });
    } catch (error) {
      setErrorMessage("Error al inscribirse en la lista de espera.");
      setShowError({ ...showError, confirmacion: true });
    }
  };

  const noRegistrado = () => {
    setSuccessMessage('Para unirte a la lista de espera debes estar registrado');
    setShowModal(true);
  };

  const iniciarPago = async () => {
    const items = Object.entries(reserva).map(([id, data]) => {
        return {
            title: "Reserva",
            quantity: 1,
            unit_price: precioReserva,
        };
    });

    const data = {
        items: items,
        // back_urls: {
        //     success: "http://localhost:3000/login", // URL a la que se redirige tras un pago exitoso
        //     failure: "http://localhost:3000/registerxs", // URL a la que se redirige tras un fallo de pago
        //     pending: "http://localhost:3000/register111"  // URL a la que se redirige si el pago queda pendiente
        // },
        auto_return: "approved",  // Opcional: redirige automáticamente solo tras pagos aprobados
        // Añade aquí cualquier otra información relevante para la preferencia
    };

    console.log(data)
    try {
        const response = await fetch(`${Config.url()}/mercadopago/create_preference`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const responseData = await response.json();
        if (response.ok) {
            window.location.href = responseData.init_point; // Redirecciona al checkout de MercadoPago
        } else {
            console.error('Error al crear la preferencia de pago:', responseData);
        }
    } catch (error) {
        console.error('Error al conectar con el servidor:', error);
    }
};



  return (
    <>
      <NavBar />

      <Modal show={showModal} onHide={() => setShowModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title>Lista de Espera</Modal.Title>
    </Modal.Header>
    <Modal.Body>{successMessage}</Modal.Body>
    <Modal.Footer>
        <Button variant="primary" onClick={() => navigate(`/register-cliente`)}>
          Registrarme
        </Button>

        <Button variant="primary" onClick={() => setShowModal(false)}>
            Cancelar
        </Button>
    </Modal.Footer>
</Modal>


      <Container className="mt-3 containercss">
        <Card className="header-card">
          {empresa ? (
            <>
              <Row className="align-items-center">
                {/* <Col xs={12} md={4} className="text-center">
                  <Image
                    src={empresa.perfilUrl || "https://via.placeholder.com/100"}
                    alt="Perfil de Empresa"
                    className="img-fluid rounded-circle mb-3"
                  />
                </Col> */}
                <Col xs={12} md={4} className="text-center">
                    <img
                      src={
                        empresa.profile_picture
                          ? `${Config.urlFoto()}${empresa.profile_picture}`
                          : "https://via.placeholder.com/150"
                      }
                      alt="Imagen de Usuario"
                      className="img-fluid rounded-circle"
                      style={{ width: "150px", height: "150px" }}
                    />
                  </Col>
                  
                <Col xs={12} md={8}>
                  <h2>
                    <strong>Empresa:</strong> {empresa.name}
                  </h2>
                  <p>Reservación de Servicios</p>
                </Col>
                <Col xs={12} md={8} className="mt-3">
                  <ProgressBar now={(paso / 5) * 100} label={`${paso}/5`} variant="success" />
                </Col>
              </Row>
            </>
          ) : (
            <h2>Cargando datos de empresa...</h2>
          )}
        </Card>
        {showError.servicios && (
          <Alert
            variant="danger"
            onClose={() => setShowError({ ...showError, servicios: false })}
            dismissible
          >
            <FaTimes className="mr-2" />
            {errorMessage}
          </Alert>
        )}
        {showError.fechaHora && (
          <Alert
            variant="danger"
            onClose={() => setShowError({ ...showError, fechaHora: false })}
            dismissible
          >
            <FaTimes className="mr-2" />
            {errorMessage}
          </Alert>
        )}
        {showError.cliente && (
          <Alert
            variant="danger"
            onClose={() => setShowError({ ...showError, cliente: false })}
            dismissible
          >
            <FaTimes className="mr-2" />
            {errorMessage}
          </Alert>
        )}
        {showError.confirmacion && (
          <Alert
            variant="danger"
            onClose={() => setShowError({ ...showError, confirmacion: false })}
            dismissible
          >
            <FaTimes className="mr-2" />
            {errorMessage}
          </Alert>
        )}
        {paso === 1 && (
          <Form onSubmit={handleServiciosSubmit}>
            <h3>Selecciona tus servicios</h3>
            {servicios ? (
              <>
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
                          <Card.Text>
                            Duración: {servicio.duracion} minutos
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            ) : (
              <p>Cargando servicios...</p>
            )}
            <div className="button-group">
            <Button variant="secondary" onClick={() => navigate(-1)} style={{ marginTop: "20px" }}>
        Atrás
    </Button>
              <Button
                className="btn btn-success"
                variant="primary"
                type="submit"
                style={{ marginTop: "20px" }}
              >
                Siguiente
              </Button>
            </div>
          </Form>
        )}
        {paso === 2 && (
          <Form onSubmit={handleFechaHoraSubmit}>
            <h2>Selecciona la Fecha y Hora</h2>
            <Row>
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
               <Col xs={12} md={8}> {/*// md = 6 */}
                <h3>Horas Disponibles</h3>
                {isLoadingTimes ? (
                  <div className="d-flex justify-content-center align-items-center">
                    <Spinner animation="border" role="status">
                      <span className="sr-only">Cargando...</span>
                    </Spinner>
                  </div>
                ) : noAvailableTimes ? (
                  <p>No hay horarios disponibles para esta fecha</p>
                ) : (
                  <div className="mb-3">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className={`m-1 ${
                          selectedTime === time
                            ? "btn-selected"
                            : "btn-available"
                        }`}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                )}
              </Col>
              <p className="mt-3 text-center">
              {/* { usuario */}
                     Ningún horario te viene bien?<Button style={{ color: 'green' }} variant="link" onClick={() => { localStorage.getItem("usuario") ? navigate(`/listaEspera/${empresa.id}`) : noRegistrado()}}>Entra aquí y únete a la lista de espera</Button>
              
     </p>




            </Row>
            <div className="button-group">
              <Button
                variant="secondary"
                onClick={() => {
                  setPaso(paso - 1);
                  setShowError({
                    servicios: false,
                    fechaHora: false,
                    cliente: false,
                    confirmacion: false,
                    success: false,
                  });
                }}
                style={{ marginTop: "20px" }}
              >
                Atrás
              </Button>
              <Button
               className="btn btn-success"
                variant="primary"
                type="submit"
                style={{ marginTop: "20px" }}
              >
                Siguiente
              </Button>
            </div>


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
                // required
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
                // required
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
                // required
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
            <div className="button-group">
              <Button
                variant="secondary"
                onClick={() => {
                  setPaso(paso - 1);
                  setShowError({
                    servicios: false,
                    fechaHora: false,
                    cliente: false,
                    confirmacion: false,
                    success: false,
                  });
                }}
                style={{ marginTop: "20px" }}
              >
                Atrás
              </Button>
              <Button
               className="btn btn-success"
                variant="primary"
                type="submit"
                style={{ marginTop: "20px" }}
              >
                Siguiente
              </Button>
            </div>
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
            <p>
              <strong>Duración Total:</strong> {duracionReserva} minutos
            </p>
            <p>
              <strong>Precio Total:</strong> ${precioReserva}
            </p>
            <p>
              <strong>Observaciones:</strong> {reserva.observacion}
            </p>

            <Button variant="success" onClick={handleConfirmacionSubmit}>
              {/* Confirmar Reserva */} Pagar en persona
            </Button>

            <Button style={{ marginLeft: "10px" }} onClick={iniciarPago}>Pagar con MercadoPago</Button>

            <Button
              variant="danger"
              onClick={() => {
                setPaso(paso - 1);
                setShowError({
                  servicios: false,
                  fechaHora: false,
                  cliente: false,
                  confirmacion: false,
                  success: false,
                });
              }}
              style={{ marginLeft: "10px" }}
            >
              Atrás
            </Button>
          </div>
        )}
        {showError.success && (
          <Card className="mt-3">
            <Card.Body>
              <Card.Title>Reserva creada con éxito</Card.Title>
              <Card.Text>Su reserva ha sido creada con éxito.</Card.Text>
              <Button variant="success" onClick={handleSuccessAlert}>
                Aceptar
              </Button>
            </Card.Body>
          </Card>
        )}
      </Container>

      
    </>
  );
};

export default ReservaPage;
