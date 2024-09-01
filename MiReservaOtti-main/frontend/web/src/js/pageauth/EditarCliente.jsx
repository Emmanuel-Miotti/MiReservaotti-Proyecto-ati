import React, { useState, useEffect } from "react";
import Config from "../Config";
import { useNavigate, useParams } from "react-router-dom";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { MdOutlineEmail } from "react-icons/md";
import { IoKeyOutline } from "react-icons/io5";
import "../../css/Login.css";
import AuthUser from "./AuthUser";
import axios from "axios";


const EditClient = () => {
  const { getToken } = AuthUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    cellphone: "",
    profile_picture: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    if (getToken()) {
      fetchCliente();
    }
  }, []); // Dependencias del useEffect

  const fetchCliente = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Token not found");
      }

      const response = await Config.getCliente(`${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setClient(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching client:", error);
      navigate("/");
    }
  };

  const handleChange = (e) => {
    if (e.target.name === "profile_picture") {
      setClient({
        ...client,
        profile_picture: e.target.files[0],
      });
    } else {
      setClient({
        ...client,
        [e.target.name]: e.target.value,
      });
    }
  };
  const submitUpdate = async (e) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Token not found");
      }
      await axios.put(`http://127.0.0.1:8000/api/v1/cliente/3`,client);

      // await Config.editCliente(`${id}`, formData, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     "Content-Type": "multipart/form-data",
      //   },
      // });
      navigate(`/perfil-cliente/${id}`);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Si hay un error 429, espera 1 segundo y reintenta
        await new Promise((resolve) => setTimeout(resolve, 1000));
        submitUpdate(e); // Reintentar la función submitUpdate
      } else if (error.response) {
        const { data } = error.response;
        setErrors(data.errors || {});
      } else {
        console.error("Error al modificar cliente:", error);
      }
    }
  };
  

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="auth-card-container">
      <div className="auth-card">
        <div className="col-sm-12">
          <div className="mt-5">
            <div className="card-body" id="demo-form">
              <h1 className="auth-card-title text-center fw-bolder">
                EDITAR CLIENTE
              </h1>
              <Form onSubmit={submitUpdate}>
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu nombre"
                    name="name"
                    value={client.name}
                    onChange={handleChange}
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Correo electrónico</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <MdOutlineEmail />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      placeholder="Ingresa tu email"
                      name="email"
                      value={client.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Contraseña</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <IoKeyOutline />
                    </InputGroup.Text>
                    <Form.Control
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      name="password"
                      value={client.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group
                  className="mb-3"
                  controlId="formPasswordConfirmation"
                >
                  <Form.Label>Confirmar Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirma tu contraseña"
                    name="password_confirmation"
                    value={client.password_confirmation}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formCellphone">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu teléfono"
                    name="cellphone"
                    value={client.cellphone}
                    onChange={handleChange}
                    isInvalid={!!errors.cellphone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.cellphone}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formProfilePicture">
                  <Form.Label>Foto de Perfil</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    name="profile_picture"
                    onChange={handleChange} 
                    isInvalid={!!errors.profile_picture}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.profile_picture}
                  </Form.Control.Feedback>
                  {client.profile_picture && (
                    <img
                      src={URL.createObjectURL(client.profile_picture)}
                      alt="Preview"
                      className="img-fluid mt-2"
                      style={{ maxWidth: "100px" }}
                    />
                  )}
                </Form.Group>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Actualizar Cliente
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/")}
                  >
                    Cancelar
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditClient;


// import React, { useState, useEffect } from "react";
// import Config from "../Config";
// import { useNavigate, useParams } from "react-router-dom";
// import Form from "react-bootstrap/Form";
// import InputGroup from "react-bootstrap/InputGroup";
// import { MdOutlineEmail } from "react-icons/md";
// import { IoKeyOutline } from "react-icons/io5";
// import "../../css/Login.css";
// import AuthUser from "./AuthUser";

// const EditClient = () => {
//   const { getToken } = AuthUser();
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [client, setClient] = useState({
//     name: "",
//     email: "",
//     password: "",
//     password_confirmation: "",
//     cellphone: "",
//   });
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     if (!getToken()) {
//       navigate("/");
//     }

//     Config.getCliente(`${id}`)
//       .then((data) => {
//         console.log(data.data.data);
//         setClient(data.data.data);
//       })
//       .catch((error) => {
//         console.error("Error al obtener cliente:", error);
//       });
//   });

//   const handleChange = (e) => {
//     setClient({
//       ...client,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const submitUpdate = async (e) => {
//     e.preventDefault();
//     setErrors({});

//     try {
//       await Config.editCliente(`${id}`, client);
//       navigate("/");
//     } catch (error) {
//       if (error.response) {
//         const { data } = error.response;
//         setErrors(data.errors || {});
//       }
//     }
//   };

//   return (
//     <div className="auth-card-container">
//       <div className="auth-card">
//         <div className="col-sm-12">
//           <div className="mt-5">
//             <div className="card-body" id="demo-form">
//               <h1 className="auth-card-title text-center fw-bolder">
//                 EDITAR CLIENTE
//               </h1>
//               <Form onSubmit={submitUpdate}>
//                 <Form.Group className="mb-3" controlId="formName">
//                   <Form.Label>Nombre</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Ingresa tu nombre"
//                     name="name"
//                     value={client.name}
//                     onChange={handleChange}
//                     isInvalid={!!errors.name}
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.name}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//                 <Form.Group className="mb-3" controlId="formEmail">
//                   <Form.Label>Correo electrónico</Form.Label>
//                   <InputGroup>
//                     <InputGroup.Text>
//                       <MdOutlineEmail />
//                     </InputGroup.Text>
//                     <Form.Control
//                       type="email"
//                       placeholder="Ingresa tu email"
//                       name="email"
//                       value={client.email}
//                       onChange={handleChange}
//                       isInvalid={!!errors.email}
//                     />
//                     <Form.Control.Feedback type="invalid">
//                       {errors.email}
//                     </Form.Control.Feedback>
//                   </InputGroup>
//                 </Form.Group>
//                 <Form.Group className="mb-3" controlId="formPassword">
//                   <Form.Label>Contraseña</Form.Label>
//                   <InputGroup>
//                     <InputGroup.Text>
//                       <IoKeyOutline />
//                     </InputGroup.Text>
//                     <Form.Control
//                       type="password"
//                       placeholder="Ingresa tu contraseña"
//                       name="password"
//                       value={client.password}
//                       onChange={handleChange}
//                       isInvalid={!!errors.password}
//                     />
//                     <Form.Control.Feedback type="invalid">
//                       {errors.password}
//                     </Form.Control.Feedback>
//                   </InputGroup>
//                 </Form.Group>
//                 <Form.Group
//                   className="mb-3"
//                   controlId="formPasswordConfirmation"
//                 >
//                   <Form.Label>Confirmar Contraseña</Form.Label>
//                   <Form.Control
//                     type="password"
//                     placeholder="Confirma tu contraseña"
//                     name="password_confirmation"
//                     value={client.password_confirmation}
//                     onChange={handleChange}
//                   />
//                 </Form.Group>
//                 <Form.Group className="mb-3" controlId="formCellphone">
//                   <Form.Label>Teléfono</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Ingresa tu teléfono"
//                     name="cellphone"
//                     value={client.cellphone}
//                     onChange={handleChange}
//                     isInvalid={!!errors.cellphone}
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.cellphone}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//                 <div className="d-grid">
//                   <button type="submit" className="btn btn-primary">
//                     Actualizar Cliente
//                   </button>
//                   <button
//                     type="button"
//                     className="btn btn-secondary"
//                     onClick={() => navigate("/")}
//                   >
//                     Cancelar
//                   </button>
//                 </div>
//               </Form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditClient;
