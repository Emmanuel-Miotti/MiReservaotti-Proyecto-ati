import React, { useEffect, useState } from "react";
import Config from "../Config";
import { useNavigate } from "react-router-dom";
import AuthUser from "./AuthUser";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { MdOutlineEmail, MdOutlineCall } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { IoKeyOutline } from "react-icons/io5";
import "../../css/Login.css";

const RegisterClient = () => {
  const { getToken } = AuthUser();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (getToken()) {
      navigate("/");
    }
  });

  const validateForm = () => {
    const newErrors = {};
    if (!name) newErrors.name = "El nombre es obligatorio";
    if (!email) newErrors.email = "El correo electrónico es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "El correo electrónico no es válido";
    if (!password) newErrors.password = "La contraseña es obligatoria";
    else if (password.length < 8)
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    if (!confirmPassword)
      newErrors.confirmPassword =
        "La confirmación de contraseña es obligatoria";
    else if (password !== confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    if (cellphone && !/^\d+$/.test(cellphone))
      newErrors.cellphone = "El teléfono solo debe contener números";
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
      await Config.registerCliente({
        name,
        email,
        password,
        cellphone,
      });

      try {
        const response = await Config.login({ email, password });
        const data2 = response.data;
        if (data2.token) {
          sessionStorage.setItem("token", data2.token);
          localStorage.setItem("token", data2.token);
          localStorage.setItem("usuario", JSON.stringify(data2.usuario));
          localStorage.setItem("rol", data2.rol);
          navigate("/Cliente");
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
  };

  return (
    <div className="auth-card-container">
      <div className="auth-card">
        <div className="col-sm-12">
          <div className="mt-5">
            <div className="card-body" id="demo-form">
              <h1 className="auth-card-title text-center fw-bolder">
                REGISTRO CLIENTE
              </h1>
              <p className="auth-card-title text-center">
                ¡Únete a MiReservaOtti hoy mismo!
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

              <Form.Label htmlFor="basic-url">Confirmar contraseña</Form.Label>
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

              <div className="d-grid">
                <button onClick={submitRegistro} className="btn btn-success">
                  Crear cuenta
                </button>
              </div>
              <hr />
              <p className="auth-card-footer tect-center">
                Registrate como EMPRESA{" "}
                <a className="text-dark" href="/register-empresa">
                  aquí
                </a>
              </p>
              <hr />
              <div className="auth-card-footer">
                <p className="text-center">
                  ¿Ya tienes cuenta?{" "}
                  <a className="text-dark" href="/login">
                    Iniciar sesión
                  </a>
                </p>
                <p className="text-center">
                  <a className="text-dark" href="/forget-password">
                    ¿Olvidaste tu contraseña?
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

export default RegisterClient;
