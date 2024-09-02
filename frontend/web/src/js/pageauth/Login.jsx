import React, { useEffect, useState } from "react";
import Config from "../Config";
import { useNavigate } from "react-router-dom";
import AuthUser from "./AuthUser";
import axios from "axios";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { MdOutlineEmail } from "react-icons/md";
import { IoKeyOutline } from "react-icons/io5";
import "../../css/Login.css";
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
  const { getToken } = AuthUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

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
  }, []);

  const NavbarBrandContent = <></>;

  const submitLogin = async (e) => {
    e.preventDefault();

    if (!recaptchaValue) {
      setErrors({ recaptcha: "Por favor, verifica que no eres un robot." });
      return;
    }

    try {
      const response = await Config.login({
        email,
        password,
        recaptchaValue,
      });

      const data = response.data;
      if (data.token) {
        sessionStorage.setItem("token", data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        localStorage.setItem("rol", data.rol);

        if (data.rol === "Empresa") {
          navigate("/Empresa");
        } else if (data.rol === "Cliente") {
          navigate("/Cliente");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      if (error.response) {
        const { data } = error.response;
        console.log(data);
        setErrors(data.errors || {});
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
          <div className="text-center">{NavbarBrandContent}</div>
          <div className="mt-2">
            <div className="card-body" id="demo-form">
              <h1 className="auth-card-title text-center fw-bolder">
                INICIAR SESIÓN
              </h1>
              <p className="auth-card-title text-center">
                ¡Bienvenido a MiReservaOtti!
              </p>
              <Form onSubmit={submitLogin}>
                <Form.Label htmlFor="basic-url">Correo electrónico</Form.Label>
                <InputGroup className="input-group mb-4">
                  <InputGroup.Text id="basic-addon1">
                    <MdOutlineEmail />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Ingresa tu email"
                    aria-label="Email"
                    aria-describedby="basic-addon1"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="Ingresa tu contraseña"
                    aria-label="password"
                    aria-describedby="basic-addon1"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    isInvalid={!!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
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
                  <button type="submit" className="btn btn-success">
                    Iniciar sesión
                  </button>
                </div>
              </Form>
              <hr />
              <div className="text-center mt-3">
                <p className="text-center">¿No tienes cuenta? </p>
                <a className="text-dark" href="/register-cliente">
                  Registrar como cliente
                </a>{" "}
                o{" "}
                <a className="text-dark" href="/register-empresa">
                  Registrate como empresa
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
