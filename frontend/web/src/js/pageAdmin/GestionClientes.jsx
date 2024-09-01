import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Alert, Button, Image, Card } from "react-bootstrap";
import Config from "../Config";
import AuthUser from "../pageauth/AuthUser";
import NavBar from "../components/Navbar.jsx";

function GestionClientes() {
  const { getUser } = AuthUser();
  const user = getUser();
  const [clientes, setClientes] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.role === "empresa") {
      obtenerClientes();
    }
  }, []);

  const obtenerClientes = async () => {
    try {
      const response = await Config.getClientesByEmpresa(user.id);
      console.log(response.data.data)
      setClientes(response.data.data || []);
    } catch (error) {
      setError("Error al cargar los clientes.");
      console.error("Error al cargar los clientes:", error);
    }
  };

  const obtenerReservas = async (clienteId) => {
    try {
      const response = await Config.getReservasPorEmpresaYCliente(user.id, clienteId);
      setReservas(response.data.data || []);
    } catch (error) {
      setError("Error al cargar las reservas.");
      console.error("Error al cargar las reservas:", error);
    }
  };

  const obtenerCompras = async (clienteId) => {
    try {
      // const response = await axios.get(`${Config.url()}/empresa/${getUser().id}/ventas`);
      const response = await Config.getComprasPorClienteYEmpresa(4, 4);
      setCompras(response.data.ventas || []);
      console.log(response.data.ventas);
    } catch (error) {
      setError("Error al cargar las compras.");
      console.error("Error al cargar las compras:", error);
    }
  };

  const handleVerReservas = (cliente) => {
    setSelectedCliente(cliente);
    console.log(cliente)
    obtenerReservas(cliente.id);
    obtenerCompras(cliente.id);
  };

  const handleVolver = () => {
    setSelectedCliente(null);
    setReservas([]);
    setCompras([]);
  };

  return (
    <>
      <NavBar />
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={10}>
            {!selectedCliente ? (
              <>
                <h1 className="text-center mb-4">Gestión de Clientes</h1>
                {Array.isArray(clientes) && clientes.length > 0 ? (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th></th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Reservas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientes.map((cliente, index) => (
                        <tr key={cliente.id}>
                          <td>{index + 1}</td>
                          <td>{cliente.name}</td>
                          <td>{cliente.email}</td>
                          <td>{cliente.cellphone}</td>
                          <td>
                            <Button
                              variant="primary"
                              onClick={() => handleVerReservas(cliente)}
                            >
                              Ver Todo
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p>No hay clientes que hayan realizado reservas.</p>
                )}
              </>
            ) : (
              <>
                <h1 className="text-center mb-4">
                  Reservas y Compras de {selectedCliente.name}
                </h1>
                <Row className="justify-content-center mb-4">
                  <Col md={8}>
                    <Card className="p-4 shadow">
                      <Row className="align-items-center">
                        <Col md={4} className="text-center">
                          {selectedCliente.profile_picture ? (
                            <Image
                              src={`${Config.urlFoto()}${selectedCliente.profile_picture}`}
                              roundedCircle
                              width="150"
                              height="150"
                              alt="Foto de perfil"
                            />
                          ) : (
                            <Image
                              src="https://via.placeholder.com/150"
                              roundedCircle
                              width="150"
                              height="150"
                              alt="Foto de perfil"
                            />
                          )}
                        </Col>
                        <Col md={8}>
                          <h4 className="mb-2">Nombre: {selectedCliente.name}</h4>
                          <h5 className="mb-2">Email: {selectedCliente.email}</h5>
                          <h5 className="mb-2">Teléfono: {selectedCliente.cellphone || "No disponible"}</h5>
                          <h5 className="mb-2">Puntos de fidelización: {
    reservas.filter(reserva => reserva.estado === 'reservado').length
}</h5>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>

                {Array.isArray(reservas) && reservas.length > 0 ? (
                  <Card className="mb-4 shadow">
                    <Card.Header as="h4" className="text-center">Reservas</Card.Header>
                    <Card.Body>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th></th>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Precio</th>
                            <th>Servicios</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservas.map((reserva, index) => (
                            <tr key={reserva.id}>
                              <td>{index + 1}</td>
                              <td>{reserva.fecha}</td>
                              <td>{reserva.hora}</td>
                              <td>{reserva.precio}</td>
                              <td>
                                <ul>
                                  {reserva.servicios.map((servicio) => (
                                    <li key={servicio.id}>
                                      {servicio.nombre}
                                    </li>
                                  ))}
                                </ul>
                              </td>
                              <td>{reserva.estado}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                ) : (
                  <Card className="mb-4 shadow">
                    <Card.Body>
                      <p className="text-center">No hay reservas para este cliente.</p>
                    </Card.Body>
                  </Card>
                )}

                {Array.isArray(compras) && compras.length > 0 ? (
  <Card className="mb-4 shadow">
    <Card.Header as="h4" className="text-center">Compras</Card.Header>
    <Card.Body>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th></th>
            <th>Total</th>
            <th>Fecha</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
        {compras.map((venta, index) => (
                <React.Fragment key={venta.id}>
                  <tr>
                  <td>{index + 1}</td>
                    <td>${venta.total}</td>
                    <td>{new Date(venta.created_at).toLocaleDateString()}</td>
                    <td>
                      <ul>
                        {venta.productos.map((producto) => (
                          <li key={producto.id}>
                            {producto.nombre} - Cantidad: {producto.pivot.cantidad} - Precio: ${producto.pivot.precio}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
        </tbody>
      </Table>
    </Card.Body>
  </Card>
) : (
  <Card className="mb-4 shadow">
    <Card.Body>
      <p className="text-center">No hay compras para este cliente.</p>
    </Card.Body>
  </Card>
)}

                {/* {Array.isArray(compras) && compras.length > 0 ? (
                  <Card className="mb-4 shadow">
                    <Card.Header as="h4" className="text-center">Compras</Card.Header>
                    <Card.Body>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                          </tr>
                        </thead>
                        <tbody>
                          {compras.map((compra, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>
                                {compra.productos.map((producto, idx) => (
                                  <div key={idx}>
                                    <strong>{producto.nombre}</strong> - {producto.descripcion}
                                  </div>
                                ))}
                              </td>
                              <td>{compra.productos.map((producto) => producto.pivot.cantidad).join(", ")}</td>
                              <td>{compra.productos.map((producto) => producto.pivot.precio).join(", ")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                ) : (
                  <Card className="mb-4 shadow">
                    <Card.Body>
                      <p className="text-center">No hay compras para este cliente.</p>
                    </Card.Body>
                  </Card>
                )} */}

                <div className="d-flex justify-content-center mb-3">
                  <Button variant="danger" onClick={handleVolver}>
                    Volver
                  </Button>
                </div>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default GestionClientes;



// import React, { useState, useEffect } from "react";
// import { Container, Row, Col, Table, Alert, Button, Image, Card } from "react-bootstrap";
// import Config from "../Config";
// import AuthUser from "../pageauth/AuthUser";
// import NavBar from "../components/Navbar.jsx";


// function GestionClientes() {
//   const { getUser } = AuthUser();
//   const user = getUser();
//   const [clientes, setClientes] = useState([]);
//   const [reservas, setReservas] = useState([]);
//   const [compras, setCompras] = useState([]);
//   const [selectedCliente, setSelectedCliente] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (user && user.role === "empresa") {
//       obtenerClientes();
//     }
//   }, []);

//   const obtenerClientes = async () => {
//     try {
//       const response = await Config.getClientesByEmpresa(user.id);
//       setClientes(response.data.data || []);
//     } catch (error) {
//       setError("Error al cargar los clientes.");
//       console.error("Error al cargar los clientes:", error);
//     }
//   };

//   const obtenerReservas = async (clienteId) => {
//     try {
//       const response = await Config.getReservasPorEmpresaYCliente(user.id, clienteId);
//       setReservas(response.data.data || []);

//       console.log(response.data.data)
//     } catch (error) {
//       setError("Error al cargar las reservas.");
//       console.error("Error al cargar las reservas:", error);
//     }
//   };

//   const handleVerReservas = (cliente) => {
//     setSelectedCliente(cliente);
//     obtenerReservas(cliente.id);
//     obtenerProductos(cliente.id);
//   };

//   const obtenerProductos = async (clienteId) => {
//     try {
//       const response = await Config.getProductosByCliente(clienteId, user.id);
//       setCompras(response.data.data || []);

//       console.log(response.data.data)
//     } catch (error) {
//       setError("Error al cargar las compras.");
//       console.error("Error al cargar las compras:", error);
//     }
//   };

//   const handleVolver = () => {
//     setSelectedCliente(null);
//     setReservas([]);
//     setCompras([]);
//   };

//   return (
//     <>
//       <NavBar />
//       <Container className="mt-5">
//         <Row className="justify-content-center">
//           <Col md={10}>
//             {!selectedCliente ? (
//               <>
//                 <h1 className="text-center mb-4">Gestión de Clientes</h1>
//                 {Array.isArray(clientes) && clientes.length > 0 ? (
//                   <Table striped bordered hover>
//                     <thead>
//                       <tr>
//                         <th>#</th>
//                         <th>Nombre</th>
//                         <th>Email</th>
//                         <th>Teléfono</th>
//                         <th>Reservas</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {clientes.map((cliente, index) => (
//                         <tr key={cliente.id}>
//                           <td>{index + 1}</td>
//                           <td>{cliente.name}</td>
//                           <td>{cliente.email}</td>
//                           <td>{cliente.cellphone}</td>
//                           <td>
//                             <Button
//                               variant="primary"
//                               onClick={() => handleVerReservas(cliente)}
//                             >
//                               Ver Todo
//                             </Button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </Table>
//                 ) : (
//                   <p>No hay clientes que hayan realizado reservas.</p>
//                 )}
//               </>
//             ) : (
//               <>
//                 <h1 className="text-center mb-4">
//                   Reservas y Compras de {selectedCliente.name}
//                 </h1>
//                 <Row className="justify-content-center mb-4">
//   <Col md={8}>
//     <Card className="p-4 shadow">
//       <Row className="align-items-center ">
//         <Col md={4} className="text-center">
//           {selectedCliente.profile_picture ? (
//             <Image
//               src={`${Config.urlFoto()}${selectedCliente.profile_picture}`}
//               roundedCircle
//               width="150"
//               height="150"
//               alt="Foto de perfil"
//             />
//           ) : (
//             <Image
//               src="https://via.placeholder.com/150"
//               roundedCircle
//               width="150"
//               height="150"
//               alt="Foto de perfil"
//             />
//           )}
//         </Col>
//         <Col md={8}>
//           <h4 className="mb-2">Nombre: {selectedCliente.name}</h4>
//           <h5 className="mb-2">Email: {selectedCliente.email}</h5>
//           <h5 className="mb-2">Teléfono: {selectedCliente.cellphone || "No disponible"}</h5>
//           <h5 className="mb-2">Puntos de fidelización: {reservas.length}</h5>
//         </Col>
//       </Row>
//     </Card>
//   </Col>
// </Row>





// {Array.isArray(reservas) && reservas.length > 0 ? (
//   <Card className="mb-4 shadow">
//     <Card.Header as="h4" className="text-center">Reservas</Card.Header>
//     <Card.Body>
//       <Table striped bordered hover>
//         <thead>
//           <tr>
//             <th></th>
//             <th>Fecha</th>
//             <th>Hora</th>
//             <th>Precio</th>
//             <th>Servicios</th>
//             <th>Estado</th>
//           </tr>
//         </thead>
//         <tbody>
//           {reservas.map((reserva, index) => (
//             <tr key={reserva.id}>
//               <td>{index + 1}</td>
//               <td>{reserva.fecha}</td>
//               <td>{reserva.hora}</td>
//               <td>{reserva.precio}</td>
//               {/* <td>{reserva.servicios}</td> */}

//               <td>
//                       <ul>
//                         {reserva.servicios.map((servicio) => (
//                           <li>
//                             {servicio.nombre}
//                             </li>
//                         ))}
                        
//                       </ul>
//                       </td>
//               <td>{reserva.estado}</td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//     </Card.Body>
//   </Card>
// ) : (
//   <Card className="mb-4 shadow">
//     <Card.Body>
//       <p className="text-center">No hay reservas para este cliente.</p>
//     </Card.Body>
//   </Card>
// )}

// {Array.isArray(compras) && compras.length > 0 ? (
//   <Card className="mb-4 shadow">
//     <Card.Header as="h4" className="text-center">Compras</Card.Header>
//     <Card.Body>
//       <Table striped bordered hover>
//         <thead>
//           <tr>
//             <th></th>
//             <th>Producto</th>
//             <th>Cantidad</th>
//             <th>Precio</th>
//           </tr>
//         </thead>
//         <tbody>
//           {compras.map((compra, index) => (
//             <tr key={compra.id}>
//               <td>{index + 1}</td>
//               <td>{compra.nombre}</td>
//               <td>{compra.cantidad}</td>
//               <td>{compra.precio}</td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>
//     </Card.Body>
//   </Card>
// ) : (
//   <Card className="mb-4 shadow">
//     <Card.Body>
//       <p className="text-center">No hay compras para este cliente.</p>
//     </Card.Body>
//   </Card>
// )}

// <div className="d-flex justify-content-center mb-3">
//   <Button variant="danger" onClick={handleVolver} >
//     Volver
//   </Button>
// </div>







//               </>
//             )}
//           </Col>
//         </Row>
//       </Container>
//     </>
//   );
// }

// export default GestionClientes;


// // import React, { useState, useEffect } from "react";
// // import { Container, Row, Col, Table, Alert, Button } from "react-bootstrap";
// // import Config from "../Config";
// // import AuthUser from "../pageauth/AuthUser";
// // import NavBar from "../components/Navbar.jsx";

// // function GestionClientes() {
// //   const { getUser } = AuthUser();
// //   const user = getUser();
// //   const [clientes, setClientes] = useState([]);
// //   const [reservas, setReservas] = useState([]);
// //   const [compras, setCompras] = useState([]);
// //   const [selectedCliente, setSelectedCliente] = useState(null);
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     if (user && user.role === "empresa") {
// //       obtenerClientes();
// //     }
// //   }, []);

// //   const obtenerClientes = async () => {
// //     try {
// //       const response = await Config.getClientesByEmpresa(user.id);
// //       setClientes(response.data.data || []);
// //       // console.log(clientes)
// //     } catch (error) {
// //       setError("Error al cargar los clientes.");
// //       console.error("Error al cargar los clientes:", error);
// //     }
// //   };

// //   const obtenerReservas = async (clienteId) => {
// //     try {
// //       console.log("id cliente selec: " + clienteId);
// //       console.log("id empresa : " + user.id);
// //       const response = await Config.getReservasPorEmpresaYCliente(user.id, clienteId);
// //       console.log("Reservas recibidas:", response.data);
// //       setReservas(response.data.data || []);
// //     } catch (error) {
// //       setError("Error al cargar las reservas.");
// //       console.error("Error al cargar las reservas:", error);
// //     }
// //   };

// //   const handleVerReservas = (cliente) => {
// //     setSelectedCliente(cliente);
// //     obtenerReservas(cliente.id);
// //     obtenerProductos(cliente.id);
// //   };

// //   const obtenerProductos = async (clienteId) => {
// //     try {
// //       // console.log("id cliente selec: " + clienteId);
// //       // console.log("id empresa : " + user.id);
// //       const response = await Config.getProductosByCliente(clienteId, user.id);
// //       console.log("Reservas recibidas:", response.data.data);
// //       setCompras(response.data.data || []);
// //     } catch (error) {
// //       setError("Error al cargar las reservas.");
// //       console.error("Error al cargar las reservas:", error);
// //     }
// //   };


// //   const handleVolver = () => {
// //     setSelectedCliente(null);
// //     setReservas([]);
// //     setCompras([]);
// //   };

// //   return (
// //     <>
// //       <NavBar />
// //       <Container className="mt-5">
// //         <Row className="justify-content-center">
// //           <Col md={10}>
// //             {!selectedCliente ? (
// //               <>
// //                 <h1 className="text-center mb-4">Gestión de Clientes</h1>
// //                 {/* {error && (
// //                   <Alert variant="danger" onClose={() => setError(null)} dismissible>
// //                     {error}
// //                   </Alert>
// //                 )} */}
// //                 {Array.isArray(clientes) && clientes.length > 0 ? (
// //                   <Table striped bordered hover>
// //                     <thead>
// //                       <tr>
// //                         <th>#</th>
// //                         <th>Nombre</th>
// //                         <th>Email</th>
// //                         <th>Teléfono</th>
// //                         {/* <th>Fecha de última Reserva</th> */}
// //                         {/* <th>Servicio Reservado</th> */}
// //                         <th>Reservas</th>
// //                       </tr>
// //                     </thead>
// //                     <tbody>
// //                       {clientes.map((cliente, index) => (
// //                         <tr key={cliente.id}>
// //                           <td>{index + 1}</td>
// //                           <td>{cliente.name}</td>
// //                           <td>{cliente.email}</td>
// //                           <td>{cliente.cellphone}</td>
// //                           {/* <td>{cliente.fecha}</td> */}
// //                           {/* <td>{cliente.servicio_nombre}</td> */}
// //                           <td>
// //                             <Button
// //                               variant="primary"
// //                               onClick={() => handleVerReservas(cliente)}
// //                             >
// //                               Ver Todo
// //                             </Button>
// //                           </td>
                          
// //                         </tr>
// //                       ))}
// //                     </tbody>
// //                   </Table>
// //                 ) : (
// //                   <p>No hay clientes que hayan realizado reservas.</p>
// //                 )}
// //               </>
// //             ) : (
// //               <>
// //                 <h1 className="text-center mb-4">
// //                   Reservas y Compras de {selectedCliente.name}
// //                 </h1>
// //                 {/* {error && (
// //                   <Alert variant="danger" onClose={() => setError(null)} dismissible>
// //                     {error}
// //                   </Alert>
// //                 )} */}
// //                 {Array.isArray(reservas) && reservas.length > 0 ? (
// //                   <Table striped bordered hover>
// //                     <thead>
// //                       <tr>
// //                         <th>#</th>
// //                         <th>Fecha</th>
// //                         <th>Servicio</th>
// //                         <th>Estado</th>
// //                       </tr>
// //                     </thead>
// //                     <tbody>
// //                       {reservas.map((reserva, index) => (
// //                         <tr key={reserva.id}>
// //                           <td>{index + 1}</td>
// //                           <td>{reserva.fecha}</td>
// //                           <td>{reserva.servicios}</td>
// //                           <td>{reserva.estado}</td>
// //                         </tr>
// //                       ))}
// //                     </tbody>
// //                   </Table>
// //                 ) : (
// //                   <p>No hay reservas para este cliente.</p>
// //                 )}
                
// //                 {Array.isArray(compras) && compras.length > 0 ? (
// //                 <Table striped bordered hover>
// //                   <thead>
// //                     <tr>
// //                       <th>#</th>
// //                       <th>Id Producto</th>
// //                       <th>Cantidad</th>
// //                       <th>Precio</th>
// //                     </tr>
// //                   </thead>
// //                   <tbody>
// //                     {compras.map((compra, index) => (
// //                       <tr key={compra.id}>
// //                         <td>{index + 1}</td>
// //                         <td>{compra.producto_id}</td>
// //                         <td>{compra.cantidad}</td>
// //                         <td>{compra.precio}</td>
// //                       </tr>
// //                     ))}
// //                   </tbody>
// //                 </Table>
// //                    ) : (
// //                     <p>No hay Compras para este cliente.</p>
// //                   )}
// //                 <Button variant="danger" onClick={handleVolver}>
// //                   Volver
// //                 </Button>
// //               </>
// //             )}
// //           </Col>
// //         </Row>
// //       </Container>
// //     </>
// //   );
// // }

// // export default GestionClientes;
