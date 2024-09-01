// import React, { useState, useEffect } from "react";
// import Config from "../Config";
// import { useNavigate, useParams } from "react-router-dom";
// import Form from "react-bootstrap/Form";
// import InputGroup from "react-bootstrap/InputGroup";
// import { MdOutlineEmail } from "react-icons/md";
// import { IoKeyOutline } from "react-icons/io5";
// import "../../css/Login.css";
// import AuthUser from "./AuthUser";
// import axios from "axios";
// import NavBar from "../components/Navbar.jsx";

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
//     profile_picture: null,
//   });
//   const [foto, setFoto] = useState({});
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (getToken()) {
//       fetchCliente();
//     }
//   }, []); 

//   const fetchCliente = async () => {
//     try {
//       const token = getToken();
//       if (!token) {
//         throw new Error("Token not found");
//       }
  
//       const response = await Config.getCliente(`${id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
  
//       const data = response.data.data;
//       setClient({
//         name: data.name || "",
//         email: data.email || "",
//         password: "",
//         password_confirmation: "",
//         cellphone: data.cellphone || "",
//         profile_picture: data.profile_picture || null,
//       });
      

//       setFoto(data.profile_picture);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching client:", error);
//     }
//   };

//   const handleChange = (e) => {
//     if (e.target.name === "profile_picture") {
//       setClient({
//         ...client,
//         profile_picture: e.target.files[0],
//       });
//     } else {
//       setClient({
//         ...client,
//         [e.target.name]: e.target.value,
//       });
//     }
//   };

//   const handleRemovePicture = () => {
//     setClient({
//       ...client,
//       profile_picture: null,
//     });
//   };

//   const submitUpdate = async (e) => {
//     e.preventDefault();
//     setErrors({});
  
//     const formData = new FormData();
  
//     if (client.name) formData.append("name", client.name);
//     if (client.email) formData.append("email", client.email);
//     if (client.password) {
//       formData.append("password", client.password);
//       formData.append("password_confirmation", client.password_confirmation);
//     }
//     if (client.cellphone) formData.append("cellphone", client.cellphone);


    
//     if (client.profile_picture !== null) {
//       if(foto !==client.profile_picture) {
//         formData.append("profile_picture", client.profile_picture);
//       }
//     } else {
//       formData.append("remove_picture", true);  // Indicador para eliminar la imagen
//       console.log("entroamos")
//     }

//     console.log(client.profile_picture)
  
//     try {
//       const token = getToken();
//       if (!token) throw new Error("Token not found");
  
//       const response = await axios.post(`${Config.url()}/cliente/${id}`, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       navigate(`/perfil-cliente`);
//     } catch (error) {
//       if (error.response) {
//         const { data } = error.response;
//         setErrors(data.errors || {});
//       } else {
//         console.error("Error al modificar cliente:", error);
//       }
//     }
//   };
  
//   if (loading) {
//     return <div>Cargando...</div>;
//   }

//   return (
//     <>
//     <NavBar />
//     <div className="auth-card-container">
//       <div className="auth-card">
//         <div className="col-sm-12">
//           <div className="mt-2">
//             <div className="card-body" id="demo-form">
//               <h1 className="auth-card-title text-center fw-bolder">
//                 EDITAR CLIENTE
//               </h1>
//               <p className="auth-card-title text-center fw-bolder">Llene solo los campos que quiera editar</p>
//               <Form onSubmit={submitUpdate}>
//                 <Form.Group className="mb-3" controlId="formName">
//                   <Form.Label>Nombre *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Ingresa tu nombre"
//                     name="name"
//                     value={client.name || ""}
//                     onChange={handleChange}
//                     isInvalid={!!errors.name}
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.name}
//                   </Form.Control.Feedback>
//                 </Form.Group>

