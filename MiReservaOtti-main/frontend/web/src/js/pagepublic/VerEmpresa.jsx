import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Image } from "react-bootstrap";
import { BsFillPersonLinesFill } from "react-icons/bs";
import Config from "../Config";
import "../../css/Home.css";
import { useNavigate } from "react-router-dom";

function App() {
  const [empresa, setEmpresa] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [intervalos, setIntervalos] = useState([]);
  const navigate = useNavigate();

  const url = new URL(window.location.href);
  const id = url.pathname.split("/").pop();
  const empresaId = id;

  useEffect(() => {
    obtenerEmpresa();
  }, []);

  const obtenerEmpresa = async () => {
    try {

      const response = await Config.getEmpresaUrl(empresaId);

      setEmpresa(response.data.data);

      const response2 = await Config.getServicesByEmpresa(response.data.data.id);
      setServicios(response2.data);

      const response3 = await Config.getIntervalosEmpresa(response.data.data.id);
      console.log(response3.data);
      setIntervalos(response3.data.data);
    } catch (error) {
      console.error("Error al cargar los datos:", error);
    }
  };

  const hacerReserva = () => {
    navigate(`/reserva/${empresa.id}`);
  };

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
                      <strong>Teléfono:</strong> {empresa.cellphone}
                    </p>
                    <p>
                      <strong>Email:</strong> {empresa.email}
                    </p>
                    <div className="text-center mt-4">
                      <Button variant="primary" onClick={hacerReserva}>
                        Reservar
                      </Button>
                      <Button variant="secondary" className="ml-2" onClick={() => navigate("/")}>
                        Volver
                      </Button>
                    </div>
                  </Col>
                </Row>
                <hr />
                <h5>Servicios</h5>
                <ul>
                  {servicios.length > 0 ? (
                    servicios.map((servicio) => (
                      <li key={servicio.id}>
                        <strong>{servicio.nombre}</strong>: {servicio.description} - ${servicio.precio} - Duración: {servicio.duracion} minutos
                      </li>
                    ))
                  ) : (
                    <li>No hay servicios disponibles.</li>
                  )}
                </ul>
                <hr />
                <h5>Horarios</h5>
                <ul>
                  {intervalos.length > 0 ? (
                    intervalos.map((intervalo) => {
                      const diasSemanaArray = JSON.parse(intervalo.dias_semanas);
                      return (
                        <li key={intervalo.id}>
                          <strong>{diasSemanaArray.join(', ')}</strong>: {intervalo.hora_inicio.slice(0, 5)} - {intervalo.hora_fin.slice(0, 5)}
                        </li>
                      );
                    })
                  ) : (
                    <li>No hay horarios disponibles.</li>
                  )}
                </ul>
                <hr />
                <div className="mt-4">
                  <h5>Ubicación:</h5>
                  <div style={{ width: "100%", height: "400px" }}>
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





// import React, { useState, useEffect } from "react";
// import { Container, Row, Col, Button, Image } from "react-bootstrap";
// import { BsFillPersonLinesFill } from "react-icons/bs";
// import Config from "../Config";
// import "../../css/Home.css";
// import { useNavigate } from "react-router-dom";

// function App() {
//   const [empresa, setEmpresa] = useState(null);
//   const [servicios, setServicios] = useState([]);
//   const [intervalos, setIntervalos] = useState([]);
//   const navigate = useNavigate();

//   const url = new URL(window.location.href);
//   const id = url.pathname.split("/").pop();
//   const empresaId = id;

//   useEffect(() => {
//     obtenerEmpresa();
//   }, []);

//   const obtenerEmpresa = async () => {
//     try {
//       const response = await Config.getEmpresaUrl(empresaId);
//       setEmpresa(response.data.data);

//       const response2 = await Config.getServicesByEmpresa(response.data.data.id);
//       setServicios(response2.data);

//       const response3 = await Config.getIntervalosEmpresa(response.data.data.id);
//       console.log(response3.data);
//       setIntervalos(response3.data.data);
//     } catch (error) {
//       console.error("Error al cargar los datos:", error);
//     }
//   };

//   const hacerReserva = () => {
//     navigate(`/reserva/${empresa.id}`);
//   };

//   return (
//     <Container className="mt-5">
//       <Row className="justify-content-center">
//         <Col md={8}>
//           <div className="text-center mb-4">
//             <BsFillPersonLinesFill size={48} />
//             <h1>Datos de la Empresa</h1>
//           </div>
//           <div className="bg-light p-4 rounded shadow-sm">
//             {empresa ? (
//               <>
//                 <Row className="align-items-center">
//                   <Col xs={12} md={4} className="text-center">
//                     <Image
//                       src={empresa.perfilUrl || "https://via.placeholder.com/150"}
//                       alt="Perfil de Empresa"
//                       className="img-fluid rounded-circle mb-3"
//                     />
//                   </Col>
//                   <Col xs={12} md={8}>
//                     <p>
//                       <strong>Nombre:</strong> {empresa.name}
//                     </p>
//                     <p>
//                       <strong>Dirección:</strong> {empresa.address}
//                     </p>
//                     <p>
//                       <strong>Teléfono:</strong> {empresa.cellphone}
//                     </p>
//                     <p>
//                       <strong>Email:</strong> {empresa.email}
//                     </p>
//                     <div className="text-center mt-4">
//                       <Button variant="primary" onClick={hacerReserva}>
//                         Reservar
//                       </Button>
//                       <Button variant="secondary" className="ml-2" onClick={() => navigate("/")}>
//                         Volver
//                       </Button>
//                     </div>
//                   </Col>
//                 </Row>
//                 <hr />
//                 <h5>Servicios</h5>
//                 <ul>
//                   {servicios.length > 0 ? (
//                     servicios.map((servicio) => (
//                       <li key={servicio.id}>
//                         <strong>{servicio.nombre}</strong>: {servicio.description} - ${servicio.precio} - Duración: {servicio.duracion} minutos
//                       </li>
//                     ))
//                   ) : (
//                     <li>No hay servicios disponibles.</li>
//                   )}
//                 </ul>
//                 <hr />
//                 <h5>Horarios</h5>
//                 <ul>
//                   {intervalos.length > 0 ? (
//                     intervalos.map((intervalo) => (
//                       <li key={intervalo.id}>
//                         <strong>{Array.isArray(intervalo.dias_semanas) ? intervalo.dias_semanas.join(', ') : ''}</strong>: {intervalo.dias_semanas} {intervalo.hora_inicio.slice(0, 5)} - {intervalo.hora_fin.slice(0, 5)}
//                       </li>
//                     ))
//                   ) : (
//                     <li>No hay horarios disponibles.</li>
//                   )}
//                 </ul>
//                 <hr />
//                 <div className="mt-4">
//                   <h5>Ubicación:</h5>
//                   <div style={{ width: "100%", height: "400px" }}>
//                     <img
//                       src="https://via.placeholder.com/600x400"
//                       alt="Ubicación de la empresa"
//                       className="img-fluid"
//                     />
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <p>Cargando datos de la empresa...</p>
//             )}
//           </div>
//         </Col>
//       </Row>
//     </Container>
//   );
// }

// export default App;



// // import React, { useState, useEffect } from "react";
// // import { Container, Row, Col, Button, Image } from "react-bootstrap";
// // import { BsFillPersonLinesFill } from "react-icons/bs";
// // import Config from "../Config";
// // import "../../css/Home.css";
// // import { useNavigate } from "react-router-dom";

// // function App() {
// //   const [empresa, setEmpresa] = useState(null);
// //   const [servicios, setServicios] = useState([]);
// //   const [intervalos, setIntervalos] = useState([]);
// //   const navigate = useNavigate();

// //   // Crear un objeto URL
// //   const url = new URL(window.location.href);
// //   // Obtener el último segmento de la ruta, que en este caso es la ID
// //   const id = url.pathname.split("/").pop();
// //   const empresaId = id; // ID de la empresa, ajusta según tu lógica para obtener este ID
// //   // console.log("Estoy en la Empresa ID:" +id); // Esto imprimirá "1"
// //   useEffect(() => {
// //     obtenerEmpresa();
// //     // obtenerServicios();
// //   }, []);

// //   const obtenerEmpresa = async () => {
// //     try {
// //       const response = await Config.getEmpresaUrl(empresaId); 
// //       setEmpresa(response.data.data);
// //       console.log(response.data.data.id);
// //       try {
// //         const response2 = await Config.getServicesByEmpresa(response.data.data.id);
// //         setServicios(response2.data);

// //         const response3 = await Config.getIntervalsByEmpresa(response.data.data.id);
// //       setIntervalos(response3.data);
// //       } catch (error) {
// //         console.error("Error al cargar servicios:", error);
// //       }
// //     } catch (error) {
// //       console.error("Error al cargar Empresa:", error);
// //     }
// //   };

// //   // const obtenerServicios = async () => {
// //   //   try {
// //   //     const response = await Config.getServicesByEmpresa(empresaId);
// //   //     setServicios(response.data);
// //   //   } catch (error) {
// //   //     console.error("Error al cargar servicios:", error);
// //   //   }
// //   // };

// //   console.log(servicios);

// //   const hacerReserva = () => {
// //     // Aquí puedes redirigir a la página de reservas
// //     navigate(`/reserva/${empresa.id}`);
// //     console.log("empresa.id}" + empresa.id);
// //   };

// //   return (
// //     <Container className="mt-5">
// //       <Row className="justify-content-center">
// //         <Col md={8}>
// //           <div className="text-center mb-4">
// //             <BsFillPersonLinesFill size={48} />
// //             <h1>Datos de la Empresa</h1>
// //           </div>
// //           <div className="bg-light p-4 rounded shadow-sm">
// //             {empresa ? (
// //               <>
// //                 <Row className="align-items-center">
// //                   <Col xs={12} md={4} className="text-center">
// //                     <Image
// //                       src={
// //                         empresa.perfilUrl || "https://via.placeholder.com/150"
// //                       }
// //                       alt="Perfil de Empresa"
// //                       className="img-fluid rounded-circle mb-3"
// //                     />
// //                   </Col>
// //                   <Col xs={12} md={8}>
// //                     <p>
// //                       <strong>Nombre:</strong> {empresa.name}
// //                     </p>
// //                     <p>
// //                       <strong>Dirección:</strong> {empresa.address}
// //                     </p>
// //                     <p>
// //                       <strong>Teléfono:</strong> {empresa.cellphone}
// //                     </p>
// //                     <p>
// //                       <strong>Email:</strong> {empresa.email}
// //                     </p>
// //                     <div className="text-center mt-4">
// //                       <Button variant="primary" onClick={hacerReserva}>
// //                         Reservar
// //                       </Button>
// //                       <Button
// //                         variant="secondary"
// //                         className="ml-2"
// //                         onClick={() => navigate("/")}
// //                       >
// //                         Volver
// //                       </Button>
// //                     </div>
// //                   </Col>
// //                 </Row>
// //                 <hr />
// //                 <h5>Servicios</h5>
// //                 <ul>
// //                   {servicios && servicios.length > 0 ? (
// //                     servicios.map((servicio) => (
// //                       <li key={servicio.id}>
// //                         <strong>{servicio.nombre}</strong>:{" "}
// //                         {servicio.description} - ${servicio.precio} - Duración:{" "}
// //                         {servicio.duracion} minutos
// //                       </li>
// //                     ))
// //                   ) : (
// //                     <li>No hay servicios disponibles.</li>
// //                   )}
// //                 </ul>
// //                 <hr />
// //                 <h5>Horarios</h5>
// //                 <ul>
// //                   {empresa.horarios && empresa.horarios.length > 0 ? (
// //                     empresa.horarios.map((horario) => (
// //                       <li key={horario.id}>
// //                         <strong>{horario.dia}</strong>: {horario.hora_inicio} -{" "}
// //                         {horario.hora_fin}
// //                       </li>
// //                     ))
// //                   ) : (
// //                     <li>No hay horarios disponibles.</li>
// //                   )}
// //                 </ul>
// //                 <hr />
// //                 <div className="mt-4">
// //                   <h5>Ubicación:</h5>
// //                   <div style={{ width: "100%", height: "400px" }}>
// //                     {/* <iframe
// //                       width="100%"
// //                       height="100%"
// //                       frameBorder="0"
// //                       style={{ border: 0 }}
// //                       src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(empresa.address)}`}
// //                       allowFullScreen
// //                     ></iframe> */}
// //                     {/* //Foto de ejemplo de como va a estar */}
// //                     <img
// //                       src="https://via.placeholder.com/600x400"
// //                       alt="Ubicación de la empresa"
// //                       className="img-fluid"
// //                     />
// //                   </div>
// //                 </div>
// //               </>
// //             ) : (
// //               <p>Cargando datos de la empresa...</p>
// //             )}
// //           </div>
// //         </Col>
// //       </Row>
// //     </Container>
// //   );
// // }

// // export default App;
