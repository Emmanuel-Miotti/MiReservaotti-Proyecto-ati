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
} from "react-icons/md";
import "../../css/Login.css";
import axios from "axios";

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
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (getToken()) {
      navigate("/");
    }
  });

  useEffect(() => {
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content");
    if (csrfToken) {
      axios.defaults.headers.common["X-CSRF-TOKEN"] = csrfToken;
    } else {
      console.warn("CSRF token not found in meta tag");
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!name) newErrors.name = "El campo nombre es obligatorio.";
    if (!email) newErrors.email = "El campo correo electrónico es obligatorio.";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email =
        "El campo correo electrónico debe ser una dirección de correo válida.";
    if (!password) newErrors.password = "El campo contraseña es obligatorio.";
    else if (password.length < 8)
      newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
    if (cellphone && !/^\d+$/.test(cellphone))
      newErrors.cellphone = "El teléfono solo debe contener números.";
    if (!address) newErrors.address = "El campo dirección es obligatorio.";
    if (!categoria_id) newErrors.categoria_id = "El campo categoría es obligatorio.";
    return newErrors;
  };

  const submitRegistro = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      await Config.registerEmpresa({
        name,
        email,
        password,
        cellphone,
        address,
        categoria_id,
        url,
      });
      console.log("Registro exitoso");
      console.log("name", name, "email", email, "password", password, "cellphone", cellphone, "address", address, "category", categoria_id, "url", url);
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
          setErrors(data2.errors || {});
        }
      }
    } catch (error) {
      if (error.response) {
        const { data } = error.response;
        setErrors(data.errors || {});
      }
    }
    console.log("name", name, "email", email, "password", password, "cellphone", cellphone, "address", address, "category", categoria_id, "url", url);
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

              <Form.Label htmlFor="basic-url">Nombre y apellido</Form.Label>
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
              <Form.Label htmlFor="basic-url">Correo electrónico</Form.Label>
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

              <Form.Label htmlFor="basic-url">Contraseña</Form.Label>
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

              <Form.Label htmlFor="basic-url">Confirmar Contraseña</Form.Label>
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

              <Form.Label htmlFor="basic-url">Teléfono</Form.Label>
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

              <Form.Label htmlFor="basic-url">Dirección</Form.Label>
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

              <Form.Label htmlFor="basic-url">Categoría</Form.Label>
              <InputGroup className="mb-4">
                <InputGroup.Text id="basic-addon1">
                  <MdOutlineBusinessCenter />
                </InputGroup.Text>
                <FloatingLabel
                  controlId="floatingSelectGrid"
                  label=" ¿Qué tipo de negocio tienes?"
                >
                  <Form.Select
                    aria-label="Floating label select example"
                    value={categoria_id}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    isInvalid={!!errors.categoria_id}
                  >
                    <option value="">Selecciona tu tipo de negocio</option>
                    <option value="1">Barbería</option>
                    <option value="2">
                      Centro de Estética
                    </option>
                    <option value="3">Centro Deportivo</option>
                    {/* <option value="4">Centro Médico</option>
                    <option value="Clínica">Clínica</option>
                    <option value="Clínica Odontológica">
                      Clínica Odontológica
                    </option>
                    <option value="Consultorio">Consultorio</option>
                    <option value="Crossfit">Crossfit</option>
                    <option value="Danza / Baile">Danza / Baile</option>
                    <option value="Entrenamiento Funcional">
                      Entrenamiento Funcional
                    </option>
                    <option value="Estudio de Pilates">
                      Estudio de Pilates
                    </option>
                    <option value="Estudio de Yoga">Estudio de Yoga</option>
                    <option value="Estudio de Entrenamiento Personal">
                      Estudio de Entrenamiento Personal
                    </option>
                    <option value="Estudio de Entrenamiento Funcional">
                      Estudio de Entrenamiento Funcional
                    </option>
                    <option value="Maquillaje">Maquillaje</option>
                    <option value="Medicina Alternativa">
                      Medicina Alternativa
                    </option>
                    <option value="Peluquería">Peluquería</option>
                    <option value="Personal Trainer">Personal Trainer</option>
                    <option value="Psicólogo">Psicólogo</option>
                    <option value="Salón de Belleza">Salón de Belleza</option>
                    <option value="Salón de Cejas y Pestañas">
                      Salón de Cejas y Pestañas
                    </option>
                    <option value="Salón de Manicura y Pedicura">
                      Salón de Manicura y Pedicura
                    </option>
                    <option value="Salón de Masajes">Salón de Masajes</option>
                    <option value="Salón de Tatuajes">Salón de Tatuajes</option>
                    <option value="Spa">Spa</option>
                    <option value="Veterinaria">Veterinaria</option> */}
                    <option value="Otro">Otro</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.categoria_id}
                  </Form.Control.Feedback>
                </FloatingLabel>
              </InputGroup>

              <Form.Label htmlFor="basic-url">URL</Form.Label>
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

              <div className="d-grid">
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
