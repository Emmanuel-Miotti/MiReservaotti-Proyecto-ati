import React, { useState, useEffect } from "react";
import Config from "../Config";
import { useNavigate, useParams } from "react-router-dom";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { MdOutlineEmail } from "react-icons/md";
import { IoKeyOutline } from "react-icons/io5";
import "../../css/Login.css";
import AuthUser from "../pageauth/AuthUser";
import axios from "axios";
import NavBar from "../components/Navbar.jsx";

const EditEmpresa = () => {
  const { getToken } = AuthUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    cellphone: "",
    address: "",
    categoria_id: "",
    departamento_id: "",
    ciudad_id: "",
    profile_picture: null,
    url: "",
  });
  const [foto, setFoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [categorias, setCategorias] = useState({});

  useEffect(() => {
    if (getToken()) {
      fetchEmpresa();
      obtenerCategorias();
      fetchDepartamentos();
    }
  }, []); 

  const fetchEmpresa = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Token not found");
      }

      const response = await axios.get(`${Config.url()}/verempresa/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data.data;
      setEmpresa({
        name: data.name || "",
        email: data.email || "",
        password: "",
        password_confirmation: "",
        cellphone: data.cellphone || "",
        address: data.address || "",
        categoria_id: data.categoria_id || "",
        departamento_id: data.departamento_id || "",
        ciudad_id: data.ciudad_id || "",
        profile_picture: data.profile_picture || null,
        url: data.url || "",
      });
      setFoto(data.profile_picture);

      // Fetch cities for the initially selected department
      if (data.departamento_id) {
        await fetchCiudades(data.departamento_id);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching empresa:", error);
    }
  };

  const handleChange = (e) => {
    if (e.target.name === "profile_picture") {
      setEmpresa({
        ...empresa,
        profile_picture: e.target.files[0],
      });
    } else {
      setEmpresa({
        ...empresa,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleRemovePicture = () => {
    setEmpresa({
      ...empresa,
      profile_picture: null,
    });
  };

  const handleRemoveCellphone = () => {
    setEmpresa({
      ...empresa,
      cellphone: "",
    });
  };

  const handleDepartamentoChange = async (e) => {
    const selectedDepartamentoId = e.target.value;
    setEmpresa({
      ...empresa,
      departamento_id: selectedDepartamentoId,
      ciudad_id: "", // Resetea la ciudad cuando cambie el departamento
    });

    // Fetch cities for the selected department
    await fetchCiudades(selectedDepartamentoId);
  };

  const fetchCiudades = async (departamentoId) => {
    try {
      const response = await axios.get(
        `${Config.url()}/departamento/ciudades/${departamentoId}`
      );
      setCiudades(response.data);
    } catch (error) {
      console.error("Error al cargar ciudades:", error);
    }
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    setErrors({});
  
    const formData = new FormData();
  
    if (empresa.name) formData.append("name", empresa.name);
    if (empresa.email) formData.append("email", empresa.email);
    if (empresa.password) {
      formData.append("password", empresa.password);
      formData.append("password_confirmation", empresa.password_confirmation);
    }
    if (empresa.cellphone) {
      formData.append("cellphone", empresa.cellphone);
    } else {
      formData.append("remove_cellphone", true);  // Indicador para eliminar el número de teléfono
    }

    if (empresa.address) formData.append("address", empresa.address);
    if (empresa.categoria_id) formData.append("categoria_id", empresa.categoria_id);
    if (empresa.departamento_id) formData.append("departamento_id", empresa.departamento_id);
    if (empresa.ciudad_id) formData.append("ciudad_id", empresa.ciudad_id);
    if (empresa.url) formData.append("url", empresa.url);

    if (empresa.profile_picture !== null) {
      if (foto !== empresa.profile_picture) {
        formData.append("profile_picture", empresa.profile_picture);
      }
    } else {
      formData.append("remove_picture", true);  // Indicador para eliminar la imagen
    }

    try {
      const token = getToken();
      if (!token) throw new Error("Token not found");

      const response = await axios.post(`${Config.url()}/empresa/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      localStorage.setItem("usuario", JSON.stringify(response.data.empresa));

      navigate(`/perfil-empresa`);
    } catch (error) {
      if (error.response) {
        const { data } = error.response;
        setErrors(data.errors || {});
      } else {
        console.error("Error al modificar empresa:", error);
      }
    }
  };


  const obtenerCategorias = async () => {
    try {
        const response = await axios.get(`${Config.url()}/categorias`);
        const categoriasMap = {};
        response.data.forEach((cat) => {
            categoriasMap[cat.id] = cat.name;
        });
        setCategorias(categoriasMap); 
    } catch (error) {
        console.error("Error al cargar categorías:", error);
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const response = await axios.get(`${Config.url()}/departamentos`);
      setDepartamentos(response.data);
    } catch (error) {
      console.error("Error al cargar departamentos:", error);
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
                  EDITAR EMPRESA
                </h1>
                <p className="auth-card-title text-center fw-bolder">Llene solo los campos que quiera editar</p>
                <Form onSubmit={submitUpdate}>
                  <Form.Group className="mb-3" controlId="formName">
                    <Form.Label>Nombre *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ingresa el nombre"
                      name="name"
                      value={empresa.name || ""}
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
                        placeholder="Ingresa el email"
                        name="email"
                        value={empresa.email}
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
                        placeholder="Ingresa la contraseña"
                        name="password"
                        value={empresa.password}
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
                      placeholder="Confirma la contraseña"
                      name="password_confirmation"
                      value={empresa.password_confirmation}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formCellphone">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ingresa el teléfono"
                      name="cellphone"
                      value={empresa.cellphone}
                      onChange={handleChange}
                      isInvalid={!!errors.cellphone}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.cellphone}
                    </Form.Control.Feedback>
                    {empresa.cellphone && (
                      <div>
                        <button type="button" onClick={handleRemoveCellphone} className="btn btn-danger mt-2">
                          Eliminar teléfono
                        </button>
                        <span> Si no quieres tener un teléfono </span>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formAddress">
                    <Form.Label>Dirección *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ingresa la dirección"
                      name="address"
                      value={empresa.address}
                      onChange={handleChange}
                      isInvalid={!!errors.address}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.address}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formCategoria">
                    <Form.Label>Categoría *</Form.Label>
                    <Form.Control
                      as="select"
                      name="categoria_id"
                      value={empresa.categoria_id}
                      onChange={handleChange}
                      isInvalid={!!errors.categoria_id}
                    >
                  <option value="">¿Qué tipo de negocio tienes?</option>
                                  {Object.keys(categorias).map((key) => (
                    <option key={key} value={key}>
                        {categorias[key]}
                    </option>
                ))}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {errors.categoria_id}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formDepartamento">
                    <Form.Label>Departamento *</Form.Label>
                    <Form.Control
                      as="select"
                      name="departamento_id"
                      value={empresa.departamento_id}
                      onChange={handleDepartamentoChange}
                      isInvalid={!!errors.departamento_id}
                    >
    <option value="">Selecciona tu departamento</option>
    {departamentos.map((departamento) => (
      <option key={departamento.id} value={departamento.id}>
        {departamento.name}
      </option>
    ))}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {errors.departamento_id}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formCiudad">
                    <Form.Label>Ciudad *</Form.Label>
                    <Form.Control
                      as="select"
                      name="ciudad_id"
                      value={empresa.ciudad_id}
                      onChange={handleChange}
                      isInvalid={!!errors.ciudad_id}
                      required
                    >
    <option value="">Selecciona tu ciudad</option>
    {ciudades.map((ciudad) => (
      <option key={ciudad.id} value={ciudad.id}>
        {ciudad.name}
      </option>
    ))}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {errors.ciudad_id}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formUrl">
                    <Form.Label>URL *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ingresa la URL"
                      name="url"
                      value={empresa.url}
                      onChange={handleChange}
                      isInvalid={!!errors.url}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.url}
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
                    {empresa.profile_picture && (
                      <div>
                        <button type="button" onClick={handleRemovePicture} className="btn btn-danger mt-2">
                          Eliminar foto actual
                        </button>
                        <span> Si no quieres tener foto de perfil </span>
                      </div>
                    )}
                  </Form.Group>

                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary mb-3">
                      Actualizar Empresa
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate("/Empresa")}
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

export default EditEmpresa;