//                 <Form.Group className="mb-3" controlId="formEmail">
//                   <Form.Label>Correo electrónico *</Form.Label>
//                   <InputGroup>
//                     <InputGroup.Text>
//                       <MdOutlineEmail />
//                     </InputGroup.Text>
//                     <Form.Control
//                       // type="email"
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
//                 <Form.Group className="mb-3" controlId="formPasswordConfirmation">
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
//                 <Form.Group className="mb-3" controlId="formProfilePicture">
//                   <Form.Label>Foto de Perfil</Form.Label>
//                   <Form.Control
//                     type="file"
//                     accept="image/*"
//                     name="profile_picture"
//                     onChange={handleChange} 
//                     isInvalid={!!errors.profile_picture}
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {errors.profile_picture}
//                   </Form.Control.Feedback>
//                   {client.profile_picture && (
//                     <div>
//                       <button type="button" onClick={handleRemovePicture} className="btn btn-danger mt-2">
//                         Eliminar foto actual
//                       </button>
//                       <span>  Si no quieres tener foto de perfil </span>
//                     </div>
//                   )}
//                 </Form.Group>
//                 <div className="d-grid">
//                   <button type="submit" className="btn btn-primary mb-3">
//                     Actualizar Cliente
//                   </button>
//                   <button
//                     type="button"
//                     className="btn btn-secondary "
//                     onClick={() => navigate("/Cliente")}
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
//     </>
//   );
// };

// export default EditClient;


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
import NavBar from "../components/Navbar.jsx";

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
  const [foto, setFoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

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
  
      const response = await Config.getCliente(`${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = response.data.data;
      setClient({
        name: data.name || "",
        email: data.email || "",
        password: "",
        password_confirmation: "",
        cellphone: data.cellphone || "",
        profile_picture: data.profile_picture || null,
      });
      setFoto(data.profile_picture);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching client:", error);
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

  const handleRemovePicture = () => {
    setClient({
      ...client,
      profile_picture: null,
    });
  };

  const handleRemoveCellphone = () => {
    setClient({
      ...client,
      cellphone: "",
    });
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    setErrors({});
  
    const formData = new FormData();
  
    if (client.name) formData.append("name", client.name);
    if (client.email) formData.append("email", client.email);
    if (client.password) {
      formData.append("password", client.password);
      formData.append("password_confirmation", client.password_confirmation);
    }
    if (client.cellphone) {
      formData.append("cellphone", client.cellphone);
    } else {
      formData.append("remove_cellphone", true);  // Indicador para eliminar el número de teléfono
    }

    if (client.profile_picture !== null) {
      if(foto !== client.profile_picture) {
        formData.append("profile_picture", client.profile_picture);
      }
    } else {
      formData.append("remove_picture", true);  // Indicador para eliminar la imagen
    }

    try {
      const token = getToken();
      if (!token) throw new Error("Token not found");
  
      const response = await axios.post(`${Config.url()}/cliente/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response)
      localStorage.setItem("usuario", JSON.stringify(response.data.cliente));


      
      navigate(`/perfil-cliente`);
    } catch (error) {
      if (error.response) {
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
    <>
    <NavBar />
    <div className="auth-card-container">
      <div className="auth-card">
        <div className="col-sm-12">
          <div className="mt-2">
            <div className="card-body" id="demo-form">
              <h1 className="auth-card-title text-center fw-bolder">
                EDITAR CLIENTE
              </h1>
              <p className="auth-card-title text-center fw-bolder">Llene solo los campos que quiera editar</p>
              <Form onSubmit={submitUpdate}>
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label>Nombre *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu nombre"
                    name="name"
                    value={client.name || ""}
                    onChange={handleChange}
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Correo electrónico *</Form.Label>
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
                <Form.Group className="mb-3" controlId="formPasswordConfirmation">
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
                  {client.cellphone && (
                    <div>
                    <button type="button" onClick={handleRemoveCellphone} className="btn btn-danger mt-2">
                      Eliminar celular
                    </button>
                    <span>  Si no quieres tener un telefono  </span>
                    </div>
                  )}
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
                    <div>
                      <button type="button" onClick={handleRemovePicture} className="btn btn-danger mt-2">
                        Eliminar foto actual
                      </button>
                      <span>  Si no quieres tener foto de perfil </span>
                    </div>
                  )}
                </Form.Group>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary mb-3">
                    Actualizar Cliente
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary "
                    onClick={() => navigate("/Cliente")}
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
    </>
  );
};

export default EditClient;
