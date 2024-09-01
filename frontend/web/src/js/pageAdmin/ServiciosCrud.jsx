import React, { useState, useEffect } from "react";
import {
  Form,
  InputGroup,
  Container,
  Row,
  Col,
  Button,
  ListGroup,
  Alert,
  Badge,
  Modal,
} from "react-bootstrap";
import Config from "../Config";
import AuthUser from "../pageauth/AuthUser";
import NavBar from "../components/Navbar.jsx";
import { FaTrash, FaEdit } from "react-icons/fa";

const ServicioCrud = () => {
  const { getUser } = AuthUser();
  const [servicios, setServicios] = useState([]);
  const [nuevoServicio, setNuevoServicio] = useState({
    empresa_id: getUser().id,
    nombre: "",
    descripcion: "",
    duracion: "",
    estado: "activo",
    precio: "",
  });
  const [servicioEditado, setServicioEditado] = useState({
    empresa_id: getUser().id,
    nombre: "",
    descripcion: "",
    duracion: "",
    estado: "activo",
    precio: "",
  });
  const [editingService, setEditingService] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorsNuevoServicio, setErrorsNuevoServicio] = useState({});
  const [errorsEditServicio, setErrorsEditServicio] = useState({});

  useEffect(() => {
    obtenerServicios();
  }, []);

  const obtenerServicios = async () => {
    try {
      const response = await Config.getServicesByEmpresa(getUser().id);
      setServicios(response.data);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNuevoServicio((prevServicio) => ({
      ...prevServicio,
      [name]: value,
    }));
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setServicioEditado((prevServicio) => ({
      ...prevServicio,
      [name]: value,
    }));
  };

  const validateForm = (servicio) => {
    const newErrors = {};
    if (!servicio.nombre) newErrors.nombre = "El nombre es requerido";
    if (!servicio.duracion || servicio.duracion <= 0)
      newErrors.duracion = "La duración debe ser mayor a 0";
    if (!servicio.precio || servicio.precio <= 0)
      newErrors.precio = "El precio debe ser mayor a 0";
    return newErrors;
  };

  const agregarServicio = async () => {
    // const newErrors = validateForm(nuevoServicio);
    // if (Object.keys(newErrors).length > 0) {
    //   setErrorsNuevoServicio(newErrors);
    //   return;
    // }

    try {
      await Config.createService(nuevoServicio);
      obtenerServicios();
      clearForm();
    } catch (error) {
      if (error.response) {
        setErrorsNuevoServicio(error.response.data.errors || {});
      }
      console.error("Error al agregar servicio:", error);
    }
  };

  const startEditing = (servicio) => {
    setEditingService(servicio.id);
    setServicioEditado({
      empresa_id: servicio.empresa_id,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || "",
      duracion: servicio.duracion,
      estado: servicio.estado,
      precio: servicio.precio,
    });
    setShowEditModal(true);
  };

  const actualizarServicio = async () => {
    // const newErrors = validateForm(servicioEditado);
    // if (Object.keys(newErrors).length > 0) {
    //   setErrorsEditServicio(newErrors);
    //   return;
    // }

    try {
      await Config.updateService(editingService, servicioEditado);
      obtenerServicios();
      clearEditForm();
      setShowEditModal(false);
    } catch (error) {
      if (error.response) {
        setErrorsEditServicio(error.response.data.errors || {});
      }
      console.error("Error al actualizar servicio:", error);
    }
  };

  const desactivarServicio = async (id) => {
    try {
      await Config.desactivarService(id);
      setServicios(
        servicios.map((servicio) =>
          servicio.id === id ? { ...servicio, estado: "desactivado" } : servicio
        )
      );
    } catch (error) {
      console.error("Error al desactivar el servicio:", error);
    }
  };

  const activarServicio = async (id) => {
    try {
      await Config.activarServicio(id);
      setServicios(
        servicios.map((servicio) =>
          servicio.id === id ? { ...servicio, estado: "activo" } : servicio
        )
      );
    } catch (error) {
      console.error("Error al activar el servicio:", error);
    }
  };

  const eliminarServicio = async (id) => {
    try {
      await Config.deleteService(id);
      setServicios(servicios.filter((servicio) => servicio.id !== id));
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
    }
  };

  const clearForm = () => {
    setNuevoServicio({
      empresa_id: getUser().id,
      nombre: "",
      descripcion: "",
      duracion: "",
      estado: "activo",
      precio: "",
    });
    setErrorsNuevoServicio({});
  };

  const clearEditForm = () => {
    setServicioEditado({
      empresa_id: getUser().id,
      nombre: "",
      descripcion: "",
      duracion: "",
      estado: "activo",
      precio: "",
    });
    setErrorsEditServicio({});
  };

  const handleCloseEditModal = () => {
    clearEditForm();
    setEditingService(null);
    setShowEditModal(false);
  };

  return (
    <>
      <NavBar />
      <Container>
        <h1 className="text-center my-3">Servicios</h1>
        <Row>
          <Col lg={6} className="mb-4">
            <h2>Agregar Servicio</h2>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                agregarServicio();
              }}
            >
              <Form.Group controlId="formNombre" className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={nuevoServicio.nombre}
                  onChange={handleInputChange}
                  isInvalid={!!errorsNuevoServicio.nombre}
                />
                <Form.Control.Feedback type="invalid">
                  {errorsNuevoServicio.nombre}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formDescripcion" className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={nuevoServicio.descripcion}
                  onChange={handleInputChange}
                  isInvalid={!!errorsNuevoServicio.descripcion}
                />
                <Form.Control.Feedback type="invalid">
                  {errorsNuevoServicio.descripcion}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formDuracion" className="mb-3">
                <Form.Label>Duración (minutos) *</Form.Label>
                <Form.Control
                  type="number"
                  name="duracion"
                  value={nuevoServicio.duracion}
                  onChange={handleInputChange}
                  isInvalid={!!errorsNuevoServicio.duracion}
                />
                <Form.Control.Feedback type="invalid">
                  {errorsNuevoServicio.duracion}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formPrecio" className="mb-3">
                <Form.Label>Precio *</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="precio"
                    value={nuevoServicio.precio}
                    onChange={handleInputChange}
                    isInvalid={!!errorsNuevoServicio.precio}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errorsNuevoServicio.precio}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              <div className="d-flex justify-content-between">
                <Button type="submit" className="btn btn-primary">
                  Agregar Servicio
                </Button>
                <Button
                  type="button"
                  className="btn btn-secondary"
                  onClick={clearForm}
                >
                  Limpiar
                </Button>
              </div>
            </Form>
          </Col>
          <Col lg={6} className="mb-4">
            <h2>Lista de Servicios</h2>
            {servicios.length === 0 ? (
              <Alert variant="info">No hay servicios disponibles.</Alert>
            ) : (
              <ListGroup>
                {servicios.map((servicio) => (
                  <ListGroup.Item
                    key={servicio.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h5>{servicio.nombre}</h5>
                      <p>Descripcion: {servicio.descripcion}</p>
                      <p>Duración: {servicio.duracion} minutos</p>
                      <p>Precio: ${servicio.precio}</p>
                      <Badge
                        bg={
                          servicio.estado === "activo"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {servicio.estado}
                      </Badge>
                    </div>
                    <div className="d-flex align-items-center">
                      <Button
                        variant={
                          servicio.estado === "activo" ? "danger" : "success"
                        }
                        onClick={() =>
                          servicio.estado === "activo"
                            ? desactivarServicio(servicio.id)
                            : activarServicio(servicio.id)
                        }
                        className="me-2"
                      >
                        {servicio.estado === "activo"
                          ? "Desactivar"
                          : "Activar"}
                      </Button>
                      <Button
                        variant="warning"
                        onClick={() => startEditing(servicio)}
                        className="me-2"
                      >
                        {/* <FaEdit /> */} Editar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => eliminarServicio(servicio.id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Col>
        </Row>

        {/* Modal para Editar Servicio */}
        <Modal show={showEditModal} onHide={handleCloseEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Servicio</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                actualizarServicio(editingService);
              }}
            >
              <Form.Group controlId="formEditNombre" className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={servicioEditado.nombre}
                  onChange={handleEditInputChange}
                  isInvalid={!!errorsEditServicio.nombre}
                />
                <Form.Control.Feedback type="invalid">
                  {errorsEditServicio.nombre}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formEditDescripcion" className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={servicioEditado.descripcion}
                  onChange={handleEditInputChange}
                  isInvalid={!!errorsEditServicio.descripcion}
                />
                <Form.Control.Feedback type="invalid">
                  {errorsEditServicio.descripcion}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formEditDuracion" className="mb-3">
                <Form.Label>Duración (minutos)</Form.Label>
                <Form.Control
                  type="number"
                  name="duracion"
                  value={servicioEditado.duracion}
                  onChange={handleEditInputChange}
                  isInvalid={!!errorsEditServicio.duracion}
                />
                <Form.Control.Feedback type="invalid">
                  {errorsEditServicio.duracion}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formEditPrecio" className="mb-3">
                <Form.Label>Precio</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="precio"
                    value={servicioEditado.precio}
                    onChange={handleEditInputChange}
                    isInvalid={!!errorsEditServicio.precio}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errorsEditServicio.precio}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button type="submit" className="btn btn-primary">
                  Actualizar Servicio
                </Button>
                <Button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={handleCloseEditModal}
                >
                  Cancelar
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
};

export default ServicioCrud;


// import React, { useState, useEffect } from "react";
// import {
//   Form,
//   InputGroup,
//   Container,
//   Row,
//   Col,
//   Button,
//   ListGroup,
//   Alert,
//   Badge,
//   Modal,
// } from "react-bootstrap";
// import Config from "../Config";
// import AuthUser from "../pageauth/AuthUser";
// import NavBar from "../components/Navbar.jsx";
// import { FaTrash, FaEdit } from "react-icons/fa";

// const ServicioCrud = () => {
//   const { getUser } = AuthUser();
//   const [servicios, setServicios] = useState([]);
//   const [nuevoServicio, setNuevoServicio] = useState({
//     empresa_id: getUser().id,
//     nombre: "",
//     descripcion: "",
//     duracion: "",
//     estado: "activo",
//     precio: "",
//   });
//   const [servicioEditado, setServicioEditado] = useState({
//     empresa_id: getUser().id,
//     nombre: "",
//     descripcion: "",
//     duracion: "",
//     estado: "activo",
//     precio: "",
//   });
//   const [editingService, setEditingService] = useState(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     obtenerServicios();
//   }, []);

//   const obtenerServicios = async () => {
//     try {
//       const response = await Config.getServicesByEmpresa(getUser().id);
//       setServicios(response.data);
//     } catch (error) {
//       console.error("Error al cargar servicios:", error);
//     }
//   };

//   const handleInputChange = (event) => {
//     const { name, value } = event.target;
//     setNuevoServicio((prevServicio) => ({
//       ...prevServicio,
//       [name]: value,
//     }));
//   };

//   const handleEditInputChange = (event) => {
//     const { name, value } = event.target;
//     setServicioEditado((prevServicio) => ({
//       ...prevServicio,
//       [name]: value,
//     }));
//   };

//   const validateForm = (servicio) => {
//     const newErrors = {};
//     if (!servicio.nombre) newErrors.nombre = "El nombre es requerido";
//     if (!servicio.duracion || servicio.duracion <= 0)
//       newErrors.duracion = "La duración debe ser mayor a 0";
//     if (!servicio.precio || servicio.precio <= 0)
//       newErrors.precio = "El precio debe ser mayor a 0";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const agregarServicio = async () => {
//     // if (!validateForm(nuevoServicio)) return;
//     try {
//       await Config.createService(nuevoServicio);
//       obtenerServicios();
//       clearForm();
//     } catch (error) {
//       if (error.response) {
//         setErrors(error.response.data.errors || {});
//       }
//       console.error("Error al agregar servicio:", error);
//     }
//   };

//   const startEditing = (servicio) => {
//     setEditingService(servicio.id);
//     setServicioEditado({
//       empresa_id: servicio.empresa_id,
//       nombre: servicio.nombre,
//       descripcion: servicio.descripcion || "",
//       duracion: servicio.duracion,
//       estado: servicio.estado,
//       precio: servicio.precio,
//     });
//     setShowEditModal(true);
//   };

//   const actualizarServicio = async () => {
//     if (!validateForm(servicioEditado)) return;
//     try {
//       await Config.updateService(editingService, servicioEditado);
//       obtenerServicios();
//       clearForm();
//       setShowEditModal(false);
//     } catch (error) {
//       if (error.response) {
//         setErrors(error.response.data.errors || {});
//       }
//       console.error("Error al actualizar servicio:", error);
//     }
//   };

//   const desactivarServicio = async (id) => {
//     try {
//       await Config.desactivarService(id);
//       setServicios(
//         servicios.map((servicio) =>
//           servicio.id === id ? { ...servicio, estado: "desactivado" } : servicio
//         )
//       );
//     } catch (error) {
//       console.error("Error al desactivar el servicio:", error);
//     }
//   };

//   const activarServicio = async (id) => {
//     try {
//       await Config.activarServicio(id);
//       setServicios(
//         servicios.map((servicio) =>
//           servicio.id === id ? { ...servicio, estado: "activo" } : servicio
//         )
//       );
//     } catch (error) {
//       console.error("Error al activar el servicio:", error);
//     }
//   };

//   const eliminarServicio = async (id) => {
//     try {
//       await Config.deleteService(id);
//       setServicios(servicios.filter((servicio) => servicio.id !== id));
//     } catch (error) {
//       console.error("Error al eliminar servicio:", error);
//     }
//   };

//   const clearForm = () => {
//     setNuevoServicio({
//       empresa_id: getUser().id,
//       nombre: "",
//       descripcion: "",
//       duracion: "",
//       estado: "activo",
//       precio: "",
//     });
//     setErrors({});
//   };

//   const handleCloseEditModal = () => {
//     setServicioEditado({
//       empresa_id: getUser().id,
//       nombre: "",
//       descripcion: "",
//       duracion: "",
//       estado: "activo",
//       precio: "",
//     });
//     setEditingService(null);
//     setShowEditModal(false);
//   };

//   return (
//     <>
//       <NavBar />
//       <Container>
//         <h1 className="text-center my-3">Servicios</h1>
//         <Row>
//           <Col lg={6} className="mb-4">
//             <h2>Agregar Servicio</h2>
//             <Form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 agregarServicio();
//               }}
//             >
//               <Form.Group controlId="formNombre" className="mb-3">
//                 <Form.Label>Nombre</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="nombre"
//                   value={nuevoServicio.nombre}
//                   onChange={handleInputChange}
//                   isInvalid={!!errors.nombre}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.nombre}
//                 </Form.Control.Feedback>
//               </Form.Group>
//               <Form.Group controlId="formDescripcion" className="mb-3">
//                 <Form.Label>Descripción</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="descripcion"
//                   value={nuevoServicio.descripcion}
//                   onChange={handleInputChange}
//                   isInvalid={!!errors.descripcion}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.descripcion}
//                 </Form.Control.Feedback>
//               </Form.Group>
//               <Form.Group controlId="formDuracion" className="mb-3">
//                 <Form.Label>Duración (minutos)</Form.Label>
//                 <Form.Control
//                   type="number"
//                   name="duracion"
//                   value={nuevoServicio.duracion}
//                   onChange={handleInputChange}
//                   isInvalid={!!errors.duracion}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.duracion}
//                 </Form.Control.Feedback>
//               </Form.Group>
//               <Form.Group controlId="formPrecio" className="mb-3">
//                 <Form.Label>Precio</Form.Label>
//                 <InputGroup>
//                   <InputGroup.Text>$</InputGroup.Text>
//                   <Form.Control
//                     type="number"
//                     name="precio"
//                     value={nuevoServicio.precio}
//                     onChange={handleInputChange}
//                     isInvalid={!!errors.precio}
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.precio}
//                   </Form.Control.Feedback>
//                 </InputGroup>
//               </Form.Group>
//               <div className="d-flex justify-content-between">
//                 <Button type="submit" className="btn btn-primary">
//                   Agregar Servicio
//                 </Button>
//                 <Button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={clearForm}
//                 >
//                   Limpiar
//                 </Button>
//               </div>
//             </Form>
//           </Col>
//           <Col lg={6} className="mb-4">
//             <h2>Lista de Servicios</h2>
//             {servicios.length === 0 ? (
//               <Alert variant="info">No hay servicios disponibles.</Alert>
//             ) : (
//               <ListGroup>
//                 {servicios.map((servicio) => (
//                   <ListGroup.Item
//                     key={servicio.id}
//                     className="d-flex justify-content-between align-items-center"
//                   >
//                     <div>
//                       <h5>{servicio.nombre}</h5>
//                       <p>Descripcion: {servicio.descripcion}</p>
//                       <p>Duración: {servicio.duracion} minutos</p>
//                       <p>Precio: ${servicio.precio}</p>
//                       <Badge
//                         bg={
//                           servicio.estado === "activo"
//                             ? "success"
//                             : "secondary"
//                         }
//                       >
//                         {servicio.estado}
//                       </Badge>
//                     </div>
//                     <div className="d-flex align-items-center">
//                       <Button
//                         variant={
//                           servicio.estado === "activo" ? "danger" : "success"
//                         }
//                         onClick={() =>
//                           servicio.estado === "activo"
//                             ? desactivarServicio(servicio.id)
//                             : activarServicio(servicio.id)
//                         }
//                         className="me-2"
//                       >
//                         {servicio.estado === "activo"
//                           ? "Desactivar"
//                           : "Activar"}
//                       </Button>
//                       <Button
//                         variant="warning"
//                         onClick={() => startEditing(servicio)}
//                         className="me-2"
//                       >
//                                               <FaEdit />
//                       </Button>
//                       <Button
//                         variant="danger"
//                         onClick={() => eliminarServicio(servicio.id)}
//                       >
//                         <FaTrash />
//                       </Button>
//                     </div>
//                   </ListGroup.Item>
//                 ))}
//               </ListGroup>
//             )}
//           </Col>
//         </Row>

//         {/* Modal para Editar Servicio */}
//         <Modal show={showEditModal} onHide={handleCloseEditModal}>
//           <Modal.Header closeButton>
//             <Modal.Title>Editar Servicio</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <Form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 actualizarServicio(editingService);
//               }}
//             >
//               <Form.Group controlId="formEditNombre" className="mb-3">
//                 <Form.Label>Nombre</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="nombre"
//                   value={servicioEditado.nombre}
//                   onChange={handleEditInputChange}
//                   isInvalid={!!errors.nombre}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.nombre}
//                 </Form.Control.Feedback>
//               </Form.Group>
//               <Form.Group controlId="formEditDescripcion" className="mb-3">
//                 <Form.Label>Descripción</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="descripcion"
//                   value={servicioEditado.descripcion}
//                   onChange={handleEditInputChange}
//                   isInvalid={!!errors.descripcion}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.descripcion}
//                 </Form.Control.Feedback>
//               </Form.Group>
//               <Form.Group controlId="formEditDuracion" className="mb-3">
//                 <Form.Label>Duración (minutos)</Form.Label>
//                 <Form.Control
//                   type="number"
//                   name="duracion"
//                   value={servicioEditado.duracion}
//                   onChange={handleEditInputChange}
//                   isInvalid={!!errors.duracion}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.duracion}
//                 </Form.Control.Feedback>
//               </Form.Group>
//               <Form.Group controlId="formEditPrecio" className="mb-3">
//                 <Form.Label>Precio</Form.Label>
//                 <InputGroup>
//                   <InputGroup.Text>$</InputGroup.Text>
//                   <Form.Control
//                     type="number"
//                     name="precio"
//                     value={servicioEditado.precio}
//                     onChange={handleEditInputChange}
//                     isInvalid={!!errors.precio}
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.precio}
//                   </Form.Control.Feedback>
//                 </InputGroup>
//               </Form.Group>
//               <div className="d-flex justify-content-end">
//                 <Button type="submit" className="btn btn-primary">
//                   Actualizar Servicio
//                 </Button>
//                 <Button
//                   type="button"
//                   className="btn btn-secondary ms-2"
//                   onClick={handleCloseEditModal}
//                 >
//                   Cancelar
//                 </Button>
//               </div>
//             </Form>
//           </Modal.Body>
//         </Modal>
//       </Container>
//     </>
//   );
// };

// export default ServicioCrud;


