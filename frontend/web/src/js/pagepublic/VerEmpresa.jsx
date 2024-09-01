import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Carousel,
  ListGroup,
  ListGroupItem,
} from "react-bootstrap";
import { BsFillPersonLinesFill, BsStarFill } from "react-icons/bs";
import Config from "../Config";
import "../../css/Home.css";
import { useNavigate } from "react-router-dom";
import AuthUser from "../pageauth/AuthUser";
import { getFullURL2 } from "../../utils/utils";
import Mapa from "../components/Mapa";
import StarRatingComponent from "react-star-rating-component";
import axios from "axios";

function VerEmpresa() {
  const { getUser, getRol } = AuthUser();
  const user = getUser();
  const [empresa, setEmpresa] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [intervalos, setIntervalos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [productos, setProductos] = useState([]);
  const [disableReview, setDisableReview] = useState(false);
  const [hasReservation, setHasReservation] = useState(false);

  const navigate = useNavigate();

  const url = new URL(window.location.href);
  const empresaId = url.pathname.split("/").pop();

  useEffect(() => {
    obtenerEmpresa();
  }, [empresaId]);

  useEffect(() => {
    if (empresa) {
      obtenerFavoritos();
      obtenerReviews();
      fetchProductos();
      if (user) {
        verificarReserva();
      }
    }
  }, [empresa]);

  const verificarReserva = async () => {
    if (!user) return;
    try {
      const response = await Config.getReservasPorEmpresaYCliente(
        empresa.id,
        user.id
      );

      if (response.data && response.data.data) {
        setHasReservation(response.data.data.length > 0);
      } else {
        setHasReservation(false);
      }
    } catch (error) {
      console.error(
        "Error al verificar la reserva:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const obtenerEmpresa = async () => {
    try {
      const response = await Config.getEmpresaUrl(empresaId);
      const empresaData = response.data.data;

      if (typeof empresaData.gallery === "string") {
        empresaData.gallery = JSON.parse(empresaData.gallery);
      }

      setEmpresa(empresaData);

      const response2 = await Config.getServicesActivosByEmpresa(
        empresaData.id
      );
      setServicios(response2.data);

      const response3 = await Config.getIntervalosEmpresa(empresaData.id);
      setIntervalos(response3.data.data);

      const response4 = await axios.get(
        `${Config.url()}/empresas/${empresaData.id}/productosActivos`
      );
      setProductos(response4.data);
    } catch (error) {
      setError("Error al cargar los datos de la empresa.");
      console.error("Error al cargar los datos:", error);
    }
  };

  const fetchProductos = async () => {
    if (!user) return;
    try {
      const response = await Config.getProductosActivosEmpresa(user.id);
      console.log(response.data);
      setProductos(response.data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  const obtenerReviews = async () => {
    try {
      const response = await Config.getReviewsByEmpresa(empresa.id);
      setReviews(response.data.data);
      console.log(response.data.data);
      if (user) {
        const userReview = response.data.data.find(
          (review) => review.cliente_id === user.id
        );
        if (userReview) {
          setEditingReview(userReview);
          setRating(userReview.rating);
          setComment(userReview.comment);
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error("No se encontraron comentarios para esta empresa.");
        setReviews([]);
      } else {
        console.error("Error al cargar los comentarios:", error.message);
      }
    }
  };

  const obtenerFavoritos = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${Config.url()}/favoritos/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setFavoritos(response.data.data);
    } catch (error) {
      console.error("Error al cargar favoritos:", error.message);
    }
  };

  const toggleFavorito = async () => {
    if (getRol() === "Cliente") {
      if (esFavorito()) {
        eliminarDeFavoritos();
      } else {
        agregarAFavoritos();
      }
    }
  };

  const agregarAFavoritos = async () => {
    try {
      await axios.post(
        `${Config.url()}/favoritos`,
        { empresa_id: empresa.id, cliente_id: user.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      obtenerFavoritos();
    } catch (error) {
      console.error("Error al agregar a favoritos:", error);
    }
  };

  const eliminarDeFavoritos = async () => {
    try {
      const favorito = favoritos.find(
        (favorito) => favorito.empresa_id === empresa.id
      );
      await axios.delete(`${Config.url()}/favoritos/${favorito.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      obtenerFavoritos();
    } catch (error) {
      console.error("Error al eliminar de favoritos:", error);
    }
  };

  const esFavorito = () => {
    return favoritos.some((favorito) => favorito.empresa_id === empresa.id);
  };

  const hacerReserva = () => {
    // if (user) {
    navigate(`/reserva/${empresa.id}`);
    // } else {
    // navigate("/login");
    // }
  };

  const verProductos = () => {
    navigate(`/compra/${empresa.id}`);
  };

  const handleNavigate = () => {
    if (user) {
      if (user.role === "cliente") {
        navigate("/cliente");
      } else if (user.role === "empresa") {
        navigate("/empresa");
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  const handleSelect = (selectedIndex, e) => {
    setSelectedIndex(selectedIndex);
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!user) return;

    if (editingReview) {
      editarReview(editingReview.id);
    } else {
      agregarReview();
    }
    obtenerReviews();
  };

  const agregarReview = async () => {
    try {
      const data = {
        empresa_id: empresa.id,
        cliente_id: user.id,
        rating: rating,
        comment: comment,
      };

      const response = await Config.addReview(data);

      setReviews([...reviews, response.data]);

      setRating(0);
      setComment("");
      setSuccess("Comentario guardado exitosamente.");
      setDisableReview(true);
    } catch (error) {
      setError("Error al enviar el comentario.");
      console.error("Error al enviar el comentario:", error.message);
    }
  };

  const editarReview = async (reviewId) => {
    try {
      const response = await Config.updateReview(reviewId, { rating, comment });
      setReviews(
        reviews.map((review) =>
          review.id === reviewId ? response.data.data : review
        )
      );

      setEditingReview(null);
      setRating(0);
      setComment("");
      setSuccess("Comentario actualizado exitosamente.");
      setDisableReview(true);
    } catch (error) {
      setError("Error al actualizar el comentario.");
      console.error("Error al actualizar el comentario:", error.message);
    }
  };

  const onStarClick = (nextValue) => {
    setRating(nextValue);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / reviews.length;
  };

  const averageRating = calculateAverageRating();

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <div className="text-center mb-4">
            <BsFillPersonLinesFill size={48} />
            <h1>Datos de la Empresa</h1>
          </div>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              variant="success"
              onClose={() => setSuccess(null)}
              dismissible
            >
              {success}
            </Alert>
          )}
          <div className="position-relative bg-white p-4 rounded shadow-sm">
            {user && (
              <BsStarFill
                size={32}
                className="favorite-icon"
                onClick={toggleFavorito}
                color={esFavorito() ? "gold" : "gray"}
                style={{
                  cursor: "pointer",
                  position: "absolute",
                  top: 10,
                  right: 10,
                }}
                title="Agregar o eliminar de favoritos"
              />
            )}

            {empresa ? (
              <>
                <Row className="align-items-center">
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
                    <p>
                      <strong>Nombre:</strong> {empresa.name}
                    </p>

                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ color: "#5b6268" }}>
                        <strong>Calificación: </strong>
                      </span>
                      <StarRatingComponent
                        name="averageRating"
                        starCount={5}
                        value={Math.round(averageRating)}
                        editing={false}
                        renderStarIcon={() => (
                          <span className="fa fa-star"></span>
                        )}
                        starColor="#ffcc00"
                        emptyStarColor="#ccc"
                        className="ml-2"
                      />
                      <span
                        style={{ marginLeft: "8px" }}
                      >{` (${averageRating.toFixed(1)})`}</span>
                    </div>

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
                      {intervalos.length > 0 && servicios.length > 0 ? (
                        <Button
                          variant="success"
                          className="m-2"
                          onClick={hacerReserva}
                        >
                          Reservar
                        </Button>
                      ) : (
                        <span title="La empresa no esta lista para recibir reservas">
                          <Button variant="secondary" className="m-2" disabled>
                            Reservar
                          </Button>
                        </span>
                      )}
                      {productos.length > 0 ? (
  getUser() ? (
    <Button
      variant="warning"
      className="m-2"
      onClick={verProductos}
    >
      Productos
    </Button>
  ) : (
    <span title="Solo los usuarios registrados pueden realizar compras">
      <Button variant="secondary" className="m-2" disabled>
        Productos
      </Button>
    </span>
  )
) : (
  <span title="La empresa no tiene productos a la venta">
    <Button variant="secondary" className="m-2" disabled>
      Productos
    </Button>
  </span>
)}


                      <Button
                        variant="danger"
                        className="m-2"
                        onClick={handleNavigate}
                      >
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
                        <strong>{servicio.nombre}</strong>:{" "}
                        {servicio.description} - ${servicio.precio} - Duración:{" "}
                        {servicio.duracion} minutos
                      </li>
                    ))
                  ) : (
                    <li>No hay servicios disponibles.</li>
                  )}
                </ul>

                {/*   <ListGroup variant="flush">
      {servicios.length > 0 ? (
        servicios.map((servicio) => (
          <ListGroupItem key={servicio.id} className="d-flex justify-content-between align-items-start">
            <div className="ms-2 me-auto">
              <div className="fw-bold">{servicio.nombre}</div>
              <small>{servicio.duracion} min</small>
            </div>
            <span>${servicio.precio}</span>
          </ListGroupItem>
        ))
      ) : (
        <ListGroupItem>No hay servicios disponibles.</ListGroupItem>
      )}
    </ListGroup>*/}

                <hr />
                <h5>Horarios</h5>
                <ul>
                  {intervalos.length > 0 ? (
                    intervalos.map((intervalo) => {
                      const diasSemanaArray = JSON.parse(
                        intervalo.dias_semanas
                      );
                      return (
                        <li key={intervalo.id}>
                          <strong>{diasSemanaArray.join(", ")}</strong>:{" "}
                          {intervalo.hora_inicio.slice(0, 5)} -{" "}
                          {intervalo.hora_fin.slice(0, 5)}
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
                  <Mapa address={empresa.address} />
                </div>

                <hr />
                <h5>Galería de Imágenes</h5>
                <Carousel activeIndex={selectedIndex} onSelect={handleSelect}>
                  {empresa.gallery && empresa.gallery.length > 0 ? (
                    empresa.gallery.map((image, index) => (
                      <Carousel.Item key={index}>
                        <img
                          className="d-block w-100"
                          src={getFullURL2(image)}
                          alt={`Imagen ${index + 1}`}
                        />
                      </Carousel.Item>
                    ))
                  ) : (
                    <p>No hay imágenes en la galería.</p>
                  )}
                </Carousel>

                <hr />
                <div>
                  <h5>Comentarios y Calificaciones</h5>
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="comment-box">
                        {/* <img
                          src="https://via.placeholder.com/50"
                          alt="Perfil"
                          width="50"
                          height="50"
                        /> */}

                        <img
                          // src={
                          //   review.cliente.profile_picture
                          //     ? `${Config.urlFoto()}${review.cliente.profile_picture}`
                          //     : "https://via.placeholder.com/50"
                          // }
                          src={
                            review.cliente && review.cliente.profile_picture
                              ? `${Config.urlFoto()}${
                                  review.cliente.profile_picture
                                }`
                              : "https://via.placeholder.com/50"
                          }
                          alt="Imagen de Usuario"
                          className="img-fluid rounded-circle"
                          style={{ width: "50px", height: "50px" }}
                        />

                        <div className="comment-content">
                          <div className="comment-rating">
                            <strong>
                              {review.cliente ? review.cliente.name : "Cliente"}
                            </strong>
                            <div>
                              <StarRatingComponent
                                name={`rate${review.id}`}
                                starCount={5}
                                value={review.rating}
                                editing={false}
                                renderStarIcon={() => (
                                  <span className="fa fa-star"></span>
                                )}
                                starColor="#ffcc00"
                                emptyStarColor="#ccc"
                                className="ml-2"
                              />
                            </div>
                          </div>
                          <div className="comment-text">{review.comment}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No hay comentarios disponibles.</p>
                  )}
                  {user && user.role === "cliente" ? (
                    hasReservation ? (
                      disableReview ? (
                        <p>{success}</p>
                      ) : (
                        <form onSubmit={handleSubmitReview} className="mt-4">
                          <h5>
                            {editingReview
                              ? "Editar Comentario"
                              : "Añadir Comentario"}
                          </h5>
                          <div className="mb-3">
                            <label>Calificación</label>
                            <StarRatingComponent
                              name="rate1"
                              starCount={5}
                              value={rating}
                              onStarClick={onStarClick}
                              renderStarIcon={() => (
                                <span className="fa fa-star"></span>
                              )}
                              starColor="#ffcc00"
                              emptyStarColor="#ccc"
                              className="star-rating"
                            />
                          </div>
                          <div className="mb-3">
                            <label>Comentario</label>
                            <textarea
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              className="form-control"
                              disabled={disableReview}
                            />
                          </div>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={disableReview}
                          >
                            {editingReview ? "Actualizar" : "Enviar"}
                          </button>
                        </form>
                      )
                    ) : (
                      <p>
                        Debe tener una reserva con la empresa para poder dejar
                        un comentario.
                      </p>
                    )
                  ) : (
                    <p>Debe estar logueado para añadir un comentario.</p>
                  )}
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

export default VerEmpresa;

// import React, { useState, useEffect } from "react";
// import { Container, Row, Col, Button, Image, Alert } from "react-bootstrap";
// import { BsFillPersonLinesFill, BsStarFill } from "react-icons/bs";
// import Config from "../Config";
// import "../../css/Home.css";
// import { useNavigate } from "react-router-dom";
// import AuthUser from "../pageauth/AuthUser";
// import StarRatingComponent from "react-star-rating-component";

// //<<<<<<< Sprint5-Emmanuel2.0
// //function VerEmpresa() {
// //const { getUser } = AuthUser();
// //=======

// function VerEmpresa() {
//   const { getUser, getRol } = AuthUser();

//   const user = getUser();
//   const [empresa, setEmpresa] = useState(null);
//   const [servicios, setServicios] = useState([]);
//   const [intervalos, setIntervalos] = useState([]);
//   const [favoritos, setFavoritos] = useState([]);
//   const [reviews, setReviews] = useState([]);
//   const [rating, setRating] = useState(0);
//   const [comment, setComment] = useState("");
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null); // Estado para el mensaje de éxito
//   const [editingReview, setEditingReview] = useState(null);
//   const [productos, setProductos] = useState([]);
//   const [disableReview, setDisableReview] = useState(false); // Estado para desactivar la edición

//   const navigate = useNavigate();

//   const url = new URL(window.location.href);
//   const empresaId = url.pathname.split("/").pop();

//   // useEffect(() => {
//   //   obtenerEmpresa();
//   // }, [empresaId]);

//   useEffect(() => {
//     obtenerEmpresa();
//     if (empresa) {
//       obtenerFavoritos();
//       obtenerReviews();
//       fetchProductos();
//     }

//     console.log(user)
//   }, [empresa]);

//   const obtenerEmpresa = async () => {
//     try {
//       const response = await Config.getEmpresaUrl(empresaId);
//       setEmpresa(response.data.data);

//       const response2 = await Config.getServicesByEmpresa(
//         response.data.data.id
//       );
//       setServicios(response2.data);

//       const response3 = await Config.getIntervalosEmpresa(
//         response.data.data.id
//       );
//       setIntervalos(response3.data.data);
//     } catch (error) {
//       setError("Error al cargar los datos de la empresa.");
//       console.error("Error al cargar los datos:", error);
//     }
//   };

//   const fetchProductos = async () => {
//     try {
//       const response = await Config.getProductosEmpresa(getUser().id);
//       setProductos(response.data);
//     } catch (error) {
//       console.error("Error al cargar productos:", error);
//     }
//   };

//   const obtenerReviews = async () => {
//     try {
//       const response = await Config.getReviewsByEmpresa(empresa.id);
//       setReviews(response.data.data);
//       const userReview = response.data.data.find(
//         (review) => review.cliente_id === user.id
//       );
//       if (userReview) {
//         setEditingReview(userReview);
//         setRating(userReview.rating);
//         setComment(userReview.comment);
//       }
//     } catch (error) {
//       if (error.response && error.response.status === 404) {
//         console.error("No se encontraron comentarios para esta empresa.");
//         setReviews([]); // Manejo en caso de que no haya comentarios
//       } else {
//         console.error("Error al cargar los comentarios:", error.message);
//       }
//     }
//   };

//   const obtenerFavoritos = async () => {
//     try {
//       const response = await Config.getFavoritosByCliente(user.id);
//       setFavoritos(response.data.data);
//     } catch (error) {
//       console.error("Error al cargar favoritos:", error.message);
//     }
//   };

//   const toggleFavorito = async () => {
//     console.log(getRol());
//     if (getRol() == "Cliente") {
//       console.log("Entramos al rol");
//       if (esFavorito()) {
//         eliminarDeFavoritos();
//       } else {
//         agregarAFavoritos();
//       }
//     }
//   };

//   const agregarAFavoritos = async () => {
//     try {
//       await Config.addFavorito(empresa.id, user.id);
//       obtenerFavoritos();
//     } catch (error) {
//       setError("Error al agregar a favoritos.");
//       console.error("Error al agregar a favoritos:", error.message);
//     }
//   };

//   const eliminarDeFavoritos = async () => {
//     try {
//       const favorito = favoritos.find(
//         (favorito) => favorito.empresa_id === empresa.id
//       );
//       await Config.removeFavorito(favorito.id);
//       obtenerFavoritos();
//     } catch (error) {
//       setError("Error al eliminar de favoritos.");
//       console.error("Error al eliminar de favoritos:", error.message);
//     }
//   };

//   const esFavorito = () => {
//     return favoritos.some((favorito) => favorito.empresa_id === empresa.id);
//   };

//   const hacerReserva = () => {
//     navigate(`/reserva/${empresa.id}`);
//   };

//   const verProductos = () => {
//     navigate(`/compra/${empresa.id}`);
//   };

//   const handleNavigate = () => {
//     if (user) {
//       if (user.role === "cliente") {
//         navigate("/cliente");
//       } else if (user.role === "empresa") {
//         navigate("/empresa");
//       } else {
//         navigate("/");
//       }
//     } else {
//       navigate("/");
//     }
//   };

//   const handleSubmitReview = async (event) => {
//     event.preventDefault();
//     if (editingReview) {
//       editarReview(editingReview.id);
//     } else {
//       agregarReview();
//     }
//   };

//   const agregarReview = async () => {
//     try {
//       console.log("empresa_id:", empresa.id);
//       console.log("cliente_id:", user.id);
//       console.log("rating:", rating);
//       console.log("comment:", comment);

//       // Crear el objeto de datos para enviar
//       const data = {
//         empresa_id: empresa.id,
//         cliente_id: user.id,
//         rating: rating,
//         comment: comment,
//       };

//       console.log("Datos a enviar:", data);

//       // Llamar a la función addReview con los datos correctos
//       const response = await Config.addReview(data);

//       setReviews([...reviews, response.data]);
//       setRating(0);
//       setComment("");
//       setSuccess("Comentario guardado exitosamente."); // Mostrar mensaje de éxito
//       setDisableReview(true); // Desactivar edición y envío de comentarios
//     } catch (error) {
//       console.log(empresa.id, user.id, rating, comment);
//       setError("Error al enviar el comentario.");
//       console.error("Error al enviar el comentario:", error.message);
//     }
//   };

//   const editarReview = async (reviewId) => {
//     try {
//       const response = await Config.updateReview(reviewId, { rating, comment });
//       setReviews(
//         reviews.map((review) =>
//           review.id === reviewId ? response.data.data : review
//         )
//       );
//       setEditingReview(null);
//       setRating(0);
//       setComment("");
//       setSuccess("Comentario actualizado exitosamente."); // Mostrar mensaje de éxito
//       setDisableReview(true); // Desactivar edición y envío de comentarios
//     } catch (error) {
//       setError("Error al actualizar el comentario.");
//       console.error("Error al actualizar el comentario:", error.message);
//     }
//   };

//   const onStarClick = (nextValue) => {
//     setRating(nextValue);
//   };

//   const calculateAverageRating = () => {
//     if (reviews.length === 0) return 0;
//     const total = reviews.reduce((acc, review) => acc + review.rating, 0);
//     return total / reviews.length;
//   };

//   const averageRating = calculateAverageRating();

//   return (
//     <Container className="mt-5">
//       <Row className="justify-content-center">
//         <Col md={8}>
//           <div className="text-center mb-4">
//             <BsFillPersonLinesFill size={48} />
//             <h1>Datos de la Empresa </h1>
//           </div>
//           {error && (
//             <Alert variant="danger" onClose={() => setError(null)} dismissible>
//               {error}
//             </Alert>
//           )}
//           {success && (
//             <Alert
//               variant="success"
//               onClose={() => setSuccess(null)}
//               dismissible
//             >
//               {success}
//             </Alert>
//           )}
//           <div className="position-relative bg-white p-4 rounded shadow-sm">
//             <BsStarFill
//               size={32}
//               className="favorite-icon"
//               onClick={toggleFavorito}
//               color={esFavorito() ? "gold" : "gray"}
//               style={{
//                 cursor: "pointer",
//                 position: "absolute",
//                 top: 10,
//                 right: 10,
//               }}
//               title="Agregar o eliminar de favoritos"
//             />

//             {empresa ? (
//               <>
//                 <Row className="align-items-center">
//                   <Col xs={12} md={4} className="text-center">
//                     <img
//                       // src={getUser().profile_picture ? `http://localhost:8000${empresa.profile_picture}` : 'https://via.placeholder.com/150'}
//                       src={
//                         getUser().profile_picture
//                           ? `${Config.urlFoto()}${empresa.profile_picture}`
//                           : "https://via.placeholder.com/150"
//                       }
//                       // import Config from "../Config";

//                       alt="Imagen de Usuario"
//                       className="img-fluid rounded-circle"
//                       style={{ width: "150px", height: "150px" }}
//                     />
//                   </Col>
//                   <Col xs={12} md={8}>
//                     <div>
//                       <p>Calificacion:</p>
//                       <StarRatingComponent
//                         name="averageRating"
//                         starCount={5}
//                         value={Math.round(averageRating)}
//                         editing={false}
//                         renderStarIcon={() => (
//                           <span className="fa fa-star"></span>
//                         )}
//                         starColor="#ffcc00"
//                         emptyStarColor="#ccc"
//                         className="ml-2"
//                       />
//                       <span>{` (${averageRating.toFixed(1)})`}</span>
//                     </div>
//                     <p>
//                       <strong>Nombre:</strong> {empresa.name}
//                     </p>{" "}
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
//                       {intervalos.length > 0 && servicios.length > 0 ? (
//                         <Button
//                           variant="success"
//                           className="m-2"
//                           onClick={hacerReserva}
//                         >
//                           Reservar
//                         </Button>
//                       ) : (

//                         //<p></p>

//                         <Button variant="secondary" className="m-2" disabled>
//                           Reservar
//                         </Button>
//                       )}
//                       {productos.length > 0 ? (
//                         <Button
//                           variant="warning"
//                           className="m-2"
//                           onClick={verProductos}
//                         >
//                           Productos
//                         </Button>
//                       ) : (

//                         //<p></p>
//                       //)}

//                         <Button variant="secondary" className="m-2" disabled>
//                           Productos
//                         </Button>
//                       )}

//                       <Button
//                         variant="danger"
//                         className="m-2"
//                         onClick={handleNavigate}
//                       >
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
//                         <strong>{servicio.nombre}</strong>:{" "}
//                         {servicio.description} - ${servicio.precio} - Duración:{" "}
//                         {servicio.duracion} minutos
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
//                     intervalos.map((intervalo) => {
//                       const diasSemanaArray = JSON.parse(
//                         intervalo.dias_semanas
//                       );
//                       return (
//                         <li key={intervalo.id}>
//                           <strong>{diasSemanaArray.join(", ")}</strong>:{" "}
//                           {intervalo.hora_inicio.slice(0, 5)} -{" "}
//                           {intervalo.hora_fin.slice(0, 5)}
//                         </li>
//                       );
//                     })
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
//                 <hr />
//                 <div>
//                   <h5>Comentarios y Calificaciones</h5>
//                   {reviews.length > 0 ? (
//                     reviews.map((review) => (
//                       <div key={review.id} className="comment-box">
//                         <img
//                           src="https://via.placeholder.com/50"
//                           alt="Perfil"
//                           width="50"
//                           height="50"
//                         />
//                         <div className="comment-content">
//                           <div className="comment-rating">
//                             <strong>
//                               {review.cliente ? review.cliente.name : "Anónimo"}
//                             </strong>
//                             <p>{review.rating}</p>

//                             <div>
//                               <StarRatingComponent
//                                 name={`rate${review.id}`}
//                                 starCount={5}
//                                 value={review.rating}
//                                 editing={false}
//                                 renderStarIcon={() => (
//                                   <span className="fa fa-star"></span>
//                                 )}
//                                 starColor="#ffcc00"
//                                 emptyStarColor="#ccc"
//                                 className="ml-2"
//                               />
//                             </div>
//                           </div>
//                           <div className="comment-text">{review.comment}</div>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <p>No hay comentarios disponibles.</p>
//                   )}
//                   {user.role === "cliente" ? (

//                     <form onSubmit={handleSubmitReview} className="mt-4">
//                       <h5>
//                         {editingReview
//                           ? "Editar Comentario"
//                           : "Añadir Comentario"}
//                       </h5>
//                       <div className="mb-3">
//                         <label>Calificación</label>
//                         <StarRatingComponent
//                           name="rate1"
//                           starCount={5}
//                           value={rating}
//                           onStarClick={onStarClick}
//                           renderStarIcon={() => (
//                             <span className="fa fa-star"></span>
//                           )}
//                           starColor="#ffcc00"
//                           emptyStarColor="#ccc"
//                           className="star-rating"
//                         />
//                       </div>
//                       <div className="mb-3">
//                         <label>Comentario</label>
//                         <textarea
//                           value={comment}
//                           onChange={(e) => setComment(e.target.value)}
//                           className="form-control"
//                         />
//                       </div>
//                       <button type="submit" className="btn btn-primary">
//                         {editingReview ? "Actualizar" : "Enviar"}
//                       </button>
//                     </form>

//                     /*{ disableReview ? (
//                       <p>{success}</p>
//                     ) : (
//                       <form onSubmit={handleSubmitReview} className="mt-4">
//                         <h5>
//                           {editingReview
//                             ? "Editar Comentario"
//                             : "Añadir Comentario"}
//                         </h5>
//                         <div className="mb-3">
//                           <label>Calificación</label>
//                           <StarRatingComponent
//                             name="rate1"
//                             starCount={5}
//                             value={rating}
//                             onStarClick={onStarClick}
//                             renderStarIcon={() => (
//                               <span className="fa fa-star"></span>
//                             )}
//                             starColor="#ffcc00"
//                             emptyStarColor="#ccc"
//                             className="star-rating"
//                           />
//                         </div>
//                         <div className="mb-3">
//                           <label>Comentario</label>
//                           <textarea
//                             value={comment}
//                             onChange={(e) => setComment(e.target.value)}
//                             className="form-control"
//                             disabled={disableReview} // Desactivar textarea si ya se editó
//                           />
//                         </div>
//                         <button
//                           type="submit"
//                           className="btn btn-primary"
//                           disabled={disableReview} // Desactivar botón si ya se editó
//                         >
//                           {editingReview ? "Actualizar" : "Enviar"}
//                         </button>
//                       </form>
//                     ) }*/

//                   ) : (
//                     <p>Debe estar logueado para añadir un comentario.</p>
//                   )}
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

// export default VerEmpresa;
