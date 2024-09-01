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
import { getFullURL } from '../../utils/utils';
import NavBar from "../components/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";

const ProductoCrud = () => {
  const { getUser } = AuthUser();
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    empresa_id: user ? user.id : '',
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    estado: "activo",
    foto: null,
  });
  const [productoEditado, setProductoEditado] = useState({
    empresa_id: user ? user.id : '',
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    estado: "activo",
    foto: null,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorsAgregar, setErrorsAgregar] = useState({});
  const [errorsEditar, setErrorsEditar] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      fetchProductos();
    }
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await Config.getProductosEmpresa(getUser().id);
      setProductos(response.data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNuevoProducto((prevProducto) => ({
      ...prevProducto,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setNuevoProducto((prevProducto) => ({
      ...prevProducto,
      foto: file,
    }));
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    setProductoEditado((prevProducto) => ({
      ...prevProducto,
      [name]: value,
    }));
  };

  const addProducto = async () => {
    const formData = new FormData();
    Object.keys(nuevoProducto).forEach((key) => {
      if (key === 'foto' && nuevoProducto[key] === null) {
        return;
      }
      formData.append(key, nuevoProducto[key]);
    });

    try {
      const response = await Config.createProducto(formData);
      fetchProductos();
      clearForm();
    } catch (error) {
      if (error.response) {
        setErrorsAgregar(error.response.data.errors || {});
      } else {
        console.error("Error al agregar producto:", error);
      }
    }
  };

  const startEditing = (producto) => {
    setEditingProduct(producto.id);
    setProductoEditado({
      empresa_id: producto.empresa_id,
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: producto.precio,
      stock: producto.stock,
      estado: producto.estado,
      foto: null,
    });
    setShowEditModal(true);
  };

  const updateProducto = async (id) => {
    const formData = new FormData();
    Object.keys(productoEditado).forEach(key => {
      if (key !== 'foto') {
        formData.append(key, productoEditado[key]);
      }
    });

    formData.append('_method', 'PUT');

    try {
      await Config.updateProducto(id, productoEditado);
      fetchProductos();
      clearForm();
      setEditingProduct(null);
      setShowEditModal(false);
    } catch (error) {
      if (error.response) {
        setErrorsEditar(error.response.data.errors || {});
      } else {
        console.error("Error al actualizar producto:", error);
      }
    }
  };

  const toggleProductoState = async (id, currentState) => {
    try {
      const updatedProducto = {
        ...productos.find((prod) => prod.id === id),
        estado: currentState === "activo" ? "inactivo" : "activo",
      };
      await Config.updateProducto(id, updatedProducto);
      fetchProductos();
    } catch (error) {
      console.error("Error al cambiar estado del producto:", error);
    }
  };

  const deleteProducto = async (id) => {
    try {
      await Config.deleteProducto(id);
      fetchProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const clearForm = () => {
    setNuevoProducto({
      empresa_id: getUser().id,
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      estado: "activo",
      foto: null,
    });
    setErrorsAgregar({});
  };

  const handleCloseEditModal = () => {
    setProductoEditado({
      empresa_id: getUser().id,
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      estado: "activo",
      foto: null,
    });
    setErrorsEditar({});
    setEditingProduct(null);
    setShowEditModal(false);
  };

  return (
    <>
      <NavBar />
      <Container>
        <h1 className="text-center my-4">Productos</h1>
        <Row>
          <Col lg={6} className="mb-4">
            <h2>Agregar Producto</h2>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                addProducto();
              }}
            >
              <Form.Group controlId="formNombre" className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={nuevoProducto.nombre}
                  onChange={handleInputChange}
                  isInvalid={!!errorsAgregar.nombre}
                />
                <Form.Control.Feedback type="invalid">
                  {errorsAgregar.nombre}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formDescripcion" className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={nuevoProducto.descripcion}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formPrecio" className="mb-3">
                <Form.Label>Precio</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="precio"
                    value={nuevoProducto.precio}
                    onChange={handleInputChange}
                    isInvalid={!!errorsAgregar.precio}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errorsAgregar.precio}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              <Form.Group controlId="formStock" className="mb-3">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  name="stock"
                  value={nuevoProducto.stock}
                  onChange={handleInputChange}
                  isInvalid={!!errorsAgregar.stock}
                />
                <Form.Control.Feedback type="invalid">
                  {errorsAgregar.stock}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formFoto" className="mb-3">
                <Form.Label>Foto</Form.Label>
                <Form.Control
                  type="file"
                  name="foto"
                  onChange={handleFileChange}
                />
              </Form.Group>
              <div className="d-flex justify-content-between">
                <Button type="submit" className="btn btn-primary">
                  Agregar Producto
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
            <h2>Lista de Productos</h2>
            {productos.length === 0 ? (
              <Alert variant="info">No hay productos registrados</Alert>
            ) : (
              <ListGroup>
                {productos.map((producto) => (
                  <ListGroup.Item
                    key={producto.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h5>{producto.nombre}</h5>
                      <p>{producto.descripcion}</p>
                      <p>Precio: ${producto.precio}</p>
                      <p>Stock: {producto.stock}</p>
                      <Badge
                        bg={
                          producto.estado === "activo" ? "success" : "secondary"
                        }
                      >
                        {producto.estado}
                      </Badge>
                    </div>

                    {producto.foto_url && (
                      <div>
                        <img
                          src={getFullURL(producto.foto_url)}
                          alt={producto.nombre}
                          style={{ maxWidth: "100px", maxHeight: "100px" }}
                        />
                      </div>
                    )}
                    <div className="d-flex align-items-center">

                      <Button
                        variant={
                          producto.estado === "activo" ? "danger" : "success"
                        }
                        onClick={() =>
                          toggleProductoState(producto.id, producto.estado)
                        }
                        className="me-2"
                      >
                        {producto.estado === "activo"
                          ? "Desactivar"
                          : "Activar"}
                      </Button>

                      <Button
                        variant="warning"
                        onClick={() => startEditing(producto)}
                        className="me-2"
                      >
                        Editar
                      </Button>
                      
                      <Button
                        variant="danger"
                        onClick={() => deleteProducto(producto.id)}
                      >
                        {/* Eliminar  */} <FaTrash />
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Col>
        </Row>

        {/* Modal para Editar Producto */}
        <Modal show={showEditModal} onHide={handleCloseEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Producto</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                updateProducto(editingProduct);
              }}
            >
              <Form.Group controlId="formEditNombre" className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={productoEditado.nombre}
                  onChange={handleEditInputChange}
                  isInvalid={!!errorsEditar.nombre}
                />
                <Form.Control.Feedback type="invalid">
                  {errorsEditar.nombre}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formEditDescripcion" className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={productoEditado.descripcion}
                  onChange={handleEditInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formEditPrecio" className="mb-3">
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="precio"
                    value={productoEditado.precio}
                    onChange={handleEditInputChange}
                    isInvalid={!!errorsEditar.precio}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errorsEditar.precio}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              <Form.Group controlId="formEditStock" className="mb-3">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  name="stock"
                  value={productoEditado.stock}
                  onChange={handleEditInputChange}
                  isInvalid={!!errorsEditar.stock}
                />
                <Form.Control.Feedback type="invalid">
                  {errorsEditar.stock}
                </Form.Control.Feedback>
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button type="submit" className="btn btn-primary">
                  Actualizar Producto
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

export default ProductoCrud;



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
// import { getFullURL } from '../../utils/utils';
// import NavBar from "../components/Navbar.jsx";
// import { useNavigate, useParams } from "react-router-dom";


// const ProductoCrud = () => {
//   const { getUser } = AuthUser();
//   const navigate = useNavigate();
//   const user = getUser();
//   // console.log(getUser());
//   useEffect(() => {
//     if (!user) {
//       navigate("/");
//     }
//   }, [user, navigate]);

//   const [productos, setProductos] = useState([]);
//   const [nuevoProducto, setNuevoProducto] = useState({
//     empresa_id: user ? user.id : '',
//     nombre: "",
//     descripcion: "",
//     precio: "",
//     stock: "",
//     estado: "activo",
//     foto: null,
//   });
//   const [productoEditado, setProductoEditado] = useState({
//     empresa_id: user ? user.id : '',
//     nombre: "",
//     descripcion: "",
//     precio: "",
//     stock: "",
//     estado: "activo",
//     foto: null,
//   });
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [errors, setErrors] = useState({});
  

//   useEffect(() => {
//     if (!user) {
//       navigate("/");
//     } else {
//       fetchProductos();
//     }
//   }, []);
//   // }, [user, navigate]);

//   const fetchProductos = async () => {
//     try {
//       const response = await Config.getProductosEmpresa(getUser().id);
//       console.log(response.data); // Esto mostrará los datos en la consola del navegador
//       setProductos(response.data);
//     } catch (error) {
//       console.error("Error al cargar productos:", error);
//     }
//   };

//   const handleInputChange = (event) => {
//     const { name, value } = event.target;
//     setNuevoProducto((prevProducto) => ({
//       ...prevProducto,
//       [name]: value,
//     }));
//   };

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     setNuevoProducto((prevProducto) => ({
//       ...prevProducto,
//       foto: file,
//     }));
//   };

//   const handleEditFileChange = (event) => {
//     const file = event.target.files[0];
//     setProductoEditado((prevProducto) => ({
//       ...prevProducto,
//       foto: file,
//     }));
//   };

//   const handleEditInputChange = (event) => {
//     const { name, value } = event.target;
//     setProductoEditado((prevProducto) => ({
//       ...prevProducto,
//       [name]: value,
//     }));
//   };



//   const addProducto = async () => {


//     const formData = new FormData();
//     Object.keys(nuevoProducto).forEach((key) => {
//         // Verificar si la clave es 'foto' y si es un archivo válido
//         if (key === 'foto' && nuevoProducto[key] === null) {
//             // No agregar la foto si es null
//             return;
//         }
//         formData.append(key, nuevoProducto[key]);
//     });

//     try {
//         const response = await Config.createProducto(formData);
//         console.log(response);
//         fetchProductos();
//         clearForm();
//     } catch (error) {
//         if (error.response) {
//             setErrors(error.response.data.errors || {});
//             console.error("Errores:", error.response.data.errors);
//         } else {
//             console.error("Error al agregar producto:", error);
//         }
//     }
// };


//   const startEditing = (producto) => {
//     setEditingProduct(producto.id);
//     setProductoEditado({
//       empresa_id: producto.empresa_id,
//       nombre: producto.nombre,
//       descripcion: producto.descripcion || "",
//       precio: producto.precio,
//       stock: producto.stock,
//       estado: producto.estado,
//       foto: null,
//     });
//     setShowEditModal(true);
//   };

//   const updateProducto = async (id) => {

//     const formData = new FormData();
//     Object.keys(productoEditado).forEach(key => {
//         if (key !== 'foto') {
//             formData.append(key, productoEditado[key]);
//         }
//     });

//     // Verifica si hay un archivo de foto y añádelo al FormData
//     if (productoEditado.foto && productoEditado.foto instanceof File) {
//         formData.append('foto', productoEditado.foto, productoEditado.foto.name);
//     }

//     // Añadir el método PUT para Laravel
//     formData.append('_method', 'PUT');

//     console.log(id);
//     console.log(productoEditado);
//     try {
//         await Config.updateProducto(id, productoEditado); // Asegúrate de que esta función maneje correctamente el FormData
//         fetchProductos();
//         clearForm();
//         setEditingProduct(null);
//         setShowEditModal(false);
//     } catch (error) {
//         if (error.response) {
//             setErrors(error.response.data.errors || {});
//         }
//         console.error("Error al actualizar producto:", error);
//     }
// };

//   const toggleProductoState = async (id, currentState) => {
//     console.log(id)
//     console.log(currentState)
//     try {
//       const updatedProducto = {
//         ...productos.find((prod) => prod.id === id),
//         estado: currentState === "activo" ? "inactivo" : "activo",
//       };
//       console.log(updateProducto)
//       console.log(id)
//       await Config.updateProducto(id, updatedProducto);
//       fetchProductos();
//     } catch (error) {
//       console.error("Error al cambiar estado del producto:", error);
//     }
//   };

//   const deleteProducto = async (id) => {
//     try {
//       await Config.deleteProducto(id);
//       fetchProductos();
//     } catch (error) {
//       console.error("Error al eliminar producto:", error);
//     }
//   };

//   const clearForm = () => {
//     setNuevoProducto({
//       empresa_id: getUser().id,
//       nombre: "",
//       descripcion: "",
//       precio: "",
//       stock: "",
//       estado: "activo",
//       foto: null,
//     });
//     setErrors({});
//   };

//   const handleCloseEditModal = () => {
//     setProductoEditado({
//       empresa_id: getUser().id,
//       nombre: "",
//       descripcion: "",
//       precio: "",
//       stock: "",
//       estado: "activo",
//       foto: null,
//     });
//     setEditingProduct(null);
//     setShowEditModal(false);
//   };

//   return (
//     <>
//     <NavBar />
//     <Container>
//       <h1 className="text-center my-4">Productos</h1>
//       <Row>
//         <Col lg={6} className="mb-4">
//           <h2>Agregar Producto</h2>
//           <Form
//             onSubmit={(e) => {
//               e.preventDefault();
//               addProducto();
//             }}
//           >
//             <Form.Group controlId="formNombre" className="mb-3">
//               <Form.Label>Nombre</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="nombre"
//                 value={nuevoProducto.nombre}
//                 onChange={handleInputChange}
//                 isInvalid={!!errors.nombre}
//               />
//               <Form.Control.Feedback type="invalid">
//                 {errors.nombre}
//               </Form.Control.Feedback>
//             </Form.Group>
//             <Form.Group controlId="formDescripcion" className="mb-3">
//               <Form.Label>Descripción</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="descripcion"
//                 value={nuevoProducto.descripcion}
//                 onChange={handleInputChange}
//               />
//             </Form.Group>
//             <Form.Group controlId="formPrecio" className="mb-3">
//               <Form.Label>Precio</Form.Label>
//               <InputGroup>
//                 <InputGroup.Text>$</InputGroup.Text>
//                 <Form.Control
//                   type="number"
//                   name="precio"
//                   value={nuevoProducto.precio}
//                   onChange={handleInputChange}
//                   isInvalid={!!errors.precio}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.precio}
//                 </Form.Control.Feedback>
//               </InputGroup>
//             </Form.Group>
//             <Form.Group controlId="formStock" className="mb-3">
//               <Form.Label>Stock</Form.Label>
//               <Form.Control
//                 type="number"
//                 name="stock"
//                 value={nuevoProducto.stock}
//                 onChange={handleInputChange}
//                 isInvalid={!!errors.stock}
//               />
//               <Form.Control.Feedback type="invalid">
//                 {errors.stock}
//               </Form.Control.Feedback>
//             </Form.Group>
//             <Form.Group controlId="formFoto" className="mb-3">
//               <Form.Label>Foto</Form.Label>
//               <Form.Control
//                 type="file"
//                 name="foto"
//                 onChange={handleFileChange}
//               />
//             </Form.Group>
//             <div className="d-flex justify-content-between">
//               <Button type="submit" className="btn btn-primary">
//                 Agregar Producto
//               </Button>
//               <Button
//                 type="button"
//                 className="btn btn-secondary"
//                 onClick={clearForm}
//               >
//                 Limpiar
//               </Button>
//             </div>
//           </Form>
//         </Col>
//         <Col lg={6} className="mb-4">
//           <h2>Lista de Productos</h2>
//           {productos.length === 0 ? (
//             <Alert variant="info">No hay productos registrados</Alert>
//           ) : (
//             <ListGroup>
//               {productos.map((producto) => (
//                 <ListGroup.Item
//                   key={producto.id}
//                   className="d-flex justify-content-between align-items-center"
//                 >
//                   <div>
//                     <h5>{producto.nombre}</h5>
//                     <p>{producto.descripcion}</p>
//                     <p>Precio: ${producto.precio}</p>
//                     <p>Stock: {producto.stock}</p>
//                     <Badge
//                       bg={
//                         producto.estado === "activo" ? "success" : "secondary"
//                       }
//                     >
//                       {producto.estado}
//                     </Badge>
//                   </div>

//                                     {producto.foto_url && (
//                     <div>
//                       <img
//                         src={getFullURL(producto.foto_url)}
//                         alt={producto.nombre}
//                         style={{ maxWidth: "100px", maxHeight: "100px" }}
//                       />
//                     </div>
//                   )}
//                   <div className="d-flex align-items-center">
//                     <Button
//                       variant="warning"
//                       onClick={() => startEditing(producto)}
//                       className="me-2"
//                     >
//                       Editar
//                     </Button>
//                     <Button
//                       variant={
//                         producto.estado === "activo" ? "danger" : "success"
//                       }
//                       onClick={() =>
//                         toggleProductoState(producto.id, producto.estado)
//                       }
//                       className="me-2"
//                     >
//                       {producto.estado === "activo"
//                         ? "Desactivar"
//                         : "Activar"}
//                     </Button>
//                     <Button
//                       variant="danger"
//                       onClick={() => deleteProducto(producto.id)}
//                     >
//                       Eliminar
//                     </Button>
//                   </div>
//                 </ListGroup.Item>
//               ))}
//             </ListGroup>
//           )}
//         </Col>
//       </Row>

//       {/* Modal para Editar Producto */}
//       <Modal show={showEditModal} onHide={handleCloseEditModal}>
//         <Modal.Header closeButton>
//           <Modal.Title>Editar Producto</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form
//             onSubmit={(e) => {
//               e.preventDefault();
//               updateProducto(editingProduct);
//             }}
//           >
//             <Form.Group controlId="formEditNombre" className="mb-3">
//               <Form.Label>Nombre</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="nombre"
//                 value={productoEditado.nombre}
//                 onChange={handleEditInputChange}
//                 isInvalid={!!errors.nombre}
//               />
//               <Form.Control.Feedback type="invalid">
//                 {errors.nombre}
//               </Form.Control.Feedback>
//             </Form.Group>
//             <Form.Group controlId="formEditDescripcion" className="mb-3">
//               <Form.Label>Descripción</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="descripcion"
//                 value={productoEditado.descripcion}
//                 onChange={handleEditInputChange}
//               />
//             </Form.Group>
//             <Form.Group controlId="formEditPrecio" className="mb-3">
//               <Form.Label>Precio</Form.Label>
//               <InputGroup>
//                 <InputGroup.Text>$</InputGroup.Text>
//                 <Form.Control
//                   type="number"
//                   name="precio"
//                   value={productoEditado.precio}
//                   onChange={handleEditInputChange}
//                   isInvalid={!!errors.precio}
//                 />
//                 <Form.Control.Feedback type="invalid">
//                   {errors.precio}
//                 </Form.Control.Feedback>
//               </InputGroup>
//             </Form.Group>
//             <Form.Group controlId="formEditStock" className="mb-3">
//               <Form.Label>Stock</Form.Label>
//               <Form.Control
//                 type="number"
//                 name="stock"
//                 value={productoEditado.stock}
//                 onChange={handleEditInputChange}
//                 isInvalid={!!errors.stock}
//               />
//               <Form.Control.Feedback type="invalid">
//                 {errors.stock}
//               </Form.Control.Feedback>
//             </Form.Group>
//               {/* <Form.Group controlId="formEditFoto" className="mb-3">
//                 <Form.Label>Foto</Form.Label>
//                 <Form.Control
//                   type="file"
//                   name="foto"
//                   onChange={handleEditFileChange}
//                 />
//               </Form.Group> */}
//             <div className="d-flex justify-content-end">
//               <Button type="submit" className="btn btn-primary">
//                 Actualizar Producto
//               </Button>
//               <Button
//                 type="button"
//                 className="btn btn-secondary ms-2"
//                 onClick={handleCloseEditModal}
//               >
//                 Cancelar
//               </Button>
//             </div>
//           </Form>
//         </Modal.Body>
//       </Modal>
//     </Container>
//     </>
//   );
// };

// export default ProductoCrud;


// // import React, { useState, useEffect } from "react";
// // import {
// //   Form,
// //   InputGroup,
// //   Container,
// //   Row,
// //   Col,
// //   Button,
// //   ListGroup,
// //   Alert,
// //   Badge,
// //   Modal,
// // } from "react-bootstrap";
// // import Config from "../Config";
// // import AuthUser from "../pageauth/AuthUser";

// // const ProductoCrud = () => {
// //   const { getUser } = AuthUser();
// //   const [productos, setProductos] = useState([]);
// //   const [nuevoProducto, setNuevoProducto] = useState({
// //     empresa_id: getUser().id,
// //     nombre: "",
// //     descripcion: "",
// //     precio: "",
// //     stock: "",
// //     estado: "activo",
// //   });
// //   const [productoEditado, setProductoEditado] = useState({
// //     empresa_id: getUser().id,
// //     nombre: "",
// //     descripcion: "",
// //     precio: "",
// //     stock: "",
// //     estado: "activo",
// //   });
// //   const [editingProduct, setEditingProduct] = useState(null);
// //   const [showEditModal, setShowEditModal] = useState(false);
// //   const [errors, setErrors] = useState({});

// //   useEffect(() => {
// //     fetchProductos();
// //   }, []);

// //   const fetchProductos = async () => {
// //     try {
// //       const response = await Config.getProductosEmpresa(getUser().id);
// //       setProductos(response.data);
// //     } catch (error) {
// //       console.error("Error al cargar productos:", error);
// //     }
// //   };

// //   const handleInputChange = (event) => {
// //     const { name, value } = event.target;
// //     setNuevoProducto((prevProducto) => ({
// //       ...prevProducto,
// //       [name]: value,
// //     }));
// //   };

// //   const handleEditInputChange = (event) => {
// //     const { name, value } = event.target;
// //     setProductoEditado((prevProducto) => ({
// //       ...prevProducto,
// //       [name]: value,
// //     }));
// //   };

// //   const validateForm = (producto) => {
// //     const newErrors = {};
// //     if (!producto.nombre) newErrors.nombre = "El nombre es requerido";
// //     if (!producto.precio || producto.precio <= 0)
// //       newErrors.precio = "El precio debe ser mayor a 0";
// //     if (!producto.stock || producto.stock <= 0)
// //       newErrors.stock = "El stock debe ser mayor a 0";
// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   const addProducto = async () => {
// //     if (!validateForm(nuevoProducto)) return;
// //     try {
// //       console.log("Datos para agregar producto:", nuevoProducto);
// //       await Config.createProducto(nuevoProducto);
// //       fetchProductos();
// //       clearForm();
// //     } catch (error) {
// //       if (error.response) {
// //         setErrors(error.response.data.errors || {});
// //       }
// //       console.error("Error al agregar producto:", error);
// //     }
// //   };

// //   const startEditing = (producto) => {
// //     setEditingProduct(producto.id);
// //     setProductoEditado({
// //       empresa_id: producto.empresa_id,
// //       nombre: producto.nombre,
// //       descripcion: producto.descripcion || "",
// //       precio: producto.precio,
// //       stock: producto.stock,
// //       estado: producto.estado,
// //     });
// //     setShowEditModal(true);
// //   };

// //   const updateProducto = async (id) => {
// //     if (!validateForm(productoEditado)) return;
// //     try {
// //       console.log("Datos para actualizar producto:", productoEditado);
// //       await Config.updateProducto(id, productoEditado);
// //       fetchProductos();
// //       clearForm();
// //       setEditingProduct(null);
// //       setShowEditModal(false);
// //     } catch (error) {
// //       if (error.response) {
// //         setErrors(error.response.data.errors || {});
// //       }
// //       console.error("Error al actualizar producto:", error);
// //     }
// //   };

// //   const toggleProductoState = async (id, currentState) => {
// //     try {
// //       const updatedProducto = {
// //         ...productos.find((prod) => prod.id === id),
// //         estado: currentState === "activo" ? "inactivo" : "activo",
// //       };
// //       console.log(
// //         "Datos para desactivar/activar producto:",
// //         updatedProducto
// //       );
// //       await Config.updateProducto(id, updatedProducto);
// //       fetchProductos();
// //     } catch (error) {
// //       console.error("Error al cambiar estado del producto:", error);
// //     }
// //   };

// //   const deleteProducto = async (id) => {
// //     try {
// //       await Config.deleteProducto(id);
// //       fetchProductos();
// //     } catch (error) {
// //       console.error("Error al eliminar producto:", error);
// //     }
// //   };

// //   const clearForm = () => {
// //     setNuevoProducto({
// //       empresa_id: getUser().id,
// //       nombre: "",
// //       descripcion: "",
// //       precio: "",
// //       stock: "",
// //       estado: "activo",
// //     });
// //     setErrors({});
// //   };

// //   const handleCloseEditModal = () => {
// //     setProductoEditado({
// //       empresa_id: getUser().id,
// //       nombre: "",
// //       descripcion: "",
// //       precio: "",
// //       stock: "",
// //       estado: "activo",
// //     });
// //     setEditingProduct(null);
// //     setShowEditModal(false);
// //   };

// //   return (
// //     <Container>
// //       <h1 className="text-center my-4">Productos</h1>
// //       <Row>
// //         <Col lg={6} className="mb-4">
// //           <h2>Agregar Producto</h2>
// //           <Form
// //             onSubmit={(e) => {
// //               e.preventDefault();
// //               addProducto();
// //             }}
// //           >
// //             <Form.Group controlId="formNombre" className="mb-3">
// //               <Form.Label>Nombre</Form.Label>
// //               <Form.Control
// //                 type="text"
// //                 name="nombre"
// //                 value={nuevoProducto.nombre}
// //                 onChange={handleInputChange}
// //                 isInvalid={!!errors.nombre}
// //               />
// //               <Form.Control.Feedback type="invalid">
// //                 {errors.nombre}
// //               </Form.Control.Feedback>
// //             </Form.Group>
// //             <Form.Group controlId="formDescripcion" className="mb-3">
// //               <Form.Label>Descripción</Form.Label>
// //               <Form.Control
// //                 type="text"
// //                 name="descripcion"
// //                 value={nuevoProducto.descripcion}
// //                 onChange={handleInputChange}
// //               />
// //             </Form.Group>
// //             <Form.Group controlId="formPrecio" className="mb-3">
// //               <Form.Label>Precio</Form.Label>
// //               <InputGroup>
// //                 <InputGroup.Text>$</InputGroup.Text>
// //                 <Form.Control
// //                   type="number"
// //                   name="precio"
// //                   value={nuevoProducto.precio}
// //                   onChange={handleInputChange}
// //                   isInvalid={!!errors.precio}
// //                 />
// //                 <Form.Control.Feedback type="invalid">
// //                   {errors.precio}
// //                 </Form.Control.Feedback>
// //               </InputGroup>
// //             </Form.Group>
// //             <Form.Group controlId="formStock" className="mb-3">
// //               <Form.Label>Stock</Form.Label>
// //               <Form.Control
// //                 type="number"
// //                 name="stock"
// //                 value={nuevoProducto.stock}
// //                 onChange={handleInputChange}
// //                 isInvalid={!!errors.stock}
// //               />
// //               <Form.Control.Feedback type="invalid">
// //                 {errors.stock}
// //               </Form.Control.Feedback>
// //             </Form.Group>
// //             <div className="d-flex justify-content-between">
// //               <Button type="submit" className="btn btn-primary">
// //                 Agregar Producto
// //               </Button>
// //               <Button
// //                 type="button"
// //                 className="btn btn-secondary"
// //                 onClick={clearForm}
// //               >
// //                 Limpiar
// //               </Button>
// //             </div>
// //           </Form>
// //         </Col>
// //         <Col lg={6} className="mb-4">
// //           <h2>Lista de Productos</h2>
// //           {productos.length === 0 ? (
// //             <Alert variant="info">No hay productos disponibles.</Alert>
// //           ) : (
// //             <ListGroup>
// //               {productos.map((producto) => (
// //                 <ListGroup.Item
// //                   key={producto.id}
// //                   className="d-flex justify-content-between align-items-center"
// //                 >
// //                   <div>
// //                     <h5>{producto.nombre}</h5>
// //                     <p>{producto.descripcion}</p>
// //                     <p>Precio: ${producto.precio}</p>
// //                     <p>Stock: {producto.stock}</p>
// //                     <Badge
// //                       bg={
// //                         producto.estado === "activo" ? "success" : "secondary"
// //                       }
// //                     >
// //                       {producto.estado}
// //                     </Badge>
// //                   </div>
// //                   <div className="d-flex align-items-center">
// //                     <Button
// //                       variant="warning"
// //                       onClick={() => startEditing(producto)}
// //                       className="me-2"
// //                     >
// //                       Editar
// //                     </Button>
// //                     <Button
// //                       variant={
// //                         producto.estado === "activo" ? "danger" : "success"
// //                       }
// //                       onClick={() =>
// //                         toggleProductoState(producto.id, producto.estado)
// //                       }
// //                       className="me-2"
// //                     >
// //                       {producto.estado === "activo"
// //                         ? "Desactivar"
// //                         : "Activar"}
// //                     </Button>
// //                     <Button
// //                       variant="danger"
// //                       onClick={() => deleteProducto(producto.id)}
// //                     >
// //                       Eliminar
// //                     </Button>
// //                   </div>
// //                   {producto.foto_url && (
// //                     <div>
// //                       <img
// //                         src={producto.foto_url}
// //                         alt={producto.nombre}
// //                         style={{ maxWidth: "100px", maxHeight: "100px" }}
// //                       />
// //                     </div>
// //                   )}
// //                 </ListGroup.Item>
// //               ))}
// //             </ListGroup>
// //           )}
// //         </Col>
// //       </Row>

// //       {/* Modal para Editar Producto */}
// //       <Modal show={showEditModal} onHide={handleCloseEditModal}>
// //         <Modal.Header closeButton>
// //           <Modal.Title>Editar Producto</Modal.Title>
// //         </Modal.Header>
// //         <Modal.Body>
// //           <Form
// //             onSubmit={(e) => {
// //               e.preventDefault();
// //               updateProducto(editingProduct);
// //             }}
// //           >
// //             <Form.Group controlId="formEditNombre" className="mb-3">
// //               <Form.Label>Nombre</Form.Label>
// //               <Form.Control
// //                 type="text"
// //                 name="nombre"
// //                 value={productoEditado.nombre}
// //                 onChange={handleEditInputChange}
// //                 isInvalid={!!errors.nombre}
// //               />
// //               <Form.Control.Feedback type="invalid">
// //                 {errors.nombre}
// //               </Form.Control.Feedback>
// //             </Form.Group>
// //             <Form.Group controlId="formEditDescripcion" className="mb-3">
// //               <Form.Label>Descripción</Form.Label>
// //               <Form.Control
// //                 type="text"
// //                 name="descripcion"
// //                 value={productoEditado.descripcion}
// //                 onChange={handleEditInputChange}
// //               />
// //             </Form.Group>
// //             <Form.Group controlId="formEditPrecio" className="mb-3">
// //   <Form.Label>Precio</Form.Label>
// //   <InputGroup>
// //     <InputGroup.Text>$</InputGroup.Text>
// //     <Form.Control
// //       type="number"
// //       name="precio"
// //       value={productoEditado.precio}
// //       onChange={handleEditInputChange}
// //       isInvalid={!!errors.precio}
// //     />
// //     <Form.Control.Feedback type="invalid">
// //       {errors.precio}
// //     </Form.Control.Feedback>
// //   </InputGroup>
// // </Form.Group>
// // <Form.Group controlId="formEditStock" className="mb-3">
// //   <Form.Label>Stock</Form.Label>
// //   <Form.Control
// //     type="number"
// //     name="stock"
// //     value={productoEditado.stock}
// //     onChange={handleEditInputChange}
// //     isInvalid={!!errors.stock}
// //   />
// //   <Form.Control.Feedback type="invalid">
// //     {errors.stock}
// //   </Form.Control.Feedback>
// // </Form.Group>
// // <div className="d-flex justify-content-end">
// //   <Button type="submit" className="btn btn-primary">
// //     Actualizar Producto
// //   </Button>
// //   <Button
// //     type="button"
// //     className="btn btn-secondary ms-2"
// //     onClick={handleCloseEditModal}
// //   >
// //     Cancelar
// //   </Button>
// // </div>
// // </Form>
// // </Modal.Body>
// // </Modal>
// // </Container>
// // );
// // };

// // export default ProductoCrud;



// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   Form,
// // //   InputGroup,
// // //   Container,
// // //   Row,
// // //   Col,
// // //   Button,
// // //   ListGroup,
// // //   Alert,
// // //   Badge,
// // //   Modal,
// // // } from "react-bootstrap";
// // // import Config from "../Config"; 
// // // import AuthUser from "../pageauth/AuthUser";

// // // const ProductoCrud = () => {
// // //     const { getUser } = AuthUser();
// // //   const [productos, setProductos] = useState([]);
// // //   const [nuevoProducto, setNuevoProducto] = useState({
// // //     empresa_id: getUser().id,
// // //     nombre: "",
// // //     descripcion: "",
// // //     precio: "",
// // //     stock: "",
// // //     estado: "activo",
// // //   });
// // //   const [productoEditado, setProductoEditado] = useState({
// // //     empresa_id: getUser().id,
// // //     nombre: "",
// // //     descripcion: "",
// // //     precio: "",
// // //     stock: "",
// // //     estado: "activo",
// // //   });
// // //   const [editingProduct, setEditingProduct] = useState(null);
// // //   const [showEditModal, setShowEditModal] = useState(false);
// // //   const [errors, setErrors] = useState({});

// // //   useEffect(() => {
// // //     fetchProductos();
// // //   }, []);

// // //   const fetchProductos = async () => {
// // //     try {
// // //       const response = await Config.getProductosEmpresa(getUser().id);
// // //       setProductos(response.data);
// // //     } catch (error) {
// // //       console.error("Error al cargar productos:", error);
// // //     }
// // //   };

// // //   const handleInputChange = (event) => {
// // //     const { name, value } = event.target;
// // //     setNuevoProducto((prevProducto) => ({
// // //       ...prevProducto,
// // //       [name]: value,
// // //     }));
// // //   };

// // //   const handleEditInputChange = (event) => {
// // //     const { name, value } = event.target;
// // //     setProductoEditado((prevProducto) => ({
// // //       ...prevProducto,
// // //       [name]: value,
// // //     }));
// // //   };

// // //   const validateForm = (producto) => {
// // //     const newErrors = {};
// // //     if (!producto.nombre) newErrors.nombre = "El nombre es requerido";
// // //     if (!producto.precio || producto.precio <= 0) newErrors.precio = "El precio debe ser mayor a 0";
// // //     if (!producto.stock || producto.stock <= 0) newErrors.stock = "El stock debe ser mayor a 0";
// // //     setErrors(newErrors);
// // //     return Object.keys(newErrors).length === 0;
// // //   };

// // //   const addProducto = async () => {
// // //     if (!validateForm(nuevoProducto)) return;
// // //     try {
// // //       console.log("Datos para agregar producto:", nuevoProducto);
// // //       await Config.createProducto(nuevoProducto);
// // //       fetchProductos();
// // //       clearForm();
// // //     } catch (error) {
// // //       if (error.response) {
// // //         setErrors(error.response.data.errors || {});
// // //       }
// // //       console.error("Error al agregar producto:", error);
// // //     }
// // //   };

// // //   const startEditing = (producto) => {
// // //     setEditingProduct(producto.id);
// // //     setProductoEditado({
// // //       empresa_id: producto.empresa_id,
// // //       nombre: producto.nombre,
// // //       descripcion: producto.descripcion || "",
// // //       precio: producto.precio,
// // //       stock: producto.stock,
// // //       estado: producto.estado,
// // //     });
// // //     setShowEditModal(true);
// // //   };

// // //   const updateProducto = async (id) => {
// // //     if (!validateForm(productoEditado)) return;
// // //     try {
// // //       console.log("Datos para actualizar producto:", productoEditado);
// // //       await Config.updateProducto(id, productoEditado);
// // //       fetchProductos();
// // //       clearForm();
// // //       setEditingProduct(null);
// // //       setShowEditModal(false);
// // //     } catch (error) {
// // //       if (error.response) {
// // //         setErrors(error.response.data.errors || {});
// // //       }
// // //       console.error("Error al actualizar producto:", error);
// // //     }
// // //   };

// // //   const toggleProductoState = async (id, currentState) => {
// // //     try {
// // //       const updatedProducto = {
// // //         ...productos.find((prod) => prod.id === id),
// // //         estado: currentState === "activo" ? "inactivo" : "activo",
// // //       };
// // //       console.log("Datos para desactivar/activar producto:", updatedProducto);
// // //       await Config.updateProducto(id, updatedProducto);
// // //       fetchProductos();
// // //     } catch (error) {
// // //       console.error("Error al cambiar estado del producto:", error);
// // //     }
// // //   };

// // //   const deleteProducto = async (id) => {
// // //     try {
// // //       await Config.deleteProducto(id);
// // //       fetchProductos();
// // //     } catch (error) {
// // //       console.error("Error al eliminar producto:", error);
// // //     }
// // //   };

// // //   const clearForm = () => {
// // //     setNuevoProducto({
// // //       empresa_id: getUser().id,
// // //       nombre: "",
// // //       descripcion: "",
// // //       precio: "",
// // //       stock: "",
// // //       estado: "activo",
// // //     });
// // //     setErrors({});
// // //   };

// // //   const handleCloseEditModal = () => {
// // //     setProductoEditado({
// // //       empresa_id: getUser().id,
// // //       nombre: "",
// // //       descripcion: "",
// // //       precio: "",
// // //       stock: "",
// // //       estado: "activo",
// // //     });
// // //     setEditingProduct(null);
// // //     setShowEditModal(false);
// // //   };

// // //   return (
// // //     <Container>
// // //       <h1 className="text-center my-4">Productos</h1>
// // //       <Row>
// // //         <Col lg={6} className="mb-4">
// // //           <h2>Agregar Producto</h2>
// // //           <Form
// // //             onSubmit={(e) => {
// // //               e.preventDefault();
// // //               addProducto();
// // //             }}
// // //           >
// // //             <Form.Group controlId="formNombre" className="mb-3">
// // //               <Form.Label>Nombre</Form.Label>
// // //               <Form.Control
// // //                 type="text"
// // //                 name="nombre"
// // //                 value={nuevoProducto.nombre}
// // //                 onChange={handleInputChange}
// // //                 isInvalid={!!errors.nombre}
// // //               />
// // //               <Form.Control.Feedback type="invalid">
// // //                 {errors.nombre}
// // //               </Form.Control.Feedback>
// // //             </Form.Group>
// // //             <Form.Group controlId="formDescripcion" className="mb-3">
// // //               <Form.Label>Descripción</Form.Label>
// // //               <Form.Control
// // //                 type="text"
// // //                 name="descripcion"
// // //                 value={nuevoProducto.descripcion}
// // //                 onChange={handleInputChange}
// // //               />
// // //             </Form.Group>
// // //             <Form.Group controlId="formPrecio" className="mb-3">
// // //               <Form.Label>Precio</Form.Label>
// // //               <InputGroup>
// // //                 <InputGroup.Text>$</InputGroup.Text>
// // //                 <Form.Control
// // //                   type="number"
// // //                   name="precio"
// // //                   value={nuevoProducto.precio}
// // //                   onChange={handleInputChange}
// // //                   isInvalid={!!errors.precio}
// // //                 />
// // //                 <Form.Control.Feedback type="invalid">
// // //                   {errors.precio}
// // //                 </Form.Control.Feedback>
// // //               </InputGroup>
// // //             </Form.Group>
// // //             <Form.Group controlId="formStock" className="mb-3">
// // //               <Form.Label>Stock</Form.Label>
// // //               <Form.Control
// // //                 type="number"
// // //                 name="stock"
// // //                 value={nuevoProducto.stock}
// // //                 onChange={handleInputChange}
// // //                 isInvalid={!!errors.stock}
// // //               />
// // //               <Form.Control.Feedback type="invalid">
// // //                 {errors.stock}
// // //               </Form.Control.Feedback>
// // //             </Form.Group>
// // //             <div className="d-flex justify-content-between">
// // //               <Button type="submit" className="btn btn-primary">
// // //                 Agregar Producto
// // //               </Button>
// // //               <Button
// // //                 type="button"
// // //                 className="btn btn-secondary"
// // //                 onClick={clearForm}
// // //               >
// // //                 Limpiar
// // //               </Button>
// // //             </div>
// // //           </Form>
// // //         </Col>
// // //         <Col lg={6} className="mb-4">
// // //           <h2>Lista de Productos</h2>
// // //           {productos.length === 0 ? (
// // //             <Alert variant="info">No hay productos disponibles.</Alert>
// // //           ) : (
// // //             <ListGroup>
// // //               {productos.map((producto) => (
// // //                 <ListGroup.Item
// // //                   key={producto.id}
// // //                   className="d-flex justify-content-between align-items-center"
// // //                 >
// // //                   <div>
// // //                     <h5>{producto.nombre}</h5>
// // //                     <p>{producto.descripcion}</p>
// // //                     <p>Precio: ${producto.precio}</p>
// // //                     <p>Stock: {producto.stock}</p>
// // //                     <Badge
// // //                       bg={producto.estado === "activo" ? "success" : "secondary"}
// // //                     >
// // //                       {producto.estado}
// // //                     </Badge>
// // //                   </div>
// // //                   <div className="d-flex align-items-center">
// // //                     <Button
// // //                       variant="warning"
// // //                       onClick={() => startEditing(producto)}
// // //                       className="me-2"
// // //                     >
// // //                       Editar
// // //                     </Button>
// // //                     <Button
// // //                       variant={
// // //                         producto.estado === "activo" ? "danger" : "success"
// // //                       }
// // //                       onClick={() =>
// // //                         toggleProductoState(producto.id, producto.estado)
// // //                       }
// // //                       className="me-2"
// // //                     >
// // //                       {producto.estado === "activo" ? "Desactivar" : "Activar"}
// // //                     </Button>
// // //                     <Button
// // //                       variant="danger"
// // //                       onClick={() => deleteProducto(producto.id)}
// // //                     >
// // //                       Eliminar
// // //                     </Button>
// // //                   </div>
// // //                 </ListGroup.Item>
// // //               ))}
// // //             </ListGroup>
// // //           )}
// // //         </Col>
// // //       </Row>

// // //       {/* Modal para Editar Producto */}
// // //       <Modal show={showEditModal} onHide={handleCloseEditModal}>
// // //         <Modal.Header closeButton>
// // //           <Modal.Title>Editar Producto</Modal.Title>
// // //         </Modal.Header>
// // //         <Modal.Body>
// // //           <Form
// // //             onSubmit={(e) => {
// // //               e.preventDefault();
// // //               updateProducto(editingProduct);
// // //             }}
// // //           >
// // //             <Form.Group controlId="formEditNombre" className="mb-3">
// // //               <Form.Label>Nombre</Form.Label>
// // //               <Form.Control
// // //                 type="text"
// // //                 name="nombre"
// // //                 value={productoEditado.nombre}
// // //                 onChange={handleEditInputChange}
// // //                 isInvalid={!!errors.nombre}
// // //               />
// // //               <Form.Control.Feedback type="invalid">
// // //                 {errors.nombre}
// // //               </Form.Control.Feedback>
// // //             </Form.Group>
// // //             <Form.Group controlId="formEditDescripcion" className="mb-3">
// // //               <Form.Label>Descripción</Form.Label>
// // //               <Form.Control
// // //                 type="text"
// // //                 name="descripcion"
// // //                 value={productoEditado.descripcion}
// // //                 onChange={handleEditInputChange}
// // //               />
// // //             </Form.Group>
// // //             <Form.Group controlId="formEditPrecio" className="mb-3">
// // //               <Form.Label>Precio</Form.Label>
// // //               <InputGroup>
// // //                 <InputGroup.Text>$</InputGroup.Text>
// // //                 <Form.Control
// // //                   type="number"
// // //                   name="precio"
// // //                   value={productoEditado.precio}
// // //                   onChange={handleEditInputChange}
// // //                   isInvalid={!!errors.precio}
// // //                 />
// // //                 <Form.Control.Feedback type="invalid">
// // //                   {errors.precio}
// // //                 </Form.Control.Feedback>
// // //               </InputGroup>
// // //             </Form.Group>
// // //             <Form.Group controlId="formEditStock" className="mb-3">
// // //               <Form.Label>Stock</Form.Label>
// // //               <Form.Control
// // //                 type="number"
// // //                 name="stock"
// // //                 value={productoEditado.stock}
// // //                 onChange={handleEditInputChange}
// // //                 isInvalid={!!errors.stock}
// // //               />
// // //               <Form.Control.Feedback type="invalid">
// // //                 {errors.stock}
// // //               </Form.Control.Feedback>
// // //             </Form.Group>
// // //             <div className="d-flex justify-content-end">
// // //               <Button type="submit" className="btn btn-primary">
// // //                 Actualizar Producto
// // //               </Button>
// // //               <Button
// // //                 type="button"
// // //                 className="btn btn-secondary ms-2"
// // //                 onClick={handleCloseEditModal}
// // //               >
// // //                 Cancelar
// // //               </Button>
// // //             </div>
// // //           </Form>
// // //         </Modal.Body>
// // //       </Modal>
// // //     </Container>
// // //   );
// // // };

// // // export default ProductoCrud;

    
// // //     // import React, { useState, useEffect } from "react";
// // //     // import {
// // //     // Form,
// // //     // InputGroup,
// // //     // Container,
// // //     // Row,
// // //     // Col,
// // //     // Button,
// // //     // ListGroup,
// // //     // Alert,
// // //     // Badge,
// // //     // } from "react-bootstrap";
// // //     // import Config from "../Config"; 

// // //     // const ProductoCrud = () => {
// // //     // const [productos, setProductos] = useState([]);
// // //     // const [nuevoProducto, setNuevoProducto] = useState({
// // //     //     empresa_id: 1,
// // //     //     nombre: "",
// // //     //     descripcion: "",
// // //     //     precio: "",
// // //     //     stock: "",
// // //     //     estado: "activo",
// // //     // });
// // //     // const [errors, setErrors] = useState({});

// // //     // useEffect(() => {
// // //     //     fetchProductos();
// // //     // }, []);

// // //     // const fetchProductos = async () => {
// // //     //     try {
// // //     //     const response = await Config.getProductos();
// // //     //     setProductos(response.data);
// // //     //     } catch (error) {
// // //     //     console.error("Error al cargar productos:", error);
// // //     //     }
// // //     // };

// // //     // const handleInputChange = (event) => {
// // //     //     const { name, value } = event.target;
// // //     //     setNuevoProducto((prevProducto) => ({
// // //     //     ...prevProducto,
// // //     //     [name]: value,
// // //     //     }));
// // //     // };

// // //     // const validateForm = () => {
// // //     //     const newErrors = {};
// // //     //     if (!nuevoProducto.nombre) newErrors.nombre = "El nombre es requerido";
// // //     //     if (!nuevoProducto.precio || nuevoProducto.precio <= 0) newErrors.precio = "El precio debe ser mayor a 0";
// // //     //     if (!nuevoProducto.stock || nuevoProducto.stock <= 0) newErrors.stock = "El stock debe ser mayor a 0";
// // //     //     setErrors(newErrors);
// // //     //     return Object.keys(newErrors).length === 0;
// // //     // };

// // //     // const addProducto = async () => {
// // //     //     if (!validateForm()) return;
// // //     //     try {
// // //     //     console.log("Datos para agregar producto:", nuevoProducto);
// // //     //     await Config.createProducto(nuevoProducto);
// // //     //     fetchProductos();
// // //     //     clearForm();
// // //     //     } catch (error) {
// // //     //     if (error.response) {
// // //     //         setErrors(error.response.data.errors || {});
// // //     //     }
// // //     //     console.error("Error al agregar producto:", error);
// // //     //     }
// // //     // };

// // //     // const updateProducto = async (id) => {
// // //     //     if (!validateForm()) return;
// // //     //     try {
// // //     //     console.log("Datos para actualizar producto:", nuevoProducto);
// // //     //     await Config.updateProducto(id, nuevoProducto);
// // //     //     fetchProductos();
// // //     //     clearForm();
// // //     //     } catch (error) {
// // //     //     if (error.response) {
// // //     //         setErrors(error.response.data.errors || {});
// // //     //     }
// // //     //     console.error("Error al actualizar producto:", error);
// // //     //     }
// // //     // };

// // //     // const toggleProductoState = async (id, currentState) => {
// // //     //     try {
// // //     //     const updatedProducto = {
// // //     //         ...productos.find((prod) => prod.id === id),
// // //     //         estado: currentState === "activo" ? "inactivo" : "activo",
// // //     //     };
// // //     //     console.log("Datos para desactivar/activar producto:", updatedProducto);
// // //     //     await Config.updateProducto(id, updatedProducto);
// // //     //     fetchProductos();
// // //     //     } catch (error) {
// // //     //     console.error("Error al cambiar estado del producto:", error);
// // //     //     }
// // //     // };

// // //     // const deleteProducto = async (id) => {
// // //     //     try {
// // //     //     await Config.deleteProducto(id);
// // //     //     fetchProductos();
// // //     //     } catch (error) {
// // //     //     console.error("Error al eliminar producto:", error);
// // //     //     }
// // //     // };

// // //     // const clearForm = () => {
// // //     //     setNuevoProducto({
// // //     //     empresa_id: 1,
// // //     //     nombre: "",
// // //     //     descripcion: "",
// // //     //     precio: "",
// // //     //     stock: "",
// // //     //     estado: "activo",
// // //     //     });
// // //     //     setErrors({});
// // //     // };

// // //     // return (
// // //     //     <Container>
// // //     //     <h1 className="text-center my-4">CRUD de Productos</h1>
// // //     //     <Row>
// // //     //         <Col lg={6} className="mb-4">
// // //     //         <h2>Agregar Producto</h2>
// // //     //         <Form
// // //     //             onSubmit={(e) => {
// // //     //             e.preventDefault();
// // //     //             addProducto();
// // //     //             }}
// // //     //         >
// // //     //             <Form.Group controlId="formNombre" className="mb-3">
// // //     //             <Form.Label>Nombre</Form.Label>
// // //     //             <Form.Control
// // //     //                 type="text"
// // //     //                 name="nombre"
// // //     //                 value={nuevoProducto.nombre}
// // //     //                 onChange={handleInputChange}
// // //     //                 isInvalid={!!errors.nombre}
// // //     //             />
// // //     //             <Form.Control.Feedback type="invalid">
// // //     //                 {errors.nombre}
// // //     //             </Form.Control.Feedback>
// // //     //             </Form.Group>
// // //     //             <Form.Group controlId="formDescripcion" className="mb-3">
// // //     //             <Form.Label>Descripción</Form.Label>
// // //     //             <Form.Control
// // //     //                 type="text"
// // //     //                 name="descripcion"
// // //     //                 value={nuevoProducto.descripcion}
// // //     //                 onChange={handleInputChange}
// // //     //             />
// // //     //             </Form.Group>
// // //     //             <Form.Group controlId="formPrecio" className="mb-3">
// // //     //             <Form.Label>Precio</Form.Label>
// // //     //             <InputGroup>
// // //     //                 <InputGroup.Text>$</InputGroup.Text>
// // //     //                 <Form.Control
// // //     //                 type="number"
// // //     //                 name="precio"
// // //     //                 value={nuevoProducto.precio}
// // //     //                 onChange={handleInputChange}
// // //     //                 isInvalid={!!errors.precio}
// // //     //                 />
// // //     //                 <Form.Control.Feedback type="invalid">
// // //     //                 {errors.precio}
// // //     //                 </Form.Control.Feedback>
// // //     //             </InputGroup>
// // //     //             </Form.Group>
// // //     //             <Form.Group controlId="formStock" className="mb-3">
// // //     //             <Form.Label>Stock</Form.Label>
// // //     //             <Form.Control
// // //     //                 type="number"
// // //     //                 name="stock"
// // //     //                 value={nuevoProducto.stock}
// // //     //                 onChange={handleInputChange}
// // //     //                 isInvalid={!!errors.stock}
// // //     //             />
// // //     //             <Form.Control.Feedback type="invalid">
// // //     //                 {errors.stock}
// // //     //             </Form.Control.Feedback>
// // //     //             </Form.Group>
// // //     //             <div className="d-flex justify-content-between">
// // //     //             <Button type="submit" className="btn btn-primary">
// // //     //                 Agregar Producto
// // //     //             </Button>
// // //     //             <Button
// // //     //                 type="button"
// // //     //                 className="btn btn-secondary"
// // //     //                 onClick={clearForm}
// // //     //             >
// // //     //                 Limpiar
// // //     //             </Button>
// // //     //             </div>
// // //     //         </Form>
// // //     //         </Col>
// // //     //         <Col lg={6} className="mb-4">
// // //     //         <h2>Lista de Productos</h2>
// // //     //         {productos.length === 0 ? (
// // //     //             <Alert variant="info">No hay productos disponibles.</Alert>
// // //     //         ) : (
// // //     //             <ListGroup>
// // //     //             {productos.map((producto) => (
// // //     //                 <ListGroup.Item
// // //     //                 key={producto.id}
// // //     //                 className="d-flex justify-content-between align-items-center"
// // //     //                 >
// // //     //                 <div>
// // //     //                     <h5>{producto.nombre}</h5>
// // //     //                     <p>{producto.descripcion}</p>
// // //     //                     <p>Precio: ${producto.precio}</p>
// // //     //                     <p>Stock: {producto.stock}</p>
// // //     //                     <Badge
// // //     //                     bg={producto.estado === "activo" ? "success" : "secondary"}
// // //     //                     >
// // //     //                     {producto.estado}
// // //     //                     </Badge>
// // //     //                 </div>
// // //     //                 <div className="d-flex align-items-center">
// // //     //                     <Button
// // //     //                     variant={
// // //     //                         producto.estado === "activo" ? "danger" : "success"
// // //     //                     }
// // //     //                     onClick={() =>
// // //     //                         toggleProductoState(producto.id, producto.estado)
// // //     //                     }
// // //     //                     >
// // //     //                     {producto.estado === "activo" ? "Desactivar" : "Activar"}
// // //     //                     </Button>
// // //     //                     <Button
// // //     //                     variant="danger"
// // //     //                     onClick={() => deleteProducto(producto.id)}
// // //     //                     >
// // //     //                     Eliminar
// // //     //                     </Button>
// // //     //                 </div>
// // //     //                 </ListGroup.Item>
// // //     //             ))}
// // //     //             </ListGroup>
// // //     //         )}
// // //     //         </Col>
// // //     //     </Row>
// // //     //     </Container>
// // //     // );
// // //     // };

// // //     // export default ProductoCrud;
