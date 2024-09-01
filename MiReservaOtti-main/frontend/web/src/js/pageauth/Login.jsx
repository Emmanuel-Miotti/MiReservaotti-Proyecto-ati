import React, { useEffect, useState } from "react";
import Config from "../Config";
import { useNavigate } from "react-router-dom";
import AuthUser from "./AuthUser";
import axios from "axios";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { MdOutlineEmail } from "react-icons/md";
import { IoKeyOutline } from "react-icons/io5";
// import logoimg from "../../../public/img/logo.jpeg";
import "../../css/Login.css";

const Login = () => {
  const { getToken } = AuthUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const NavbarBrandContent = (
    <>
      {/* <img
        src={logoimg}
        alt="Logo"
        className="me-2"
        style={{ height: "80px", width: "80px" }}
      /> */}
    </>
  );

  const submitLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await Config.login({
        email,
        password,
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
        setErrors(data.errors || {});
      }
    }
  };

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
              {/* {errors.email && (
                                <div className="text-danger text-center mb-3">
                                    {errors.email}
                                </div>
                            )}
                            {errors.password && (
                                <div className="text-danger text-center mb-3">
                                    {errors.password}
                                </div>
                            )} */}
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
                  placeholder="Ingresa tu contraseña"
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
              {/* <p className="">
                <a className="text-dark" href="/forget-password">
                  ¿Olvidaste tu contraseña?
                </a>
              </p> */}
              <div className="d-grid">
                <button onClick={submitLogin} className="btn btn-success">
                  Iniciar sesión
                </button>
              </div>

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
