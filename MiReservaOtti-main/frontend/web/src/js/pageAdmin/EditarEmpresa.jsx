import React, { useState, useEffect } from "react";
import Config from "../Config";
import { useNavigate, useParams } from "react-router-dom";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import { MdOutlineEmail } from "react-icons/md";
import { IoKeyOutline } from "react-icons/io5";
import "../../css/Login.css";
import AuthUser from "../pageauth/AuthUser";

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
    category_id: "",
    url : "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!getToken()) {
      navigate("/");
    }

    Config.getEmpresa(`${id}`)
      .then((data) => {
        console.log("dato dato" + data.data.data);
        setEmpresa(data.data.data);
      })
      .catch((error) => {
        console.error("Error al obtener Empresa:", error);
      });

    console.log("Empresa:", empresa);
  });

  const handleChange = (e) => {
    setEmpresa({
      ...empresa,
      [e.target.name]: e.target.value,
    });
  };

  const submitUpdate = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await Config.editEmpresa(`${id}`, empresa);
      navigate("/");
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
                EDITAR EMPRESA
              </h1>
              <p>Modifique solo los datos que quiera editar</p>
              <Form onSubmit={submitUpdate}>
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu nombre"
                    name="name"
                    value={empresa.name}
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
                      placeholder="Ingresa tu contraseña"
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
                <Form.Group
                  className="mb-3"
                  controlId="formPasswordConfirmation"
                >
                  <Form.Label>Confirmar Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirma tu contraseña"
                    name="password_confirmation"
                    value={empresa.password_confirmation}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formCellphone">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu teléfono"
                    name="cellphone"
                    value={empresa.cellphone}
                    onChange={handleChange}
                    isInvalid={!!errors.cellphone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.cellphone}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formAddress">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu dirección"
                    name="address"
                    value={empresa.address}
                    onChange={handleChange}
                    isInvalid={!!errors.address}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.address}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formCategory">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu categoría"
                    name="category_id"
                    value={empresa.category_id}
                    onChange={handleChange}
                    isInvalid={!!errors.category_id}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.category_id}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formUrl">
                  <Form.Label>Url</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu url"
                    name="url"
                    value={empresa.url}
                    onChange={handleChange}
                    isInvalid={!!errors.url}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.url}
                  </Form.Control.Feedback>
                </Form.Group>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
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
  );
};

export default EditEmpresa;
