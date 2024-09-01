import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Image } from "react-bootstrap";
import { BsFillPersonLinesFill } from "react-icons/bs";
import Config from "../Config";
import "../../css/Home.css";
import { useNavigate } from "react-router-dom";
import Mapa from "../components/Mapa";



function App() {
  const [empresa, setEmpresa] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerEmpresa();
  }, []);

  const obtenerEmpresa = async () => {
    try {
      const response = await Config.getEmpresaId(1); // Asegúrate de que este método exista en tu archivo Config
      setEmpresa(response.data);
    } catch (error) {
      console.error("Error al cargar Empresa:", error);
    }
  };

  const hacerReserva = () => {
        // Aquí puedes redirigir a la página de reservas
        navigate(`/reservas/empresa/${empresa.id}`);
        console.log("empresa.id}" + empresa.id);
        }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="text-center mb-4">
            <BsFillPersonLinesFill size={48} />
            <h1>Datos de la Empresa</h1>
          </div>
          <div className="bg-light p-4 rounded shadow-sm">
            {empresa ? (
              <>
                <Row className="align-items-center">
                  <Col xs={12} md={4} className="text-center">
                    <Image
                      src={empresa.perfilUrl || "https://via.placeholder.com/150"}
                      alt="Perfil de Empresa"
                      className="img-fluid rounded-circle mb-3"
                    />
                  </Col>
                  <Col xs={12} md={8}>
                    <p>
                      <strong>Nombre:</strong> {empresa.name}
                    </p>
                    <p>
                      <strong>Dirección:</strong> {empresa.address}
                    </p>
                    <p>
                      <strong>Teléfono:</strong> {empresa.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {empresa.email}
                    </p>
                    <div className="text-center mt-4">
                      <Button
                        variant="primary"
                        onClick={hacerReserva} 
                      >
                        Reservar
                      </Button>
                    </div>
                  </Col>
                </Row>
                <hr />
                <h5>Servicios</h5>
                <ul>
                  {empresa.servicios && empresa.servicios.length > 0 ? (
                    empresa.servicios.map((servicio) => (
                      <li key={servicio.id}>
                        <strong>{servicio.name}</strong>: {servicio.description}
                      </li>
                    ))
                  ) : (
                    <li>No hay servicios disponibles.</li>
                  )}
                </ul>
                <hr />
                <h5>Horarios</h5>
                <ul>
                  {empresa.horarios && empresa.horarios.length > 0 ? (
                    empresa.horarios.map((horario) => (
                      <li key={horario.id}>
                        <strong>{horario.dia}</strong>: {horario.hora_inicio} - {horario.hora_fin}
                      </li>
                    ))
                  ) : (
                    <li>No hay horarios disponibles.</li>
                  )}
                </ul>
                <hr />
                <div className="mt-4">
                  <h5>Ubicación:</h5>
                  <div style={{ width: "100%", height: "400px" }}>
                    {/* <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(empresa.address)}`}
                      allowFullScreen
                    ></iframe> */}
                    {/* //Foto de ejemplo de como va a estar */}
                        <img
                          src="https://via.placeholder.com/600x400"
                          alt="Ubicación de la empresa"
                          className="img-fluid"
                        />
                  </div>
                </div>
              </>
            ) : (
              <p>Cargando datos de la empresa...</p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;


//-------------------- Info para intervalo de horario ---------------------

//   const fetchHorarios = async () => {
//     try {
//       const response = await axios.get(
//         `http://localhost:8000/api/v1/intervalos/empresa/${getUser().id}`
//       );

//       // Verifica que la respuesta tenga el campo 'data' que esperas
//       if (
//         response.data &&
//         Array.isArray(response.data.data) &&
//         response.data.data.length > 0
//       ) {
//         const horarios = response.data.data;

//         const horariosHoy = horarios.filter((horario) =>
//           horario.dias_semanas.includes(moment().format("dddd").toLowerCase())
//         );

//         if (horariosHoy.length > 0) {
//           let horaInicio = moment(horariosHoy[0].hora_inicio, "HH:mm");
//           let horaFin = moment(horariosHoy[0].hora_fin, "HH:mm");

//           horariosHoy.forEach((horario) => {
//             const inicio = moment(horario.hora_inicio, "HH:mm");
//             const fin = moment(horario.hora_fin, "HH:mm");

//             if (inicio.isBefore(horaInicio)) {
//               horaInicio = inicio;
//             }
//             if (fin.isAfter(horaFin)) {
//               horaFin = fin;
//             }
//           });

//           setHorarioInicio(horaInicio);
//           setHorarioFin(horaFin);
//         } else {
//           console.error("No se encontraron horarios para el día actual.");
//         }
//       } else {
//         console.error(
//           "La respuesta de la API no contiene un array válido de horarios:",
//           response.data
//         );
//       }
//     } catch (error) {
//       console.error("Error al obtener horarios:", error);
//     }
//   };

//   min={
//     new Date(
//       moment()
//         .startOf("day")
//         .set({
//           hour: horarioInicio.hour(),
//           minute: horarioInicio.minute(),
//         })
//     )
//   }
//   max={
//     new Date(
//       moment()
//         .startOf("day")
//         .set({ hour: horarioFin.hour(), minute: horarioFin.minute() })
//     )
//   }
//   scrollToTime={
//     new Date(
//       moment()
//         .startOf("day")
//         .set({
//           hour: horarioInicio.hour(),
//           minute: horarioInicio.minute(),
//         })
//     )
//   }
