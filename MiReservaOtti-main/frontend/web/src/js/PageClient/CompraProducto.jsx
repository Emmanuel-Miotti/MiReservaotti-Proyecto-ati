
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, ListGroup, Form, Image, Card, Modal, Table } from "react-bootstrap";
import { getFullURL } from '../../utils/utils';
import Config from "../Config"; // Asegúrate de que esta ruta sea correcta para tu estructura de archivos

const ProductosCompra = () => {
    const [productos, setProductos] = useState([]);
    const [cantidades, setCantidades] = useState({});
    const [carrito, setCarrito] = useState({});

        const [cliente, setCliente] = useState(null);
    const [idCliente, setIdCliente] = useState(null);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    const [mostrarModal, setMostrarModal] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

        // Crear un objeto URL
    const url = new URL(window.location.href);
    // Obtener el último segmento de la ruta, que en este caso es la ID
    const empresaId = url.pathname.split("/").pop();

    useEffect(() => {
        fetchProductos();
                const usuario = localStorage.getItem("usuario");
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
    }, [empresaId]);

    const fetchProductos = async () => {
        try {
            const response = await Config.getProductosEmpresa(1); // Ajusta según tu configuración real
            setProductos(response.data);
            const initialCantidades = {};
            response.data.forEach(producto => {
                initialCantidades[producto.id] = 1;
            });
            setCantidades(initialCantidades);
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    };

    const handleCantidadChange = (productoId, value) => {
        const cantidad = Number(value);
        setCantidades(prev => ({
            ...prev,
            [productoId]: cantidad
        }));
    };

    const agregarAlCarrito = (productoId) => {
        const producto = productos.find(p => p.id === productoId);
        setCarrito(current => ({
            ...current,
            [productoId]: {
                cantidad: cantidades[productoId],
                nombre: producto.nombre,
                precio: producto.precio,
                subtotal: cantidades[productoId] * producto.precio
            }
        }));
    };

    const confirmarCompra = () => {
        setMostrarModal(true);
    };

    const realizarCompra = async () => {
        setMostrarModal(false); 
        // const response = await Config.comprarProducto(idCliente, empresaId, carrito);
        // console.log(response);
        console.log(cliente)  
        console.log(idCliente)  
        console.log(carrito)
        console.log(empresaId)

        const url = 'http://127.0.0.1:8000/api/v1/compras'; // URL de la API
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        const body = JSON.stringify({
            cliente_id: idCliente,
            empresa_id: empresaId,
            productos: Object.entries(carrito).map(([id, cantidad]) => ({
                id: id,
                cantidad: cantidades[id]
            }))
        });
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: body
            });
            const data = await response.json();
            console.log(data);  // Muestra la respuesta del servidor en la consola
            if (response.ok) {
                setMensaje("Compra realizada con éxito!");
                setCarrito({}); // Limpiar carrito
            } else {
                throw new Error(data.message || "Error al realizar la compra");
            }
        } catch (error) {
            console.error('Error al realizar la compra:', error);
        }

        // El código para realizar la compra va aquí

    };

    const iniciarPago = async () => {
        const items = Object.entries(carrito).map(([id, data]) => {
            return {
                title: data.nombre,
                quantity: data.cantidad,
                unit_price: data.precio,
            };
        });
    
        const data = {
            items: items,
            back_urls: {
                success: "http://localhost:3000/login", // URL a la que se redirige tras un pago exitoso
                failure: "http://localhost:3000/registerxs", // URL a la que se redirige tras un fallo de pago
                pending: "http://localhost:3000/register111"  // URL a la que se redirige si el pago queda pendiente
            },
            auto_return: "approved",  // Opcional: redirige automáticamente solo tras pagos aprobados
            // Añade aquí cualquier otra información relevante para la preferencia
        };
    
        console.log(data)
        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/mercadopago/create_preference', {
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

    
    // const iniciarPago = async () => {
    //     const data = { title: 'Nombre del Producto', price: 100 }; // Ajusta según tus necesidades
    //     const response = await fetch('http://127.0.0.1:8000/api/v1/mercadopago/create_preference', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(data),
    //     });
    //     const responseData = await response.json();
    //     if (response.ok) {
    //         window.location.href = responseData.init_point; // Redirecciona al checkout de MercadoPago
    //     } else {
    //         console.error('Error al crear la preferencia de pago:', responseData);
    //     }
    // };

    return (
        <Container>
            <Row>
                <Col md={8}>
                    <h2 className="mb-3">Productos</h2>
                    <ListGroup>
                        {productos.map(producto => (
                            <ListGroup.Item key={producto.id} className="p-3">
                                <Card>
                                    <Card.Body>
                                        <Row>
                                            <Col md={8}>
                                                <Card.Title>{producto.nombre}</Card.Title>
                                                <Card.Text>{producto.descripcion}</Card.Text>
                                                <Card.Text>Precio: ${producto.precio}</Card.Text>
                                                <div className="d-flex align-items-center">
                                                    <Form.Control
                                                        type="number"
                                                        min="1"
                                                        max={producto.stock}
                                                        value={cantidades[producto.id]}
                                                        onChange={e => handleCantidadChange(producto.id, e.target.value)}
                                                        style={{ width: '60px', marginRight: '10px' }}
                                                    />
                                                    <Button onClick={() => agregarAlCarrito(producto.id)}>Agregar</Button>
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                {producto.foto_url && (
                                                    <Image src={getFullURL(producto.foto_url)} thumbnail style={{ width: '100%', maxWidth: '150px' }} />
                                                )}
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>
                <Col md={4}>
                    <h2 className="mb-3">Carrito</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(carrito).map(([id, data]) => (
                                <tr key={id}>
                                    <td>{data.nombre}</td>
                                    <td>{data.cantidad}</td>
                                    <td>${data.precio}</td>
                                    <td>${data.subtotal}</td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan="3">Total</td>
                                <td>${Object.values(carrito).reduce((acc, item) => acc + item.subtotal, 0)}</td>
                            </tr>
                        </tbody>
                    </Table>
                    <Button variant="success" className="mt-3" onClick={confirmarCompra}>Comprar</Button>
                    <Button onClick={iniciarPago}>Pagar con MercadoPago</Button>

                </Col>
            </Row>

            <Modal show={mostrarModal} onHide={() => setMostrarModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Compra</Modal.Title>
                </Modal.Header>
                <Modal.Body>¿Estás seguro de que deseas realizar esta compra?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setMostrarModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={realizarCompra}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={!!mensaje || !!error} onHide={() => {
                setMensaje("");
                setError("");
            }}>
                <Modal.Header closeButton>
                    <Modal.Title>{error ? "Error" : "Éxito"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{error || mensaje}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setMensaje("");
                        setError("");
                    }}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ProductosCompra;


//  import Config from "../Config"; 
//  import React, { useState, useEffect } from "react";
// import { Container, Row, Col, Button, ListGroup, Form, Image, Card, Modal } from "react-bootstrap";
// import { getFullURL } from '../../utils/utils';

// const ProductosCompra = () => {
//     const [productos, setProductos] = useState([]);
//     const [cantidades, setCantidades] = useState({});
//     const [carrito, setCarrito] = useState({});

//     const [cliente, setCliente] = useState(null);
//     const [idCliente, setIdCliente] = useState(null);
//     const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

//     const [mostrarModal, setMostrarModal] = useState(false);
//     const [mensaje, setMensaje] = useState("");
//     const [error, setError] = useState("");

//     // Crear un objeto URL
//     const url = new URL(window.location.href);
//     // Obtener el último segmento de la ruta, que en este caso es la ID
//     const empresaId = url.pathname.split("/").pop();


//     useEffect(() => {
//         fetchProductos();
//         const usuario = localStorage.getItem("usuario");
//         if (usuario) {
//             const usuarioData = JSON.parse(usuario);
//             setCliente({
//                 nombre: usuarioData.name,
//                 email: usuarioData.email,
//                 telefono: usuarioData.cellphone || "",
//             });
//             setIdCliente(usuarioData.id);
//             setIsUserLoggedIn(true);
//         }
//     }, [empresaId]);

//     const fetchProductos = async () => {
//         try {
//             const response = await Config.getProductosEmpresa(1);
//             setProductos(response.data);
//             const initialCantidades = {};
//             response.data.forEach(producto => {
//                 initialCantidades[producto.id] = 1;
//             });
//             setCantidades(initialCantidades);
//         } catch (error) {
//             console.error("Error al cargar productos:", error);
//         }
//     };

//     const handleCantidadChange = (productoId, value) => {
//         setCantidades(prev => ({
//             ...prev,
//             [productoId]: Number(value)
//         }));
//     };

//     const agregarAlCarrito = (productoId) => {
//         setCarrito(current => ({
//             ...current,
//             [productoId]: cantidades[productoId]
//         }));
//     };

//     const realizarCompra = async () => {
//         setMostrarModal(false); 
//         // const response = await Config.comprarProducto(idCliente, empresaId, carrito);
//         // console.log(response);
//         console.log(cliente)  
//         console.log(idCliente)  
//         console.log(carrito)
//         console.log(empresaId)

//         const url = 'http://127.0.0.1:8000/api/v1/compras'; // URL de la API
//         const headers = {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json'
//         };
//         const body = JSON.stringify({
//             cliente_id: idCliente,
//             empresa_id: empresaId,
//             productos: Object.entries(carrito).map(([id, cantidad]) => ({
//                 id: id,
//                 cantidad: cantidad
//             }))
//         });
    
//         try {
//             const response = await fetch(url, {
//                 method: 'POST',
//                 headers: headers,
//                 body: body
//             });
//             const data = await response.json();
//             console.log(data);  // Muestra la respuesta del servidor en la consola
//             if (response.ok) {
//                 setMensaje("Compra realizada con éxito!");
//                 setCarrito({}); // Limpiar carrito
//             } else {
//                 throw new Error(data.message || "Error al realizar la compra");
//             }
//         } catch (error) {
//             console.error('Error al realizar la compra:', error);
//         }

//         // El código para realizar la compra va aquí

//     };

//     const confirmarCompra = () => {
//         setMostrarModal(true);
//     };

    

//     return (
//         <Container>
//             <Row>
//                 <Col md={8}>
//                     <h2 className="mb-3">Productos</h2>
//                     <ListGroup>
//                         {productos.map(producto => (
//                             <ListGroup.Item key={producto.id} className="p-3">
//                                 <Card>
//                                     <Card.Body>
//                                         <Row>
//                                             <Col md={8}>
//                                                 <Card.Title>{producto.nombre}</Card.Title>
//                                                 <Card.Text>{producto.descripcion}</Card.Text>
//                                                 <Card.Text>Precio: ${producto.precio}</Card.Text>
//                                                 <div className="d-flex align-items-center">
//                                                     <Form.Control
//                                                         type="number"
//                                                         min="1"
//                                                         max={producto.stock}
//                                                         value={cantidades[producto.id]}
//                                                         onChange={e => handleCantidadChange(producto.id, e.target.value)}
//                                                         style={{ width: '60px', marginRight: '10px' }}
//                                                     />
//                                                     <Button onClick={() => agregarAlCarrito(producto.id)}>Agregar</Button>
//                                                 </div>
//                                             </Col>
//                                             <Col md={4}>
//                                                 {producto.foto_url && (
//                                                     <Image src={getFullURL(producto.foto_url)} thumbnail style={{ width: '100%', maxWidth: '150px' }} />
//                                                 )}
//                                             </Col>
//                                         </Row>
//                                     </Card.Body>
//                                 </Card>
//                             </ListGroup.Item>
//                         ))}
//                     </ListGroup>
//                 </Col>
//                 <Col md={4}>
//                     <h2 className="mb-3">Carrito</h2>
//                     <ListGroup>
//                         {Object.entries(carrito).map(([id, cantidad]) => (
//                             <ListGroup.Item key={id}>
//                                 {productos.find(p => p.id.toString() === id)?.nombre} - Cantidad: {cantidad}
//                             </ListGroup.Item>
//                         ))}
//                     </ListGroup>
//                     <Button variant="success" className="mt-3" onClick={realizarCompra}>Comprar</Button>
//                 </Col>
//             </Row>

//             <Modal show={mostrarModal} onHide={() => setMostrarModal(false)}>
//                 <Modal.Header closeButton>
//                     <Modal.Title>Confirmar Compra</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>¿Estás seguro de que deseas realizar esta compra?</Modal.Body>
//                 <Modal.Footer>
//                     <Button variant="secondary" onClick={() => setMostrarModal(false)}>
//                         Cancelar
//                     </Button>
//                     <Button variant="primary" onClick={realizarCompra}>
//                         Confirmar
//                     </Button>
//                 </Modal.Footer>
//             </Modal>
//             <Modal show={!!mensaje || !!error} onHide={() => {
//                 setMensaje("");
//                 setError("");
//             }}>
//                 <Modal.Header closeButton>
//                     <Modal.Title>{error ? "Error" : "Éxito"}</Modal.Title>
//                 </Modal.Header>
//                 <Modal.Body>{error || mensaje}</Modal.Body>
//                 <Modal.Footer>
//                     <Button variant="secondary" onClick={() => {
//                         setMensaje("");
//                         setError("");
//                     }}>
//                         Cerrar
//                     </Button>
//                 </Modal.Footer>
//             </Modal>
//             <Button variant="success" className="mt-3" onClick={confirmarCompra}>Comprar</Button>
       
//         </Container>
//     );
// };

// export default ProductosCompra;



// // import React, { useState, useEffect } from "react";
// // import { Container, Row, Col, Button, ListGroup, Form, Image, Card } from "react-bootstrap";
// // import { getFullURL } from '../../utils/utils'; // Función para obtener URLs completas de imágenes

// // const ProductosCompra = ({ empresaId }) => {
// //     const [productos, setProductos] = useState([]);
// //     const [carrito, setCarrito] = useState({});

// //     useEffect(() => {
// //         fetchProductos();
// //     }, [empresaId]);

// //     const fetchProductos = async () => {
// //         try {
// //           const response = await Config.getProductosEmpresa(1);
// //           //         // const data = await response.json();
// //                    setProductos(response.data); // Asumiendo que la API devuelve un objeto con una propiedad 'productos'
// //         } catch (error) {
// //             console.error("Error al cargar productos:", error);
// //         }
// //     };

// //     const agregarAlCarrito = (productoId, cantidad = 1) => {
// //         setCarrito(current => ({
// //             ...current,
// //             [productoId]: (current[productoId] || 0) + cantidad
// //         }));
// //     };

// //     const realizarCompra = async () => {
// //         // El código para realizar la compra va aquí
// //     };

// //     return (
// //         <Container>
// //             <Row>
// //                 <Col md={8}>
// //                     <h2 className="mb-3">Productos</h2>
// //                     <ListGroup>
// //                         {productos.map(producto => (
// //                             <ListGroup.Item key={producto.id} className="p-3">
// //                                 <Card>
// //                                     <Card.Body>
// //                                         <Row>
                                            
// //                                             <Col md={8}>
// //                                                 <Card.Title>{producto.nombre}</Card.Title>
// //                                                 <Card.Text>{producto.descripcion}</Card.Text>
// //                                                 <Card.Text>Precio: ${producto.precio}</Card.Text>
// //                                                 <div className="d-flex align-items-center">
// //                                                     <Form.Control
// //                                                         type="number"
// //                                                         min="1"
// //                                                         defaultValue="1"
// //                                                         onChange={e => agregarAlCarrito(producto.id, parseInt(e.target.value))}
// //                                                         style={{ width: '60px', marginRight: '10px' }}
// //                                                     />
// //                                                     <Button onClick={() => agregarAlCarrito(producto.id)}>Agregar</Button>
// //                                                 </div>
// //                                             </Col>
// //                                             <Col md={4}>
// //                                                 {producto.foto_url && (
// //                                                     <Image src={getFullURL(producto.foto_url)} thumbnail style={{ width: '100%', maxWidth: '150px' }} />
// //                                                 )}
// //                                             </Col>
// //                                         </Row>
// //                                     </Card.Body>
// //                                 </Card>
// //                             </ListGroup.Item>
// //                         ))}
// //                     </ListGroup>
// //                 </Col>
// //                 <Col md={4}>
// //                     <h2 className="mb-3">Carrito</h2>
// //                     <ListGroup>
// //                         {Object.entries(carrito).map(([id, cantidad]) => (
// //                             <ListGroup.Item key={id}>
// //                                 {productos.find(p => p.id.toString() === id)?.nombre} - Cantidad: {cantidad}
// //                             </ListGroup.Item>
// //                         ))}
// //                     </ListGroup>
// //                     <Button variant="success" className="mt-3" onClick={realizarCompra}>Comprar</Button>
// //                 </Col>
// //             </Row>
// //         </Container>
// //     );
// // };

// // export default ProductosCompra;


// // // import React, { useState, useEffect } from "react";
// // // import { Container, Row, Col, Button, ListGroup, Form } from "react-bootstrap";
// // // import Config from "../Config"; 

// // // const ProductosCompra = ({ empresaId }) => {
// // //     const [productos, setProductos] = useState([]);
// // //     const [carrito, setCarrito] = useState({});

// // //     useEffect(() => {
// // //         fetchProductos();
// // //     }, []);

// // //     const fetchProductos = async () => {
// // //       const response = await Config.getProductosEmpresa(1);
// // //         // const data = await response.json();
// // //         setProductos(response.data);
// // //     };

// // //     const agregarAlCarrito = (productoId, cantidad) => {
// // //         setCarrito(current => ({
// // //             ...current,
// // //             [productoId]: (current[productoId] || 0) + cantidad
// // //         }));
// // //     };

// // //     const realizarCompra = async () => {
// // //         const compra = {
// // //             cliente_id: 1, // Aquí debería ir el ID del cliente obtenido de la sesión o estado global
// // //             empresa_id: empresaId,
// // //             productos: Object.entries(carrito).map(([id, cantidad]) => ({
// // //                 id,
// // //                 cantidad
// // //             }))
// // //         };

// // //         const response = await fetch('/api/compras', {
// // //             method: 'POST',
// // //             headers: { 'Content-Type': 'application/json' },
// // //             body: JSON.stringify(compra)
// // //         });

// // //         if (response.ok) {
// // //             console.log('Compra realizada con éxito');
// // //             setCarrito({}); // Limpiar el carrito después de la compra
// // //         } else {
// // //             console.error('Error al realizar la compra');
// // //         }
// // //     };

// // //     return (
// // //         <Container>
// // //             <Row>
// // //                 <Col sm={8}>
// // //                     <h2>Productos</h2>
// // //                     <ListGroup>
// // //                         {productos.map(producto => (
// // //                             <ListGroup.Item key={producto.id}>
// // //                                 <div className="d-flex justify-content-between align-items-center">
// // //                                     <div>
// // //                                         <h5>{producto.nombre}</h5>
// // //                                         <p>${producto.precio}</p>
// // //                                     </div>
// // //                                     <Form.Control
// // //                                         type="number"
// // //                                         min="1"
// // //                                         defaultValue="1"
// // //                                         onChange={e => agregarAlCarrito(producto.id, parseInt(e.target.value))}
// // //                                     />
// // //                                     <Button onClick={() => agregarAlCarrito(producto.id, 1)}>Agregar</Button>
// // //                                 </div>
// // //                             </ListGroup.Item>
// // //                         ))}
// // //                     </ListGroup>
// // //                 </Col>
// // //                 <Col sm={4}>
// // //                     <h2>Carrito</h2>
// // //                     <ListGroup>
// // //                         {Object.entries(carrito).map(([id, cantidad]) => (
// // //                             <ListGroup.Item key={id}>
// // //                                 {productos.find(p => p.id.toString() === id)?.nombre} - Cantidad: {cantidad}
// // //                             </ListGroup.Item>
// // //                         ))}
// // //                     </ListGroup>
// // //                     <Button variant="primary" onClick={realizarCompra}>Comprar</Button>
// // //                 </Col>
// // //             </Row>
// // //         </Container>
// // //     );
// // // };

// // // export default ProductosCompra;



// // // // import React, { useState, useEffect } from 'react';
// // // // import axios from 'axios';
// // // // import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
// // // // import Config from "../Config"; 
// // // // import AuthUser from "../pageauth/AuthUser";

// // // // const ProductosEmpresa = ({ empresaId }) => {
// // // //   const [productos, setProductos] = useState([]);
// // // //   const [carrito, setCarrito] = useState([]);
// // // //   const [cantidad, setCantidad] = useState(1);

// // // //   useEffect(() => {
// // // //     fetchProductos();
// // // //   }, []);

// // // //   const fetchProductos = async () => {
// // // //     try {
        
// // // //         const response = await Config.getProductosEmpresa(1);
// // // //       console.log(response);
// // // //       setProductos(response.data);
// // // //     } catch (error) {
// // // //       console.error('Error al cargar productos:', error);
// // // //     }
// // // //   };

// // // //   const agregarAlCarrito = (producto) => {
// // // //     const itemExistente = carrito.find(item => item.id === producto.id);
// // // //     if (itemExistente) {
// // // //       const updatedCarrito = carrito.map(item =>
// // // //         item.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item
// // // //       );
// // // //       setCarrito(updatedCarrito);
// // // //     } else {
// // // //       const newItem = { ...producto, cantidad };
// // // //       setCarrito([...carrito, newItem]);
// // // //     }
// // // //     setCantidad(1); // Reinicia la cantidad a 1 después de agregar al carrito
// // // //   };

// // // //   const handleSubmitCompra = async (e) => {
// // // //     e.preventDefault();
// // // //     try {
// // // //       await axios.post('http://localhost:8000/api/v1/compras', {
// // // //         cliente_id: 1, // ID del cliente que realiza la compra (ajusta según tu lógica)
// // // //         empresa_id: empresaId,
// // // //         productos: carrito.map(item => ({ id: item.id, cantidad: item.cantidad }))
// // // //       });
// // // //       alert('Compra realizada con éxito!');
// // // //       setCarrito([]);
// // // //     } catch (error) {
// // // //       console.error('Error al realizar la compra:', error);
// // // //     }
// // // //   };

// // // //   return (
// // // //     <Container className="my-4">
// // // //       <h2 className="text-center mb-4">Productos Disponibles</h2>
// // // //       <Row>
// // // //         {productos.map(producto => (
// // // //           <Col key={producto.id} md={4} className="mb-4">
// // // //             <Card>
// // // //               <Card.Body>
// // // //                 <Card.Title>{producto.nombre}</Card.Title>
// // // //                 <Card.Text>
// // // //                   Descripción: {producto.descripcion}<br />
// // // //                   Precio: ${producto.precio}<br />
// // // //                   Stock disponible: {producto.stock}
// // // //                 </Card.Text>
// // // //                 <Form onSubmit={() => agregarAlCarrito(producto)}>
// // // //                   <Form.Group controlId="formCantidad">
// // // //                     <Form.Label>Cantidad</Form.Label>
// // // //                     <Form.Control
// // // //                       type="number"
// // // //                       value={cantidad}
// // // //                       onChange={(e) => setCantidad(Number(e.target.value))}
// // // //                     />
// // // //                   </Form.Group>
// // // //                   <Button variant="primary" type="submit">Agregar al Carrito</Button>
// // // //                 </Form>
// // // //               </Card.Body>
// // // //             </Card>
// // // //           </Col>
// // // //         ))}
// // // //       </Row>
// // // //       {carrito.length > 0 && (
// // // //         <div className="mt-4">
// // // //           <h3>Carrito de Compras</h3>
// // // //           <ul>
// // // //             {carrito.map(item => (
// // // //               <li key={item.id}>
// // // //                 {item.nombre} - Cantidad: {item.cantidad}
// // // //               </li>
// // // //             ))}
// // // //           </ul>
// // // //           <Button onClick={handleSubmitCompra}>Realizar Compra</Button>
// // // //         </div>
// // // //       )}
// // // //     </Container>
// // // //   );
// // // // };

// // // // export default ProductosEmpresa;
