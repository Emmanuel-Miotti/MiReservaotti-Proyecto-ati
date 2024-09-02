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
import ReCAPTCHA from "react-google-recaptcha";

const RegisterClient = () => {
  const { getToken } = AuthUser();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [recaptchaValue, setRecaptchaValue] = useState(null);

  useEffect(() => {
    if (getToken()) {
      navigate("/");
    }
  });

  const submitRegistro = async (e) => {
    
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
    if (profilePicture) {
      formData.append("profile_picture", profilePicture);
    }

    try {
      await Config.registerCliente(formData);

      try {
        const response = await Config.login({ email, password });
        const data = response.data;
        if (data.token) {
          sessionStorage.setItem("token", data.token);
          localStorage.setItem("token", data.token);
          localStorage.setItem("usuario", JSON.stringify(data.usuario));
          localStorage.setItem("rol", data.rol);
          navigate("/Cliente");
        }
      } catch (error) {
        if (error.response) {
          console.log(error);
          const { data } = error.response;
          setErrors(data.errors || {});
        }
      }
    } catch (error) {
      if (error.response) {
        console.log(error.response.data.errors);
        setErrors(error.response.data.errors || {});
      }
    }
  };

  function onChange(value) {
    // console.log("Captcha value:", value);
    setRecaptchaValue(value);
  }

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

              <hr />
              <p className="auth-card-footer tect-center">
                Registrate como EMPRESA{" "}
                <a className="text-dark" href="/register-empresa">
                  aquí
                </a>
              </p>
              <hr />
              <Form.Label htmlFor="basic-url">Nombre y apellido *</Form.Label>
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
                Confirmar contraseña *
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

              <Form.Group className="mb-3">
                <Form.Label htmlFor="profile_picture">
                  Foto de Perfil
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

export default RegisterClient;
