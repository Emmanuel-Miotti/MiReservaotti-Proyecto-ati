// import React, { useState, useEffect } from "react";
// import { Container, Row, Col, Button, Form } from "react-bootstrap";
// import { FaEdit, FaSignOutAlt, FaArrowLeft, FaCamera } from "react-icons/fa";
// import AuthUser from "../pageauth/AuthUser";
// import { useNavigate } from "react-router-dom";
// import Config from "../Config";
// import NavBar from "../components/Navbar.jsx";
// import { getFullURL } from "../../utils/utils"; // Asegúrate de importar la función correctamente

// const PagePerfil = () => {
//   const { getToken, getUser } = AuthUser();
//   const navigate = useNavigate();

  
//   const user = getUser();
//   const defaultPhoto = "https://via.placeholder.com/150";
//   const [photo, setPhoto] = useState(user && user.profile_picture ? getFullURL(user.profile_picture) : defaultPhoto);
//   const [user1, setCliente] = useState({
//     name: "",
//     email: "",
//     password: "",
//     password_confirmation: "",
//     cellphone: "",
//     profile_picture: defaultPhoto,
//   });
  

//   useEffect(() => {
//     if (getToken()) {
//       fetchCliente();
//     }
//   }, []); // Dependencias del useEffect

//   const fetchCliente = async () => {
//     try {
//       const token = getToken();
//       if (!token) {
//         throw new Error("Token not found");
//       }

//       const response = await Config.getCliente(`${user.id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setCliente(response.data.data);
//       if (response.data.data.profile_picture) {
//         setPhoto(getFullURL(response.data.data.profile_picture));
//       }
//     } catch (error) {
//       console.error("Error fetching client:", error);
//       navigate("/");
//     }
//   };

//   const editarCliente = () => {
//     navigate(`/edit-client/${user.id}`);
//   };

//   const logoutUser = () => {
//     localStorage.clear();
//     sessionStorage.clear();
//     navigate("/");
//   };

//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPhoto(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   return (
//     <>
//       <NavBar />
//       <Container className="perfil-empresa mt-4 justify-content-center">
//         <Row className="align-items-center">
//           <Col xs={12} md={4} className="text-center">



//             <div className="position-relative">
//               <img
//                 src={photo}
//                 alt="Perfil de Cliente"
//                 className="img-fluid rounded-circle mb-3"
//                 style={{ width: "150px", height: "150px", objectFit: "cover" }}
//               />
//               <Form.Group controlId="formFile" className="position-absolute" style={{ bottom: "10px", right: "10px" }}>
//                 <Form.Label className="btn btn-secondary btn-sm rounded-circle">
//                   <FaCamera />
//                   <Form.Control type="file" accept="image/*" onChange={handlePhotoChange} hidden />
//                 </Form.Label>
//               </Form.Group>
//             </div>

            
//           </Col>
//           <Col xs={12} md={8}>
//             <h1>Perfil Cliente</h1>
//             {user1 ? (
//               <>
//                 <h2>{user1.name}</h2>
//                 {/* <p>ID: {user1.id}</p> */}
//                 <p>Email: {user1.email}</p>
//                 <p>Teléfono: {user1.cellphone}</p>
//               </>
//             ) : (
//               <p>Cargando datos del perfil...</p>
//             )}
//             <div className="d-grid gap-2 d-md-flex justify-content-md-start mt-5">
//               <Button variant="primary" onClick={editarCliente}>
//                 <FaEdit className="me-2" /> Editar Perfil
//               </Button>
//               <Button variant="danger" onClick={logoutUser}>
//                 <FaSignOutAlt className="me-2" /> Cerrar Sesión
//               </Button>
//               <Button variant="secondary" onClick={() => navigate("/cliente")}>
//                 <FaArrowLeft className="me-2" /> Volver
//               </Button>
//             </div>
//           </Col>
//         </Row>
//       </Container>
//     </>
//   );
// };

// export default PagePerfil;
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import { FaEdit, FaSignOutAlt, FaArrowLeft, FaCamera } from "react-icons/fa";
import AuthUser from "../pageauth/AuthUser";
import { useNavigate } from "react-router-dom";
import Config from "../Config";
import NavBar from "../components/Navbar.jsx";
import { getFullURL } from "../../utils/utils"; 

const PagePerfil = () => {
  const { getToken, getUser } = AuthUser();
  const navigate = useNavigate();
  const user = getUser();
  const defaultPhoto = "https://via.placeholder.com/150";
  const [photo, setPhoto] = useState(user && user.profile_picture ? getFullURL(user.profile_picture) : defaultPhoto);
  const [user1, setCliente] = useState({
    name: "",
    email: "",
    cellphone: "",
    profile_picture: defaultPhoto,
  });

  useEffect(() => {
    if (getToken()) {
      fetchCliente();
    }
  }, []);

  const fetchCliente = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Token not found");
      }

      const response = await Config.getCliente(`${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCliente(response.data.data);
      if (response.data.data.profile_picture) {
        setPhoto(getFullURL(response.data.data.profile_picture));
      }
    } catch (error) {
      console.error("Error fetching client:", error);
      navigate("/");
    }
  };

  const editarCliente = () => {
    navigate(`/edit-client/${user.id}`);
  };

  const logoutUser = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <NavBar />
      <Container className="mt-4 d-flex justify-content-center">
        <Card className="shadow-sm" style={{ width: '100%', maxWidth: '600px' }}>
          <Card.Body className="text-center">

          <h1 className="mt-3">Perfil Cliente</h1>

            <div className="position-relative">
              <img
                src={photo}
                alt="Perfil de Cliente"
                className="img-fluid rounded-circle mb-3"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
              <Form.Group controlId="formFile" className="position-absolute" style={{ bottom: "10px", right: "10px" }}>
                {/* <Form.Label className="btn btn-secondary btn-sm rounded-circle"> */}
                  {/* <FaCamera /> */}
                  {/* <Form.Control type="file" accept="image/*" onChange={handlePhotoChange} hidden /> */}
                {/* </Form.Label> */}
              </Form.Group>
            </div>
            
            {user1 ? (
              <>
                <h2>{user1.name}</h2>
                {user1.email && <p>Email: {user1.email}</p>}
                {user1.cellphone && <p>Teléfono: {user1.cellphone}</p>}
              </>
            ) : (
              <p>Cargando datos del perfil...</p>
            )}
          </Card.Body>
          <Card.Footer className="text-center">
            <div className="d-grid gap-2">
              <Button variant="primary" onClick={editarCliente}>
                <FaEdit className="me-2" /> Editar Perfil
              </Button>
              <Button variant="danger" onClick={logoutUser}>
                <FaSignOutAlt className="me-2" /> Cerrar Sesión
              </Button>
              <Button variant="secondary" onClick={() => navigate("/cliente")}>
                <FaArrowLeft className="me-2" /> Volver
              </Button>
            </div>
          </Card.Footer>
        </Card>
      </Container>
    </>
  );
};

export default PagePerfil;
