import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Alert, Modal } from "react-bootstrap";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../css/Empresa.css";
import Config from "../Config";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import NavBar from "../components/Navbar.jsx";
import AuthUser from "../pageauth/AuthUser";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

moment.locale("es");
const localizer = momentLocalizer(moment);

const PanelAdmin = () => {
  const { getUser } = AuthUser();
  const [reservas, setReservas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventas, setVentas] = useState([]);
  const [reservasRegistradas, setReservasRegistradas] = useState(0);
  const [reservasNoRegistradas, setReservasNoRegistradas] = useState(0);
  const [totalGenerado, setTotalGenerado] = useState(0);
  const [filteredReservas, setFilteredReservas] = useState([]);
  const [reservasPorDia, setReservasPorDia] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedOption, setSelectedOption] = useState("hoy");

  useEffect(() => {
    const fetchData = async () => {
      try {
        await obtenerServicios();
        await obtenerHorarios();
        await obtenerReservas();
        await obtenerProductos();
        await fetchVentas();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (reservas.length > 0) {
      filtrarPorOpcion(reservas);
    }
  }, [selectedOption, reservas]);

  const obtenerServicios = async () => {
    try {
      const response = await Config.getServicesByEmpresa(getUser().id);
      setServicios(response.data);
    } catch (error) {
      console.error("Error al obtener servicios:", error);
    }
  };

  const obtenerHorarios = async () => {
    try {
      const response = await Config.getIntervalosEmpresa(getUser().id);
      setHorarios(response.data.data);
    } catch (error) {
      console.error("Error al obtener horarios:", error);
    }
  };

  const obtenerReservas = async () => {
    try {
      const userId = getUser().id;
      const [response1, response2] = await Promise.all([
        Config.getReservasEmpresa(userId),
        Config.getReservasSinUsuarioEmpresa(userId),
      ]);

      const reservasRegistradasData = response1.data.data.filter(reserva => reserva.estado === 'reservado');
      const reservasNoRegistradasData = response2.data.data.filter(reserva => reserva.estado === 'reservado');

      const allReservas = [
        ...reservasRegistradasData.map((r) => ({ ...r, isRegistered: true })),
        ...reservasNoRegistradasData.map((r) => ({ ...r, isRegistered: false })),
      ];

      setReservas(allReservas);
      setReservasRegistradas(reservasRegistradasData.length);
      setReservasNoRegistradas(reservasNoRegistradasData.length);

      console.log(allReservas)
    } catch (error) {
      console.error("Error al obtener reservas:", error);
    }
  };

  const obtenerProductos = async () => {
    try {
      const response = await Config.getProductosEmpresa(getUser().id);
      setProductos(response.data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const fetchVentas = async () => {
    try {
      const response = await Config.getVentasEmpresa(getUser().id);
      setVentas(response.data.ventas);
    } catch (error) {
      console.error("Error al obtener las ventas:", error);
    }
  };

  const calcularFechaFin = (fecha, hora, duracion) => {
    const fechaInicio = new Date(fecha + "T" + hora);
    const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
    return fechaFin;
  };

  const filtrarPorOpcion = (reservas) => {
    let startDate, endDate;

    switch (selectedOption) {
      case "hoy":
        startDate = moment().startOf("day");
        endDate = moment().endOf("day");
        break;
      case "semana":
        startDate = moment().startOf("week");
        endDate = moment().endOf("week");
        break;
      case "mes":
        startDate = moment().startOf("month");
        endDate = moment().endOf("month");
        break;
      default:
        startDate = moment().startOf("day");
        endDate = moment().endOf("day");
        break;
    }

    const reservasFiltradas = reservas.filter(reserva =>
      moment(reserva.fecha).isBetween(startDate, endDate, null, '[]')
    );

    setFilteredReservas(reservasFiltradas);

    console.log(reservasFiltradas);

    const total = reservasFiltradas.reduce((sum, reserva) => sum + (parseFloat(reserva.precio) || 0), 0);
    setTotalGenerado(total);

    const registeredCount = reservasFiltradas.filter(reserva => reserva.isRegistered).length;
    const unregisteredCount = reservasFiltradas.filter(reserva => !reserva.isRegistered).length;

    setReservasRegistradas(registeredCount);
    setReservasNoRegistradas(unregisteredCount);

    const reservasPorDiaData = Array(7).fill(0); // Inicializa el array para los días de la semana
    reservasFiltradas.forEach(reserva => {
      const dia = moment(reserva.fecha).day(); // Obtiene el día de la semana (0: Domingo, 6: Sábado)
      reservasPorDiaData[dia]++;
    });
    setReservasPorDia(reservasPorDiaData);
  };

  const calcularTotalVentasProductos = () => {
    return ventas.reduce((total, venta) => total + (venta.cantidad * venta.precio), 0);
  };

  const obtenerServiciosPorIds = async (ids) => {
    try {
      const response = await fetch('127.0.0.1:8000/api/v1/servicios/by-ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          servicios: ids,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Error al obtener los servicios');
      }
  
      const data = await response.json();
      return data.servicios; // Asumiendo que la API devuelve los servicios en un campo "servicios"
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  const eventos = filteredReservas.map((reserva) => (    {
    servicios:reserva.servicios,
    id: reserva.id,
    title: `${reserva.cliente?.name || reserva.nombre_cliente}`, //Reserva para 
    start: new Date(reserva.fecha + "T" + reserva.hora),
    end: calcularFechaFin(reserva.fecha, reserva.hora, reserva.duracion),
  }));

  console.log(eventos)

  const handleEventClick = (event) => {
    
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  if (loading) {
    return <p>Cargando...</p>;
  }




  return (
    <>
      <NavBar />
             <Container className="mt-3">

                    {!servicios.length && (
         <Alert variant="info" className="d-flex justify-content-between align-items-center">
            <span>Para que los clientes puedan realizar reservas, debes registrar tu primer servicio.</span>
            <Button variant="primary" size="sm" href="/servicios">
              Registrar Servicio
            </Button>
          </Alert>
        )}
        {!horarios.length && (
          <Alert variant="info" className="d-flex justify-content-between align-items-center">
          <span>Para que los clientes puedan realizar reservas, debes registrar tu primer horario.</span>
            <Button variant="primary" size="sm" href="/intervalos">
              Registrar Horario
            </Button>
           </Alert>
         )}



       <Col xs={12} md={4} className="text-center">
             <h2>Resumen</h2>
           </Col>
         <Row className="align-items-center">

           <Col xs={12} md={4} className="text-center cardAdmin">
           <h3>Selecciona un periodo</h3>
           {/* <h4>${Number(totalGenerado).toFixed(2)}</h4> */}
             <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="form-select"
            >
              <option value="hoy">Hoy</option>
              <option value="semana">Esta Semana</option>
              <option value="mes">Este Mes</option>
            </select>
          </Col>
          <Col xs={12} md={2} className="text-center cardAdmin ">
          <h3>Reservas</h3>
          <h4>{filteredReservas.length}</h4>
          </Col>
          <Col xs={12} md={3} className="text-center cardAdmin">
          <h3>Total Generado</h3>
          <h4>${Number(totalGenerado).toFixed(2)}</h4>
            {/* <h4>${Number(totalGenerado).toFixed(2)}</h4> */}
          </Col>
        </Row>
      </Container>
      <Container className="mt-3 cardPlanes">
        <h2>Reservas Filtradas</h2>
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          defaultView="day"
          views={["day", "week", "month"]}
          selectable={true}
          min={new Date(moment().startOf("day").hour(1))}
          max={new Date(moment().startOf("day").hour(23))}
          scrollToTime={new Date(moment().startOf("day").hour(8))}
          onSelectEvent={handleEventClick}
          culture="es"
        />
      </Container>

      <Modal show={showEventModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <>
              <p><strong>Cliente:</strong> {selectedEvent.title}</p>
              <p><strong>Servicios:</strong> {selectedEvent.servicios.map(servicio => servicio.nombre).join(', ')}</p>

              {/* <p><strong>Cliente:</strong> {selectedEvent.servicios}</p> */}
              <p><strong>Fecha:</strong> {moment(selectedEvent.start).format('LL')}</p>
              <p><strong>Hora de Inicio:</strong> {moment(selectedEvent.start).format('LT')}</p>
              <p><strong>Hora de Fin:</strong> {moment(selectedEvent.end).format('LT')}</p>
              <p><strong>Duración:</strong> {moment.duration(moment(selectedEvent.end).diff(moment(selectedEvent.start))).asMinutes()} minutos</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      <Container className="mt-5">
        <Row>
          <Col xs={12} md={3} className="text-center cardAdmin">
            <h3>Fuentes de reservas</h3>
            <Doughnut
              data={{
                labels: ["Usuarios registrados", "Usuarios no registrados"],
                datasets: [
                  {
                    data: [reservasRegistradas, reservasNoRegistradas],
                    backgroundColor: [
                      "rgba(75, 192, 192, 0.8)",
                      "rgba(255, 159, 64, 0.8)",
                    ],
                  },
                ],
              }}
            />
          </Col>
          <Col xs={12} md={3} className="text-center cardAdmin">
            <h3>Ventas facturadas</h3>
            <p>Gráfica Servicios, Productos</p>
            <Bar
              data={{
                labels: ["Servicios", "Productos"],
                datasets: [
                  {
                    label: "Servicios",
                    data: [totalGenerado],
                    backgroundColor: "rgba(75, 192, 192, 0.8)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                  },
                  {
                    label: "Productos",
                    data: [calcularTotalVentasProductos()],
                    backgroundColor: "rgba(255, 159, 64, 0.8)",
                    borderColor: "rgba(255, 159, 64, 1)",
                    borderWidth: 1,
                  },
                ],
              }}
            />
          </Col>
          <Col xs={12} md={3} className="text-center cardAdmin">
            <h3>Factor de ocupación</h3>
            <p>De Lunes a domingo</p>
            <Line
              data={{
                labels: [
                  "Lunes",
                  "Martes",
                  "Miércoles",
                  "Jueves",
                  "Viernes",
                  "Sábado",
                  "Domingo",
                ],
                datasets: [
                  {
                    label: "Reservas",
                    data: reservasPorDia.slice(1).concat(reservasPorDia[0]), // Reordenar para empezar en Lunes
                    backgroundColor: "rgba(75, 192, 192, 0.8)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 2,
                  },
                ],
              }}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PanelAdmin;



// import React, { useState, useEffect } from "react";
// import { Container, Row, Col, Button, Modal } from "react-bootstrap";
// import { Calendar, momentLocalizer } from "react-big-calendar";
// import moment from "moment";
// import "moment/locale/es";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import "../../css/Empresa.css";
// import Config from "../Config";
// import { Bar, Doughnut } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import NavBar from "../components/Navbar.jsx";
// import AuthUser from "../pageauth/AuthUser";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend
// );

// moment.locale("es");
// const localizer = momentLocalizer(moment);

// const PanelAdmin = () => {
//   const { getUser } = AuthUser();
//   const [reservas, setReservas] = useState([]);
//   const [servicios, setServicios] = useState([]);
//   const [horarios, setHorarios] = useState([]);
//   const [productos, setProductos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [ventas, setVentas] = useState([]);
//   const [reservasRegistradas, setReservasRegistradas] = useState(0);
//   const [reservasNoRegistradas, setReservasNoRegistradas] = useState(0);
//   const [totalGenerado, setTotalGenerado] = useState(0);
//   const [filteredReservas, setFilteredReservas] = useState([]);
//   const [showEventModal, setShowEventModal] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [selectedOption, setSelectedOption] = useState("hoy");

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         await obtenerServicios();
//         await obtenerHorarios();
//         await obtenerReservas();
//         await obtenerProductos();
//         await fetchVentas();
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   useEffect(() => {
//     if (reservas.length > 0) {
//       filtrarPorOpcion(reservas);
//     }
//   }, [selectedOption, reservas]);

//   const obtenerServicios = async () => {
//     try {
//       const response = await Config.getServicesByEmpresa(getUser().id);
//       setServicios(response.data);
//     } catch (error) {
//       console.error("Error al obtener servicios:", error);
//     }
//   };

//   const obtenerHorarios = async () => {
//     try {
//       const response = await Config.getIntervalosEmpresa(getUser().id);
//       setHorarios(response.data.data);
//     } catch (error) {
//       console.error("Error al obtener horarios:", error);
//     }
//   };

//   const obtenerReservas = async () => {
//     try {
//       const userId = getUser().id;
//       const [response1, response2] = await Promise.all([
//         Config.getReservasEmpresa(userId),
//         Config.getReservasSinUsuarioEmpresa(userId),
//       ]);

//       const reservasRegistradasData = response1.data.data.filter(reserva => reserva.estado === 'reservado');
//       const reservasNoRegistradasData = response2.data.data.filter(reserva => reserva.estado === 'reservado');

//       const allReservas = [
//         ...reservasRegistradasData.map((r) => ({ ...r, isRegistered: true })),
//         ...reservasNoRegistradasData.map((r) => ({ ...r, isRegistered: false })),
//       ];

//       setReservas(allReservas);
//       setReservasRegistradas(reservasRegistradasData.length);
//       setReservasNoRegistradas(reservasNoRegistradasData.length);
//     } catch (error) {
//       console.error("Error al obtener reservas:", error);
//     }
//   };

//   const obtenerProductos = async () => {
//     try {
//       const response = await Config.getProductosEmpresa(getUser().id);
//       setProductos(response.data);
//     } catch (error) {
//       console.error("Error al obtener productos:", error);
//     }
//   };

//   const fetchVentas = async () => {
//     try {
//       const response = await Config.getVentasEmpresa(getUser().id);
//       setVentas(response.data.ventas);
//     } catch (error) {
//       console.error("Error al obtener las ventas:", error);
//     }
//   };

//   const calcularFechaFin = (fecha, hora, duracion) => {
//     const fechaInicio = new Date(fecha + "T" + hora);
//     const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
//     return fechaFin;
//   };

//   const filtrarPorOpcion = (reservas) => {
//     let startDate, endDate;

//     switch (selectedOption) {
//       case "hoy":
//         startDate = moment().startOf("day");
//         endDate = moment().endOf("day");
//         break;
//       case "semana":
//         startDate = moment().startOf("week");
//         endDate = moment().endOf("week");
//         break;
//       case "mes":
//         startDate = moment().startOf("month");
//         endDate = moment().endOf("month");
//         break;
//       default:
//         startDate = moment().startOf("day");
//         endDate = moment().endOf("day");
//         break;
//     }

//     const reservasFiltradas = reservas.filter(reserva =>
//       moment(reserva.fecha).isBetween(startDate, endDate, null, '[]')
//     );

//     setFilteredReservas(reservasFiltradas);

//     const total = reservasFiltradas.reduce((sum, reserva) => sum + (parseFloat(reserva.precio) || 0), 0);
//     setTotalGenerado(total);

//     const registeredCount = reservasFiltradas.filter(reserva => reserva.isRegistered).length;
//     const unregisteredCount = reservasFiltradas.filter(reserva => !reserva.isRegistered).length;

//     setReservasRegistradas(registeredCount);
//     setReservasNoRegistradas(unregisteredCount);
//   };

//   const eventos = filteredReservas.map((reserva) => ({
//     id: reserva.id,
//     title: `Reserva para ${reserva.cliente?.name || "Cliente no registrado"}`, 
//     start: new Date(reserva.fecha + "T" + reserva.hora),
//     end: calcularFechaFin(reserva.fecha, reserva.hora, reserva.duracion),
//   }));

//   const handleEventClick = (event) => {
//     setSelectedEvent(event);
//     setShowEventModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowEventModal(false);
//     setSelectedEvent(null);
//   };

//   if (loading) {
//     return <p>Cargando...</p>;
//   }

//   return (
//     <>
//       <NavBar />
//       <Container className="mt-3">
//       <Col xs={12} md={4} className="text-center">
//             <h2>Resumen</h2>
//           </Col>
//         <Row className="align-items-center">

//           <Col xs={12} md={4} className="text-center cardAdmin">
//           <h3>Selecciona un periodo:</h3>
//           <h4>${Number(totalGenerado).toFixed(2)}</h4>
//             <select
//               value={selectedOption}
//               onChange={(e) => setSelectedOption(e.target.value)}
//               className="form-select"
//             >
//               <option value="hoy">Hoy</option>
//               <option value="semana">Esta Semana</option>
//               <option value="mes">Este Mes</option>
//             </select>
//           </Col>
//           <Col xs={12} md={2} className="text-center cardAdmin ">
//           <h3>Total de Reservas</h3>
//           <h4>{filteredReservas.length}</h4>
//           </Col>
//           <Col xs={12} md={3} className="text-center cardAdmin">
//           <h3>Total Generado</h3>
//           <h4>${Number(totalGenerado).toFixed(2)}</h4>
//             <h4>${Number(totalGenerado).toFixed(2)}</h4>
//           </Col>
//         </Row>
//       </Container>
//       <Container className="mt-3">
//         <h2>Reservas Filtradas</h2>
//         <Calendar
//           localizer={localizer}
//           events={eventos}
//           startAccessor="start"
//           endAccessor="end"
//           style={{ height: 500 }}
//           defaultView="day"
//           views={["day", "week", "month"]}
//           selectable={true}
//           min={new Date(moment().startOf("day").hour(1))}
//           max={new Date(moment().startOf("day").hour(23))}
//           scrollToTime={new Date(moment().startOf("day").hour(8))}
//           onSelectEvent={handleEventClick}
//           culture="es"
//         />
//       </Container>

//       <Modal show={showEventModal} onHide={handleCloseModal}>
//         <Modal.Header closeButton>
//           <Modal.Title>Detalles de la Reserva</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedEvent && (
//             <>
//               <p><strong>Cliente:</strong> {selectedEvent.title}</p>
//               <p><strong>Fecha:</strong> {moment(selectedEvent.start).format('LL')}</p>
//               <p><strong>Hora de Inicio:</strong> {moment(selectedEvent.start).format('LT')}</p>
//               <p><strong>Hora de Fin:</strong> {moment(selectedEvent.end).format('LT')}</p>
//               <p><strong>Duración:</strong> {moment.duration(moment(selectedEvent.end).diff(moment(selectedEvent.start))).asMinutes()} minutos</p>
//             </>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Cerrar
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       <Container className="mt-5">
//         <Row>
//           <Col xs={12} md={3} className="text-center cardAdmin">
//             <h3>Fuentes de reservas</h3>
//             <Doughnut
//               data={{
//                 labels: ["Usuarios registrados", "Usuarios no registrados"],
//                 datasets: [
//                   {
//                     data: [reservasRegistradas, reservasNoRegistradas], // Updated to reflect filtered data
//                     backgroundColor: [
//                       "rgba(75, 192, 192, 0.8)", // Greenish color
//                       "rgba(255, 159, 64, 0.8)",  // Complementary color (orange)
//                     ],
//                   },
//                 ],
//               }}
//             />
//           </Col>
//           <Col xs={12} md={3} className="text-center cardAdmin">
//             <h3>Ventas facturadas</h3>
//             <p>Gráfica Servicios, Productos</p>
//             <Bar
//               data={{
//                 labels: ["Servicios", "Productos"],
//                 datasets: [
//                   {
//                     label: "Servicios",
//                     data: [totalVentasServicios],
//                     backgroundColor: "rgba(75, 192, 192, 0.8)", // Greenish color
//                     borderColor: "rgba(75, 192, 192, 1)", // Greenish color for border
//                     borderWidth: 1,
//                   },
//                   {
//                     label: "Productos",
//                     data: [totalVentasProductos],
//                     backgroundColor: "rgba(255, 159, 64, 0.8)",  // Complementary color (orange)
//                     borderColor: "rgba(255, 159, 64, 1)",  // Orange color for border
//                     borderWidth: 1,
//                   },
//                 ],
//               }}
//             />
//           </Col>
//           <Col xs={12} md={3} className="text-center cardAdmin">
//             <h3>Factor de ocupación</h3>
//             <p>De Lunes a domingo</p>
//             <Line
//               data={{
//                 labels: [
//                   "Lunes",
//                   "Martes",
//                   "Miércoles",
//                   "Jueves",
//                   "Viernes",
//                   "Sábado",
//                   "Domingo",
//                 ],
//                 datasets: [
//                   {
//                     label: "Reservas",
//                     data: reservasPorDia.slice(1).concat(reservasPorDia[0]), // Reordenar para empezar en Lunes
//                     backgroundColor: "rgba(75, 192, 192, 0.8)", // Greenish color
//                     borderColor: "rgba(75, 192, 192, 1)", // Greenish color for border
//                     borderWidth: 2,
//                   },
//                 ],
//               }}
//             />
//           </Col>
//         </Row>
//       </Container>
//     </>
//   );
// };

// export default PanelAdmin;


// // import React, { useState, useEffect } from "react";
// // import { Container, Row, Col, Button, Alert, Modal } from "react-bootstrap";
// // import { Calendar, momentLocalizer } from "react-big-calendar";
// // import AuthUser from "../pageauth/AuthUser";
// // import moment from "moment";
// // import DatePicker from "react-datepicker";
// // import "react-datepicker/dist/react-datepicker.css";
// // import "moment/locale/es";
// // import "react-big-calendar/lib/css/react-big-calendar.css";
// // import "../../css/Empresa.css";
// // import Config from "../Config";
// // import { useNavigate } from "react-router-dom";
// // import { Bar, Line, Doughnut } from "react-chartjs-2";
// // import {
// //   Chart as ChartJS,
// //   CategoryScale,
// //   LinearScale,
// //   BarElement,
// //   LineElement,
// //   PointElement,
// //   ArcElement,
// //   RadialLinearScale,
// //   Title,
// //   Tooltip,
// //   Legend,
// // } from "chart.js";
// // import axios from "axios";
// // import NavBar from "../components/Navbar.jsx";

// // ChartJS.register(
// //   CategoryScale,
// //   LinearScale,
// //   BarElement,
// //   LineElement,
// //   PointElement,
// //   ArcElement,
// //   RadialLinearScale,
// //   Title,
// //   Tooltip,
// //   Legend
// // );

// // moment.locale("es");
// // const localizer = momentLocalizer(moment);

// // const PanelAdmin = () => {
// //   const { getUser } = AuthUser();
// //   const [reservas, setReservas] = useState([]);
// //   const [servicios, setServicios] = useState([]);
// //   const [horarios, setHorarios] = useState([]);
// //   const [productos, setProductos] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [ventas, setVentas] = useState([]);
// //   const [reservasRegistradas, setReservasRegistradas] = useState(0);
// //   const [reservasNoRegistradas, setReservasNoRegistradas] = useState(0);
// //   const [totalGenerado, setTotalGenerado] = useState(0);
// //   const [filteredReservas, setFilteredReservas] = useState([]);
// //   const [showEventModal, setShowEventModal] = useState(false);
// //   const [selectedEvent, setSelectedEvent] = useState(null);
// //   const [dateRange, setDateRange] = useState([null, null]);
// //   const [startDate, endDate] = dateRange;

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         await obtenerServicios();
// //         await obtenerHorarios();
// //         await obtenerReservas();
// //         await obtenerProductos();
// //         await fetchVentas();
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchData();
// //   }, []);

// //   useEffect(() => {
// //     if (startDate && endDate) {
// //       filtrarPorFecha(reservas);
// //     }
// //   }, [startDate, endDate, reservas]);

// //   const obtenerServicios = async () => {
// //     try {
// //       const response = await Config.getServicesByEmpresa(getUser().id);
// //       setServicios(response.data);
// //     } catch (error) {
// //       console.error("Error al obtener servicios:", error);
// //     }
// //   };

// //   const obtenerHorarios = async () => {
// //     try {
// //       const response = await Config.getIntervalosEmpresa(getUser().id);
// //       setHorarios(response.data.data);
// //     } catch (error) {
// //       console.error("Error al obtener horarios:", error);
// //     }
// //   };

// //   const obtenerReservas = async () => {
// //     try {
// //       const userId = getUser().id;
// //       const [response1, response2] = await Promise.all([
// //         Config.getReservasEmpresa(userId),
// //         Config.getReservasSinUsuarioEmpresa(userId),
// //       ]);

// //       const reservasRegistradasData = response1.data.data.filter(reserva => reserva.estado === 'reservado');
// //       const reservasNoRegistradasData = response2.data.data.filter(reserva => reserva.estado === 'reservado');

// //       const allReservas = [
// //         ...reservasRegistradasData.map((r) => ({ ...r, isRegistered: true })),
// //         ...reservasNoRegistradasData.map((r) => ({ ...r, isRegistered: false })),
// //       ];

// //       setReservas(allReservas);
// //       setReservasRegistradas(reservasRegistradasData.length);
// //       setReservasNoRegistradas(reservasNoRegistradasData.length);
// //     } catch (error) {
// //       console.error("Error al obtener reservas:", error);
// //     }
// //   };

// //   const obtenerProductos = async () => {
// //     try {
// //       const response = await Config.getProductosEmpresa(getUser().id);
// //       setProductos(response.data);
// //     } catch (error) {
// //       console.error("Error al obtener productos:", error);
// //     }
// //   };

// //   const fetchVentas = async () => {
// //     try {
// //       const response = await axios.get(`${Config.url()}/empresa/${getUser().id}/ventas`);
// //       setVentas(response.data.ventas);
// //     } catch (error) {
// //       console.error("Error al obtener las ventas:", error);
// //     }
// //   };

// //   const calcularFechaFin = (fecha, hora, duracion) => {
// //     const fechaInicio = new Date(fecha + "T" + hora);
// //     const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
// //     return fechaFin;
// //   };

// //   const filtrarPorFecha = (reservas) => {
// //     const reservasFiltradas = reservas.filter(reserva =>
// //       moment(reserva.fecha).isBetween(startDate, endDate, null, '[]')
// //     );

// //     setFilteredReservas(reservasFiltradas);

// //     const total = reservasFiltradas.reduce((sum, reserva) => sum + (parseFloat(reserva.precio) || 0), 0);
// //     setTotalGenerado(total);

// //     const registeredCount = reservasFiltradas.filter(reserva => reserva.isRegistered).length;
// //     const unregisteredCount = reservasFiltradas.filter(reserva => !reserva.isRegistered).length;

// //     setReservasRegistradas(registeredCount);
// //     setReservasNoRegistradas(unregisteredCount);
// //   };

// //   const calcularTotalVentasProductos = () => {
// //     return ventas.reduce((total, venta) => total + (venta.cantidad * venta.precio), 0);
// //   };

// //   const eventos = filteredReservas.map((reserva) => ({
// //     id: reserva.id,
// //     title: `Reserva para ${reserva.cliente?.name || "Cliente no registrado"}`, 
// //     start: new Date(reserva.fecha + "T" + reserva.hora),
// //     end: calcularFechaFin(reserva.fecha, reserva.hora, reserva.duracion),
// //   }));

// //   const handleEventClick = (event) => {
// //     setSelectedEvent(event);
// //     setShowEventModal(true);
// //   };

// //   const handleCloseModal = () => {
// //     setShowEventModal(false);
// //     setSelectedEvent(null);
// //   };

// //   if (loading) {
// //     return <p>Cargando...</p>;
// //   }

// //   return (
// //     <>
// //       <NavBar />
// //       <Container className="mt-3">
// //         <h2>Resumen</h2>
// //       </Container>

// //       <Container className="mt-3">
// //         <Row>
// //         <Col xs={12} md={3} className="text-center">
// //         <Container className="mt-3 cardAdmin">
// //         <h3>Total de Reservas</h3>
// //         <DatePicker
// //           selectsRange={true}
// //           startDate={startDate}
// //           endDate={endDate}
// //           onChange={(update) => setDateRange(update)}
// //           isClearable={true}
// //           dateFormat="yyyy/MM/dd"
// //         />
// //       </Container>
// //           </Col>
// //           <Col xs={12} md={3} className="text-center cardAdmin">
// //             <h3>Total de Reservas</h3>
// //             <h4>{filteredReservas.length}</h4>
// //           </Col>
// //           <Col xs={12} md={3} className="text-center cardAdmin">
// //             <h3>Total Generado</h3>
// //             <h4>${Number(totalGenerado).toFixed(2)}</h4>
// //           </Col>
// //         </Row>
// //       </Container>

// //       <Container className="mt-3 containercss">
// //         <h2>Reservas Filtradas</h2>
// //         <Calendar
// //           localizer={localizer}
// //           events={eventos}
// //           startAccessor="start"
// //           endAccessor="end"
// //           style={{ height: 500 }}
// //           defaultView="day"
// //           views={["day", "week", "month"]}
// //           selectable={true}
// //           min={new Date(moment().startOf("day").hour(1))}
// //           max={new Date(moment().startOf("day").hour(23))}
// //           scrollToTime={new Date(moment().startOf("day").hour(8))}
// //           onSelectEvent={handleEventClick}
// //           culture="es"
// //         />
// //       </Container>

// //       <Modal show={showEventModal} onHide={handleCloseModal}>
// //         <Modal.Header closeButton>
// //           <Modal.Title>Detalles de la Reserva</Modal.Title>
// //         </Modal.Header>
// //         <Modal.Body>
// //           {selectedEvent && (
// //             <>
// //               <p><strong>Cliente:</strong> {selectedEvent.title}</p>
// //               <p><strong>Fecha:</strong> {moment(selectedEvent.start).format('LL')}</p>
// //               <p><strong>Hora de Inicio:</strong> {moment(selectedEvent.start).format('LT')}</p>
// //               <p><strong>Hora de Fin:</strong> {moment(selectedEvent.end).format('LT')}</p>
// //               <p><strong>Duración:</strong> {moment.duration(moment(selectedEvent.end).diff(moment(selectedEvent.start))).asMinutes()} minutos</p>
// //             </>
// //           )}
// //         </Modal.Body>
// //         <Modal.Footer>
// //           <Button variant="secondary" onClick={handleCloseModal}>
// //             Cerrar
// //           </Button>
// //         </Modal.Footer>
// //       </Modal>

// //       <Container className="mt-5">
// //         <Row>
// //           <Col xs={12} md={3} className="text-center cardAdmin">
// //             <h3>Fuentes de reservas</h3>
// //             <Doughnut
// //               data={{
// //                 labels: ["Usuarios registrados", "Usuarios no registrados"],
// //                 datasets: [
// //                   {
// //                     data: [reservasRegistradas, reservasNoRegistradas],
// //                     backgroundColor: [
// //                       "rgba(75, 192, 192, 0.8)",
// //                       "rgba(255, 159, 64, 0.8)",
// //                     ],
// //                   },
// //                 ],
// //               }}
// //             />
// //           </Col>
// //           <Col xs={12} md={3} className="text-center cardAdmin">
// //             <h3>Ventas facturadas</h3>
// //             <p>Gráfica Servicios, Productos</p>
// //             <Bar
// //               data={{
// //                 labels: ["Servicios", "Productos"],
// //                 datasets: [
// //                   {
// //                     label: "Servicios",
// //                     data: [totalGenerado],
// //                     backgroundColor: "rgba(75, 192, 192, 0.8)",
// //                     borderColor: "rgba(75, 192, 192, 1)",
// //                     borderWidth: 1,
// //                   },
// //                   {
// //                     label: "Productos",
// //                     data: [calcularTotalVentasProductos()],
// //                     backgroundColor: "rgba(255, 159, 64, 0.8)",
// //                     borderColor: "rgba(255, 159, 64, 1)",
// //                     borderWidth: 1,
// //                   },
// //                 ],
// //               }}
// //             />
// //           </Col>
// //         </Row>
// //       </Container>
// //     </>
// //   );
// // };

// // export default PanelAdmin;



// // import React, { useState, useEffect } from "react";
// // import { Container, Row, Col, Button, Alert, Modal } from "react-bootstrap";
// // import { Calendar, momentLocalizer } from "react-big-calendar";
// // import AuthUser from "../pageauth/AuthUser";
// // import moment from "moment";
// // import "moment/locale/es";
// // import "react-big-calendar/lib/css/react-big-calendar.css";
// // import "react-datepicker/dist/react-datepicker.css";
// // import "../../css/Empresa.css";
// // import Config from "../Config";
// // import { useNavigate } from "react-router-dom";
// // import { Bar, Line, Doughnut } from "react-chartjs-2";
// // import {
// //   Chart as ChartJS,
// //   CategoryScale,
// //   LinearScale,
// //   BarElement,
// //   LineElement,
// //   PointElement,
// //   ArcElement,
// //   RadialLinearScale,
// //   Title,
// //   Tooltip,
// //   Legend,
// // } from "chart.js";
// // import axios from "axios";
// // import NavBar from "../components/Navbar.jsx";

// // ChartJS.register(
// //   CategoryScale,
// //   LinearScale,
// //   BarElement,
// //   LineElement,
// //   PointElement,
// //   ArcElement,
// //   RadialLinearScale,
// //   Title,
// //   Tooltip,
// //   Legend
// // );

// // moment.locale("es");
// // const localizer = momentLocalizer(moment);

// // const PanelAdmin = () => {
// //   const { getUser } = AuthUser();
// //   const [reservas, setReservas] = useState([]);
// //   const [servicios, setServicios] = useState([]);
// //   const [horarios, setHorarios] = useState([]);
// //   const [productos, setProductos] = useState([]);
// //   const [loading, setLoading] = useState(true);  // Estado de carga
// //   const navigate = useNavigate();
// //   const [showEventModal, setShowEventModal] = useState(false);
// //   const [selectedEvent, setSelectedEvent] = useState(null);

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         await obtenerServicios();
// //         await obtenerHorarios();
// //         await obtenerReservas();
// //         await obtenerProductos();
// //       } finally {
// //         setLoading(false);  // Finaliza la carga
// //       }
// //     };
// //     fetchData();
// //   }, []);

// //   const obtenerServicios = async () => {
// //     try {
// //       const response = await Config.getServicesByEmpresa(getUser().id);
// //       setServicios(response.data);
// //     } catch (error) {
// //       console.error("Error al obtener servicios:", error);
// //     }
// //   };

// //   const [ventas, setVentas] = useState([]);
// //   const [reservasPorDia, setReservasPorDia] = useState(Array(7).fill(0)); // Inicializar con 7 ceros para cada día de la semana
// //   const [reservasRegistradas, setReservasRegistradas] = useState(0);
// //   const [reservasNoRegistradas, setReservasNoRegistradas] = useState(0);
// //   const [totalGenerado, setTotalGenerado] = useState(0); // Inicializar como 0
// //   const [selectedPeriodo, setSelectedPeriodo] = useState('dia'); // Estado para el periodo seleccionado
// //   const [filteredReservas, setFilteredReservas] = useState([]); // Reservas filtradas

// //   useEffect(() => {
// //     obtenerReservas();
// //     fetchVentas(); // Cargar ventas al montar el componente
// //   }, []);


// //   const obtenerHorarios = async () => {
// //     try {
// //       const response = await Config.getIntervalosEmpresa(getUser().id);
// //       setHorarios(response.data.data);
// //     } catch (error) {
// //       console.error("Error al obtener horarios:", error);
// //     }
// //   };

// //   const obtenerReservas = async () => {
// //     try {
// //   //Por si no anda es aca
// //       const response = await Config.getReservasEmpresa(getUser().id);
// //       setReservas(response.data.data);

// //       const userId = getUser().id;
// //       const [response1, response2] = await Promise.all([
// //         Config.getReservasEmpresa(userId),
// //         Config.getReservasSinUsuarioEmpresa(userId),
// //       ]);

// //       const reservasRegistradasData = response1.data.data.filter(reserva => reserva.estado === 'reservado');
// //       const reservasNoRegistradasData = response2.data.data.filter(reserva => reserva.estado === 'reservado');

// //       // Añadir una propiedad 'isRegistered' para diferenciar los tipos de reservas
// //       const allReservas = [
// //         ...reservasRegistradasData.map((r) => ({ ...r, isRegistered: true })),
// //         ...reservasNoRegistradasData.map((r) => ({ ...r, isRegistered: false })),
// //       ];

// //       console.log(allReservas);

// //       setReservas(allReservas);
// //       setReservasRegistradas(reservasRegistradasData.length);
// //       setReservasNoRegistradas(reservasNoRegistradasData.length);

// //       // Filtrar las reservas según el periodo seleccionado
// //       filtrarPorPeriodo(allReservas);

// //     } catch (error) {
// //       console.error("Error al obtener reservas:", error);
// //     }
// //   };


// //   const obtenerProductos = async () => {
// //     try {
// //       const response = await Config.getProductosEmpresa(getUser().id);
// //       setProductos(response.data);
// //     } catch (error) {
// //       console.error("Error al obtener reservas:", error);
// //     }
// //   };


// //   const fetchVentas = async () => {
// //     try {
// //       const response = await axios.get(`${Config.url()}/empresa/${getUser().id}/ventas`);
// //       setVentas(response.data.ventas);
// //     } catch (error) {
// //       console.error("Error al obtener las ventas:", error);
// //     }
// //   };

// //   const calcularEstadisticas = (reservas) => {
// //     // Calcular reservas por día de la semana
// //     const reservasPorDia = Array(7).fill(0); // Array para contar las reservas de cada día

// //     reservas.forEach((reserva) => {
// //       const diaSemana = moment(reserva.fecha).day(); // Obtener el día de la semana (0 = Domingo, 6 = Sábado)
// //       reservasPorDia[diaSemana] += 1; // Incrementar el contador para ese día
// //     });

// //     setReservasPorDia(reservasPorDia); // Actualizar el estado con las reservas por día
// //   };

// //   const calcularFechaFin = (fecha, hora, duracion) => {
// //     const fechaInicio = new Date(fecha + "T" + hora);
// //     const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
// //     return fechaFin;
// //   };


// //   const calcularTotalVentasProductos = () => {
// //     return ventas.reduce((total, venta) => total + (venta.cantidad * venta.precio), 0);
// //   };

// //   const calcularTotalReservas = () => {
// //     return filteredReservas.reduce((sum, reserva) => sum + (parseFloat(reserva.precio) || 0), 0);
// //   };

// //   const totalVentasServicios = calcularTotalReservas();
// //   const totalVentasProductos = calcularTotalVentasProductos();

// //   const handlePeriodoChange = (e) => {
// //     setSelectedPeriodo(e.target.value); // Actualizar el estado del periodo seleccionado
// //   };

// //   const filtrarPorPeriodo = (reservas) => {
// //     const now = moment();
// //     let inicioPeriodo;

// //     switch (selectedPeriodo) {
// //       case 'dia':
// //         inicioPeriodo = now.startOf('day');
// //         break;
// //       case 'semana':
// //         inicioPeriodo = now.startOf('week');
// //         break;
// //       case 'mes':
// //         inicioPeriodo = now.startOf('month');
// //         break;
// //       case 'año':
// //         inicioPeriodo = now.startOf('year');
// //         break;
// //       default:
// //         inicioPeriodo = now.startOf('day');
// //         break;
// //     }

// //     const reservasFiltradas = reservas.filter(reserva =>
// //       moment(reserva.fecha).isSameOrAfter(inicioPeriodo)
// //     );

// //     setFilteredReservas(reservasFiltradas);
// //     calcularEstadisticas(reservasFiltradas);
    
// //     const total = reservasFiltradas.reduce((sum, reserva) => sum + (parseFloat(reserva.precio) || 0), 0);
// //     setTotalGenerado(total);

// //     // Recalculate registered and unregistered reservations for the filtered period
// //     const registeredCount = reservasFiltradas.filter(reserva => reserva.isRegistered).length;
// //     const unregisteredCount = reservasFiltradas.filter(reserva => !reserva.isRegistered).length;

// //     setReservasRegistradas(registeredCount);
// //     setReservasNoRegistradas(unregisteredCount);
// //   };


// //   // const eventos = reservas.map((reserva) => ({
// //   const eventos = filteredReservas.map((reserva) => ({
// //     id: reserva.id,
// //     title: `Reserva para ${reserva.cliente?.name || "Cliente no registrado"}`, 
// //     start: new Date(reserva.fecha + "T" + reserva.hora),
// //     end: calcularFechaFin(reserva.fecha, reserva.hora, reserva.duracion),
    
// //   }));

// //  if (loading) {
// //     return <p>Cargando...</p>;  // Muestra un mensaje de carga mientras se obtienen los datos
// //   }


// //   const handleEventClick = (event) => {
// //     setSelectedEvent(event);
// //     setShowEventModal(true);
// //   };

// //   const handleCloseModal = () => {
// //     setShowEventModal(false);
// //     setSelectedEvent(null);
// //   };


// //   return (
// //     <>
// //       <NavBar />
// //       <Container className="mt-3">
    
// //         {!servicios.length && (
// //           <Alert variant="info" className="d-flex justify-content-between align-items-center">
// //             <span>Para que los clientes puedan realizar reservas, debes registrar tu primer servicio.</span>
// //             <Button variant="primary" size="sm" href="/servicios">
// //               Registrar Servicio
// //             </Button>
// //           </Alert>
// //         )}
// //         {!horarios.length && (
// //           <Alert variant="info" className="d-flex justify-content-between align-items-center">
// //             <span>Para que los clientes puedan realizar reservas, debes registrar tu primer horario.</span>
// //             <Button variant="primary" size="sm" href="/intervalos">
// //               Registrar Horario
// //             </Button>
// //           </Alert>
// //         )}

// //         {/* {servicios.length && horarios.length ? (
// //           <>
// //              <h2>Reservas de Hoy / Horario de hoy</h2>
// //             <Calendar
// //               localizer={localizer}
// //               events={eventos}
// //               startAccessor="start"
// //               endAccessor="end"
// //               style={{ height: 500 }}
// //               defaultView="day"
// //               views={["day"]}
// //               selectable={true}
// //               min={new Date(moment().startOf("day").hour(8))}
// //               max={new Date(moment().startOf("day").hour(20))}
// //               scrollToTime={new Date(moment().startOf("day").hour(8))}
// //             /> 
// //           </>
// //         ) : (
// //           <p className="text-center mt-4">
// //             Por favor, agrega un servicio y un horario para que las reservas puedan visualizarse.
// //           </p>
// //         )} */}

// //         {!productos.length && (
// //           <Alert variant="info" className="d-flex justify-content-between align-items-center mt-1">
// //             <span>Para que los clientes puedan comprar tus productos, debes registrar tu primer producto.</span>
// //             <Button variant="primary" size="sm" href="/productos">
// //               Registrar Producto
// //             </Button>
// //           </Alert>
// //         )}

// //     {/* isRegistered: reserva.isRegistered, */}
// //   {/* }) */}
// // {/* ------------------------------------------Lo bien abajo---------------------------------------------------- */}
// //         <h2>Resumen</h2>
// //       </Container>
// //       <Container className="mt-3 containercss">
// //         <h5>Periodo de tiempo:</h5>
// //         <select name="periodo" id="periodo" className="selectBuscar" onChange={handlePeriodoChange}>
// //           <option value="dia">Día</option>
// //           <option value="semana">Semana</option>
// //           <option value="mes">Mes</option>
// //           <option value="año">Año</option>
// //         </select>
// //         <Button className="btn btn-success" onClick={() => filtrarPorPeriodo(reservas)}>Buscar</Button>
// //       </Container>
// //       <Container className="mt-3">
// //         <Row>
// //           <Col xs={12} md={3} className="text-center cardAdmin">
// //             <h3>Total de Reservas</h3>
// //             <h4>{filteredReservas.length}</h4>
// //           </Col>
// //           <Col xs={12} md={3} className="text-center cardAdmin">
// //             <h3>Total Generado</h3>
// //             <h4>${Number(totalGenerado).toFixed(2)}</h4> {/* Convert to number and format */}
// //           </Col>
// //         </Row>
// //       </Container>

// //       <Container className="mt-3 containercss">
// //         <h2>Reservas Filtradas</h2>
// //         <Calendar
// //           localizer={localizer}
// //           events={eventos}
// //           startAccessor="start"
// //           endAccessor="end"
// //           style={{ height: 500 }}
// //           defaultView="day" // Mostrar solo la vista diaria
// //           views={["day", "week", "month"]} // Permitir vistas diarias, semanales y mensuales
// //           selectable={true}
// //           min={new Date(moment().startOf("day").hour(1))} // Hora de inicio del día, ajustada a las 8:00 AM
// //           max={new Date(moment().startOf("day").hour(23))} // Hora de fin del día, ajustada a las 6:00 PM
// //           scrollToTime={new Date(moment().startOf("day").hour(8))} // Desplazar al inicio del día, a las 8:00 AM
// //           onSelectEvent={handleEventClick}
// //           culture="es"
// //         />
// //       </Container>

// //       <Modal show={showEventModal} onHide={handleCloseModal}>
// //         <Modal.Header closeButton>
// //           <Modal.Title>Detalles de la Reserva</Modal.Title>
// //         </Modal.Header>
// //         <Modal.Body>
// //           {selectedEvent && (
// //             <>
// //               <p><strong>Cliente:</strong> {selectedEvent.title}</p>
// //               <p><strong>Fecha:</strong> {moment(selectedEvent.start).format('LL')}</p>
// //               <p><strong>Hora de Inicio:</strong> {moment(selectedEvent.start).format('LT')}</p>
// //               <p><strong>Hora de Fin:</strong> {moment(selectedEvent.end).format('LT')}</p>
// //               <p><strong>Duración:</strong> {moment.duration(moment(selectedEvent.end).diff(moment(selectedEvent.start))).asMinutes()} minutos</p>
// //               {/* Agrega más información relevante del evento */}
// //             </>
// //           )}
// //         </Modal.Body>
// //         <Modal.Footer>
// //           <Button variant="secondary" onClick={handleCloseModal}>
// //             Cerrar
// //           </Button>
// //         </Modal.Footer>
// //       </Modal>

// //       <Container className="mt-5">
// //         <Row>
// //           <Col xs={12} md={3} className="text-center cardAdmin">
// //             <h3>Fuentes de reservas</h3>
// //             <Doughnut
// //               data={{
// //                 labels: ["Usuarios registrados", "Usuarios no registrados"],
// //                 datasets: [
// //                   {
// //                     data: [reservasRegistradas, reservasNoRegistradas], // Updated to reflect filtered data
// //                     backgroundColor: [
// //                       "rgba(75, 192, 192, 0.8)", // Greenish color
// //                       "rgba(255, 159, 64, 0.8)",  // Complementary color (orange)
// //                     ],
// //                   },
// //                 ],
// //               }}
// //             />
// //           </Col>
// //           <Col xs={12} md={3} className="text-center cardAdmin">
// //             <h3>Ventas facturadas</h3>
// //             <p>Gráfica Servicios, Productos</p>
// //             <Bar
// //               data={{
// //                 labels: ["Servicios", "Productos"],
// //                 datasets: [
// //                   {
// //                     label: "Servicios",
// //                     data: [totalVentasServicios],
// //                     backgroundColor: "rgba(75, 192, 192, 0.8)", // Greenish color
// //                     borderColor: "rgba(75, 192, 192, 1)", // Greenish color for border
// //                     borderWidth: 1,
// //                   },
// //                   {
// //                     label: "Productos",
// //                     data: [totalVentasProductos],
// //                     backgroundColor: "rgba(255, 159, 64, 0.8)",  // Complementary color (orange)
// //                     borderColor: "rgba(255, 159, 64, 1)",  // Orange color for border
// //                     borderWidth: 1,
// //                   },
// //                 ],
// //               }}
// //             />
// //           </Col>
// //           <Col xs={12} md={3} className="text-center cardAdmin">
// //             <h3>Factor de ocupación</h3>
// //             <p>De Lunes a domingo</p>
// //             <Line
// //               data={{
// //                 labels: [
// //                   "Lunes",
// //                   "Martes",
// //                   "Miércoles",
// //                   "Jueves",
// //                   "Viernes",
// //                   "Sábado",
// //                   "Domingo",
// //                 ],
// //                 datasets: [
// //                   {
// //                     label: "Reservas",
// //                     data: reservasPorDia.slice(1).concat(reservasPorDia[0]), // Reordenar para empezar en Lunes
// //                     backgroundColor: "rgba(75, 192, 192, 0.8)", // Greenish color
// //                     borderColor: "rgba(75, 192, 192, 1)", // Greenish color for border
// //                     borderWidth: 2,
// //                   },
// //                 ],
// //               }}
// //             />
// //           </Col>
// //         </Row>
// //       </Container>
// //     </>
// //   );

// // }
 
// // export default PanelAdmin;


