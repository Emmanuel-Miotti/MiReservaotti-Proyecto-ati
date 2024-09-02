import React, { useEffect, useState } from "react";
import Config from "../Config";
import { useNavigate } from "react-router-dom";
import AuthUser from "./AuthUser";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import { FaRegUser } from "react-icons/fa";
import { IoKeyOutline } from "react-icons/io5";
import {
  MdOutlineEmail,
  MdOutlineBusinessCenter,
  MdOutlineLocationOn,
  MdOutlineCall,
  // MdOutlineLocationOn,
  MdOutlineLocationCity,
} from "react-icons/md";
import "../../css/Login.css";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";

const RegisterEmpresa = () => {
  const { getToken } = AuthUser();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [url, setUrl] = useState("");
  const [address, setAddress] = useState("");
  const [categoria_id, setCategory] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [departamento_id, setDepartamentoId] = useState("");
  const [ciudad_id, setCiudadId] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [categorias, setCategorias] = useState({});
  const [recaptchaValue, setRecaptchaValue] = useState(null);

  useEffect(() => {
    if (getToken()) {
      navigate("/");
    }
  }, [getToken, navigate]);

  useEffect(() => {
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content");
    if (csrfToken) {
      axios.defaults.headers.common["X-CSRF-TOKEN"] = csrfToken;
    } else {
      console.warn("CSRF token not found in meta tag");
    }

    obtenerCategorias();
    fetchDepartamentos();
  }, []);

  const submitRegistro = async (e) => {
    e.preventDefault();

    if (!recaptchaValue) {
      setErrors({ recaptcha: "Por favor, verifica que no eres un robot." });
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);
    formData.append("cellphone", cellphone);
    formData.append("address", address);
    formData.append("categoria_id", categoria_id);
    formData.append("url", url);
    formData.append("departamento_id", departamento_id);
    formData.append("ciudad_id", ciudad_id);
    if (profilePicture) {
      formData.append("profile_picture", profilePicture);
    }

    console.log(formData);

    try {
      await Config.registerEmpresa(formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      try {
        const response = await Config.login({ email, password });
        const data2 = response.data;
        if (data2.token) {
          sessionStorage.setItem("token", data2.token);
          localStorage.setItem("token", data2.token);
          localStorage.setItem("usuario", JSON.stringify(data2.usuario));
          localStorage.setItem("rol", data2.rol);
          navigate("/Empresa");
        }
      } catch (error) {
        if (error.response) {
          const { data2 } = error.response;
          console.log(error.response);
          setErrors(data2.errors || {});
        }
      }
    } catch (error) {
      if (error.response) {
        console.log(error.response.data);
        setErrors(error.response.data.errors || {});
      }
    }
  };

  function onChange(value) {
    // console.log("Captcha value:", value);
    setRecaptchaValue(value);
  }

  const obtenerCategorias = async () => {
    try {
      const response = await axios.get(`${Config.url()}/categorias`);
      console.log("Categorías:", response.data); // Verifica los datos recibidos
      const categoriasMap = {};
      response.data.forEach((cat) => {
        categoriasMap[cat.id] = cat.name;
      });
      console.log("Mapeo de categorías:", categoriasMap); // Verifica el mapeo
      setCategorias(categoriasMap); // Accede al array de categorías correctamente
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const response = await axios.get(`${Config.url()}/departamentos`);
      setDepartamentos(response.data);
      console.log(departamentos);
    } catch (error) {
      console.error("Error al cargar departamentos:", error);
    }
  };

  const handleDepartamentoChange = async (e) => {
    const selectedDepartamentoId = e.target.value;
    setDepartamentoId(selectedDepartamentoId);

    try {
      const response = await axios.get(
        `${Config.url()}/departamento/ciudades/${selectedDepartamentoId}`
      );
      setCiudades(response.data);
      console.log(ciudades);
    } catch (error) {
      console.error("Error al cargar ciudades:", error);
    }
  };

  return (
    <div className="auth-card-container">
      <div className="auth-card">
        <div className="col-sm-12">
          <div className="mt-5">
            <div className="card-body" id="demo-form">
              <h1 className="auth-card-title text-center fw-bolder">
                REGISTRO EMPRESA
              </h1>
              <p className="auth-card-title text-center">
                ¡Simplifica la gestión de tu empresa con MiReservaOtti!
              </p>

              <Form.Label htmlFor="basic-url">
                Nombre de tu empresa *
              </Form.Label>
              <InputGroup className="mb-4">
                <InputGroup.Text id="basic-addon1">
                  <FaRegUser />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Ingresa tu nombre y apellido"
                  aria-label="name"
                  aria-describedby="basic-addon1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </InputGroup>

              <Form.Group className="mb-3">
                <Form.Label htmlFor="profile_picture">
                  Logo o foto de Perfil
                </Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => setProfilePicture(e.target.files[0])}
                  isInvalid={!!errors.profile_picture}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.profile_picture && errors.profile_picture.join(", ")}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Label htmlFor="basic-url">Correo electrónico *</Form.Label>
              <InputGroup className="input-group mb-4">
                <InputGroup.Text id="basic-addon1">
                  <MdOutlineEmail />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Ingresa tu email"
                  aria-label="Email"
                  aria-describedby="basic-addon1"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </InputGroup>

              <Form.Label htmlFor="basic-url">Contraseña *</Form.Label>
              <InputGroup className="input-group mb-4">
                <InputGroup.Text id="basic-addon1">
                  <IoKeyOutline />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Crea una contraseña"
                  aria-label="password"
                  aria-describedby="basic-addon1"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </InputGroup>

              <Form.Label htmlFor="basic-url">
                Confirmar Contraseña *
              </Form.Label>
              <InputGroup className="input-group mb-4">
                <InputGroup.Text id="basic-addon1">
                  <IoKeyOutline />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Confirma tu contraseña"
                  aria-label="confirmPassword"
                  aria-describedby="basic-addon1"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  isInvalid={!!errors.confirmPassword}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              </InputGroup>
              <Form.Label htmlFor="basic-url">Teléfono *</Form.Label>
              <InputGroup className="mb-4">
                <InputGroup.Text id="basic-addon1">
                  <MdOutlineCall />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Ingresa tu teléfono"
                  aria-label="cellphone"
                  aria-describedby="basic-addon1"
                  value={cellphone}
                  onChange={(e) => setCellphone(e.target.value)}
                  isInvalid={!!errors.cellphone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.cellphone}
                </Form.Control.Feedback>
              </InputGroup>

              <Form.Label htmlFor="basic-url">Departamento *</Form.Label>
              <InputGroup className="mb-1">
                <InputGroup.Text id="basic-addon1">
                  <MdOutlineLocationCity />
                </InputGroup.Text>
                <Form.Select
                  aria-label="Selecciona tu departamento"
                  value={departamento_id}
                  onChange={handleDepartamentoChange}
                  required
                  isInvalid={!!errors.departamento_id}
                >
                  <option value="">Selecciona tu departamento</option>
                  {departamentos.map((departamento) => (
                    <option key={departamento.id} value={departamento.id}>
                      {departamento.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.departamento_id}
                </Form.Control.Feedback>
              </InputGroup>

              <Form.Label htmlFor="basic-url" className="mt-3">
                Ciudad *
              </Form.Label>
              <InputGroup className="mb-1">
                <InputGroup.Text id="basic-addon1">
                  <MdOutlineLocationOn />
                </InputGroup.Text>
                <Form.Select
                  aria-label="Selecciona tu ciudad"
                  value={ciudad_id}
                  onChange={(e) => setCiudadId(e.target.value)}
                  required
                  isInvalid={!!errors.ciudad_id}
                >
                  <option value="">Selecciona tu ciudad</option>
                  {ciudades.map((ciudad) => (
                    <option key={ciudad.id} value={ciudad.id}>
                      {ciudad.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.ciudad_id}
                </Form.Control.Feedback>
              </InputGroup>

              <Form.Label htmlFor="basic-url" className="mt-3">
                Dirección * (Lo mejor detallada para encontrarla en google maps)
              </Form.Label>
              <InputGroup className="mb-4">
                <InputGroup.Text id="basic-addon1">
                  <MdOutlineLocationOn />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Ingresa la dirección de la empresa"
                  aria-label="address"
                  aria-describedby="basic-addon1"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  isInvalid={!!errors.address}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address}
                </Form.Control.Feedback>
              </InputGroup>

              <Form.Label htmlFor="basic-url">Categoría *</Form.Label>
              <InputGroup className="mb-4">
                <InputGroup.Text id="basic-addon1">
                  <MdOutlineBusinessCenter />
                </InputGroup.Text>
                {/* <FloatingLabel
                  controlId="floatingSelectGrid"
                  // label=" ¿Qué tipo de negocio tienes?"
                > */}
                <Form.Select
                  aria-label="Floating label select example"
                  value={categoria_id}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  isInvalid={!!errors.categoria_id}
                >
                  <option value="">¿Qué tipo de negocio tienes?</option>
                  {Object.keys(categorias).map((key) => (
                    <option key={key} value={key}>
                      {categorias[key]}
                    </option>
                  ))}
                  {/* <option value="">Selecciona tu tipo de negocio</option>
                    <option value="1">Barbería</option>
                    <option value="2">Centro de Estética</option>
                    <option value="3">Centro Deportivo</option>
                    <option value="Otro">Otro</option> */}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.categoria_id}
                </Form.Control.Feedback>
                {/* </FloatingLabel> */}
              </InputGroup>

              <Form.Label htmlFor="basic-url">URL *</Form.Label>
              <InputGroup className="mb-4">
                <InputGroup.Text id="basic-addon1">
                  https://www.mireservaotti.com/
                </InputGroup.Text>
                <Form.Control
                  placeholder="NombreEmpresa"
                  aria-label="url"
                  aria-describedby="basic-addon1"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  isInvalid={!!errors.url}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.url}
                </Form.Control.Feedback>
              </InputGroup>


              <div className="d-grid justify-content-center mt-3">
                  <ReCAPTCHA
                    sitekey="6LcjHDQqAAAAANBrjPiy0KBM80oI7Fd6pb_IlaDO"
                    onChange={onChange}
                  />
                  {errors.recaptcha && (
                     <div className="invalid-feedback d-block text-center">
                      {errors.recaptcha}
                    </div>
                  )}
                </div>


                <div className="d-grid mt-3">
                <button onClick={submitRegistro} className="btn btn-success">
                  Crear cuenta
                </button>
              </div>


              <hr />
              <p className="auth-card-footer text-center">
                {" "}
                Registrate como CLIENTE{" "}
                <a href="/register-cliente" className="text-dark">
                  aquí
                </a>{" "}
              </p>
              <hr />
              <div className="auth-card-footer">
                <p className="text-center">
                  ¿Ya tienes cuenta?{" "}
                  <a className="text-dark" href="/login">
                    Iniciar sesión
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterEmpresa;
