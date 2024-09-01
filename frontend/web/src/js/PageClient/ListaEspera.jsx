import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import Config from "../Config";
import AuthUser from "../pageauth/AuthUser";
import NavBar from "../components/Navbar.jsx";
import { useNavigate } from "react-router-dom";

const ListaEspera = () => {
  const { getUser, getRol } = AuthUser(); // Obtener los datos del usuario logueado
  const user = getUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fecha_rango: [new Date(), new Date()],
    hora_inicio: "",
    hora_fin: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const url = new URL(window.location.href);
  const agendaId = url.pathname.split("/").pop(); // Obtener el ID de la agenda desde la URL

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFormData({
      ...formData,
      fecha_rango: [start, end],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(user.id)
    console.log(agendaId)
    console.log(formData.fecha_rango[0].toISOString().split('T')[0])
    console.log(formData.fecha_rango[1].toISOString().split('T')[0])
    console.log(formData.hora_inicio)
    console.log(formData.hora_fin)

    const data = {
      cliente_id: user.id, // Asumiendo que `user.id` es el ID del cliente
      agenda_id: agendaId,
      fecha_inicio: formData.fecha_rango[0].toISOString().split('T')[0],
      fecha_fin: formData.fecha_rango[1].toISOString().split('T')[0],
      hora_inicio: formData.hora_inicio,
      hora_fin: formData.hora_fin,
    };

    try {
      const response = await axios.post(`${Config.url()}/lista-espera`, data);
      setSuccessMessage(response.data.message);
      setErrorMessage("");
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || "Error al inscribirse en la lista de espera.");
        setErrors(error.response.data.errors || {});
      } else {
        setErrorMessage("Error de conexión.");
      }
      setSuccessMessage("");
    }
  };

  return (
    <>
      <NavBar />
      <Container className="mt-5 containercss" style={{ maxWidth: "600px" }}>
        <h2 className="text-center mb-4">Únete a la Lista de Espera</h2>
        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}
        {errorMessage && (
          <div className="alert alert-danger">{errorMessage}</div>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Label className="d-flex justify-content-center">
            Selecciona un rango de fechas
          </Form.Label>
          <Form.Group
            controlId="fecha_rango"
            className="d-flex justify-content-center mb-2"
          >
            <DatePicker
              selected={formData.fecha_rango[0]}
              onChange={handleDateChange}
              minDate={new Date()}
              startDate={formData.fecha_rango[0]}
              endDate={formData.fecha_rango[1]}
              selectsRange
              inline
              dateFormat="yyyy/MM/dd"
            />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group controlId="hora_inicio">
                <Form.Label>Hora Inicio</Form.Label>
                <Form.Control
                  type="time"
                  name="hora_inicio"
                  value={formData.hora_inicio}
                  onChange={handleInputChange}
                />
                {errors.hora_inicio && (
                  <div className="text-danger">{errors.hora_inicio}</div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="hora_fin">
                <Form.Label>Hora Fin</Form.Label>
                <Form.Control
                  type="time"
                  name="hora_fin"
                  value={formData.hora_fin}
                  onChange={handleInputChange}
                />
                {errors.hora_fin && (
                  <div className="text-danger">{errors.hora_fin}</div>
                )}
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-between mt-4">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Atrás
            </Button>
            <Button variant="primary" type="submit">
              Unirse
            </Button>
          </div>
        </Form>
      </Container>
    </>
  );
};

export default ListaEspera;



// import React, { useState } from "react";
// import { Container, Row, Col, Form, Button } from "react-bootstrap";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import axios from "axios";
// import Config from "../Config";
// import AuthUser from "../pageauth/AuthUser";
// import NavBar from "../components/Navbar.jsx";
// import { useNavigate } from "react-router-dom";

// const ListaEspera = () => {
//   const { getUser, getRol } = AuthUser(); // Obtener los datos del usuario logueado
//   const user = getUser();
//   const rol = getRol();
//   console.log(rol);
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     fecha_rango: [new Date(), new Date()],
//     hora_inicio: "",
//     hora_fin: "",
//   });

//   const [errors, setErrors] = useState({});
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   const url = new URL(window.location.href);
//   const id = url.pathname.split("/").pop();

//   // console.log(id)

//   // const { getUser, getRol } = AuthUser();
//   // const user = getUser();
//   // console.log(user)

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   const handleDateChange = (dates) => {
//     const [start, end] = dates;
//     setFormData({
//       ...formData,
//       fecha_rango: [start, end],
//     });
//   };

//   const verificarDisponibilidad = async (
//     fecha,
//     agenda_id,
//     duracion_servicios
//   ) => {
//     try {
//       const response = await axios.post(
//         `${Config.url()}/intervalos/empresa/horasdisponibles`,
//         {
//           agenda_id,
//           fecha,
//           duracion_servicios,
//           intervalo_reserva: 30,
//         }
//       );

//       return response.data.horas_disponibles;
//     } catch (error) {
//       console.error("Error al verificar disponibilidad:", error);
//       return [];
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validar datos
//     if (!formData.hora_inicio || !formData.hora_fin) {
//       setErrors({
//         ...errors,
//         hora_inicio: !formData.hora_inicio
//           ? "La hora de inicio es obligatoria"
//           : "",
//         hora_fin: !formData.hora_fin ? "La hora de fin es obligatoria" : "",
//       });
//       return;
//     }

//     const agenda_id = 5; // Reemplaza con el ID de la agenda correspondiente
//     const duracion_servicios = 30; // Puedes ajustar esto según sea necesario

//     const start = formData.fecha_rango[0];
//     const end = new Date(formData.fecha_rango[1]);

//     // console.log(formData.fecha_rango[1]);
//     // console.log(end);
//     // end.setMinutes(end.getMinutes() - 1);
//     // console.log(end);
//     let fecha = new Date(start);

//     while (fecha <= end) {
//       const fechaStr = fecha.toISOString().split("T")[0];

//       const horasDisponibles = await verificarDisponibilidad(
//         fechaStr,
//         agenda_id,
//         duracion_servicios
//       );

//       console.log(horasDisponibles);

//       const [hours, minutes] = formData.hora_fin.split(":");
//       let date = new Date();
//       date.setHours(parseInt(hours));
//       date.setMinutes(parseInt(minutes) - 1);

//       const horaFinModificada = date.toTimeString().slice(0, 5);

//       const horaInicioDisponible = horasDisponibles.some(
//         (hora) => hora >= formData.hora_inicio && hora <= horaFinModificada
//       );

//       console.log(horaFinModificada);

//       // if (horaInicioDisponible) {
//       //     setErrorMessage(`Hay disponibilidad en la fecha ${fechaStr}. No puedes inscribirte en la lista de espera.`);
//       //     return;
//       // }

//       fecha.setDate(fecha.getDate() + 1);
//     }

//     // Si no hay disponibilidad en ninguno de los días seleccionados, se permite la inscripción
//     try {
//       console.log(user.id);
//       console.log(id);
//       console.log(formData.fecha_rango[0].toISOString().split("T")[0]);
//       console.log(formData.fecha_rango[1].toISOString().split("T")[0]);
//       console.log(formData.hora_inicio);
//       console.log(formData.hora_fin);
//       // console.log()

//       const response = await axios.post(`${Config.url()}/lista-espera`, {
//         cliente_id: user.id,
//         agenda_id: id,
//         fecha_inicio: formData.fecha_rango[0].toISOString().split("T")[0],
//         fecha_fin: formData.fecha_rango[1].toISOString().split("T")[0],
//         hora_inicio: formData.hora_inicio,
//         hora_fin: formData.hora_fin,
//       });

//       console.log(response);
//       setSuccessMessage("Te has inscrito en la lista de espera con éxito.");
//       setErrorMessage("");
//       setErrors("");
//     } catch (error) {
//       setSuccessMessage("");
//       setErrorMessage(
//         "Hubo un problema al inscribirse en la lista de espera. Inténtalo nuevamente."
//       );
//     }
//   };

//   return (
//     <>
//       <NavBar />
//       <Container className="mt-5 containercss" style={{ maxWidth: "600px" }}>
//         <h2 className="text-center mb-4">Únete a la Lista de Espera</h2>
//         {successMessage && (
//           <div className="alert alert-success">{successMessage}</div>
//         )}
//         {errorMessage && (
//           <div className="alert alert-danger">{errorMessage}</div>
//         )}
//         <Form onSubmit={handleSubmit}>
//           {/* <Form.Group controlId="fecha_rango"> */}
//           <Form.Label className="d-flex justify-content-center">
//             Selecciona un rango de fechas
//           </Form.Label>
//           <Form.Group
//             controlId="fecha_rango"
//             className="d-flex justify-content-center mb-2"
//           >
//             <DatePicker
//               selected={formData.fecha_rango[0]}
//               onChange={handleDateChange}
//               minDate={new Date()}
//               startDate={formData.fecha_rango[0]}
//               endDate={formData.fecha_rango[1]}
//               selectsRange
//               inline
//               dateFormat="yyyy/MM/dd"
//             />
//           </Form.Group>
//           <Row>
//             <Col md={6}>
//               <Form.Group controlId="hora_inicio">
//                 <Form.Label>Hora Inicio</Form.Label>
//                 <Form.Control
//                   type="time"
//                   name="hora_inicio"
//                   value={formData.hora_inicio}
//                   onChange={handleInputChange}
//                   // required
//                 />
//                 {errors.hora_inicio && (
//                   <div className="text-danger">{errors.hora_inicio}</div>
//                 )}
//               </Form.Group>
//             </Col>
//             <Col md={6}>
//               <Form.Group controlId="hora_fin">
//                 <Form.Label>Hora Fin</Form.Label>
//                 <Form.Control
//                   type="time"
//                   name="hora_fin"
//                   value={formData.hora_fin}
//                   onChange={handleInputChange}
//                   // required
//                 />
//                 {errors.hora_fin && (
//                   <div className="text-danger">{errors.hora_fin}</div>
//                 )}
//               </Form.Group>
//             </Col>
//           </Row>
//           <div className="d-flex justify-content-between mt-4">
//             <Button variant="secondary" onClick={() => navigate(-1)}>
//               Atrás
//             </Button>
//             <Button variant="primary" type="submit">
//               Unirse
//             </Button>
//           </div>
//         </Form>
//       </Container>
//     </>
//   );
// };

// export default ListaEspera;
