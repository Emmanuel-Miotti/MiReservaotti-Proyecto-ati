import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import ButtonGradient from "../components/ButtonGradient";
import SvgHome from "../components/SVGHome";

import "../../css/Home.css";
const PageHome = () => {
    return (
        <>
            <Container
                fluid
                // className="d-flex align-items-center justify-content-center  bg-light text-dark min-vh-100 p-5"
                className="d-flex align-items-center justify-content-center"
            >
                <Row className="w-100 d-flex align-items-center justify-content-center">
                    <Col
                        xs={12}
                        md={5}
                        className="d-flex flex-column homeCol "
                        // className="d-flex flex-column justify-content-center"
                    >
                        <p className="mb-4">
                            SOFTWARE PARA ESTÉTICA, SALUD, SPA, BELLEZA Y
                            BARBERÍA
                        </p>
                        <h1 className="mb-4">
                            ¡Optimiza, automatiza y expande tu negocio!
                        </h1>
                        <p className="mb-4">
                            Administra tus citas, recordatorios, clientes y
                            pagos de manera sencilla y centralizada.
                        </p>
                        <ButtonGradient title="¡Empieza ahora!" href="register-admin"/>
                    </Col>
                    <Col
                        xs={12}
                        md={6}
                        className="d-flex align-items-center justify-content-center"
                    >
                        <div className="containerHomeImg">
                        <SvgHome 
                        />
                        </div>
                       
                    </Col>
                </Row>
            </Container>
            {/* <Container className="mt-5 containercss">
                <h2 className="text-center">Características</h2>
                <Row className="mt-5">
                    <Col xs={12} md={4} className="text-center">
                        <img
                            src="https://via.placeholder.com/150"
                            alt="Imagen de ejemplo"
                            className="img-fluid"
                        />
                        <h3>Agenda</h3>
                        <p>
                            Administra tus citas, recordatorios y disponibilidad
                            de manera sencilla.
                        </p>
                    </Col>
                    <Col xs={12} md={4} className="text-center">
                        <img
                            src="https://via.placeholder.com/150"
                            alt="Imagen de ejemplo"
                            className="img-fluid"
                        />
                        <h3>Clientes</h3>
                        <p>
                            Mantén un registro de tus clientes y sus
                            preferencias para brindar un servicio personalizado.
                        </p>
                    </Col>
                    <Col xs={12} md={4} className="text-center">
                        <img
                            src="https://via.placeholder.com/150"
                            alt="Imagen de ejemplo"
                            className="img-fluid"
                        />
                        <h2>Pagos</h2>
                        <p>
                            Recibe pagos en línea, lleva un registro de tus
                            ingresos y administra tus gastos.
                        </p>
                    </Col>
                </Row>
            </Container> */}
            {/* <Container className="mt-5 min-vh-100 bg-light text-dark p-5">
                <h2 className="text-center mb-5 ">Planes</h2>
                <Row>
                    <Col xs={12} md={4} className="text-center mb-4 cardPlanes">
                        <h3>Plan Básico</h3>
                        <p>Para pequeños negocios</p>
                        <ul className="list-unstyled">
                            <li>Agenda</li>
                            <li>Clientes</li>
                            <li>Recordatorios</li>
                            <li>10</li>
                        </ul>
                        <Button variant="primary">Seleccionar</Button>
                    </Col>
                    <Col xs={12} md={4} className="text-center mb-4 cardPlanes">
                        <h3>Plan Estándar</h3>
                        <p>Para medianos negocios</p>
                        <ul className="list-unstyled">
                            <li>Agenda</li>
                            <li>Clientes</li>
                            <li>Recordatorios</li>
                            <li>Pagos</li>
                            <li>$99/mes</li>
                        </ul>
                        <Button variant="primary">Seleccionar</Button>
                    </Col>
                    <Col xs={12} md={4} className="text-center mb-4 cardPlanes">
                        <h3>Plan Premium</h3>
                        <p>Para grandes negocios</p>
                        <ul className="list-unstyled">
                            <li>Agenda</li>
                            <li>Clientes</li>
                            <li>Recordatorios</li>
                            <li>Pagos</li>
                            <li>Reportes</li>
                            <li>$199/mes</li>
                        </ul>
                        <Button variant="primary">Seleccionar</Button>
                    </Col>
                </Row>
            </Container> */}

            {/* <Container className=" containercss">
                <h2 className="text-center">Testimonios</h2>
                <Row className="mt-5">
                    <Col xs={12} md={4} className="text-center">
                        <img
                            src="https://via.placeholder.com/150"
                            alt="Imagen de ejemplo"
                            className="img-fluid rounded-circle"
                        />
                        <h3>Nombre</h3>
                        <p>Opinión</p>
                    </Col>
                    <Col xs={12} md={4} className="text-center">
                        <img
                            src="https://via.placeholder.com/150"
                            alt="Imagen de ejemplo"
                            className="img-fluid rounded-circle"
                        />
                        <h3>Nombre</h3>
                        <p>Opinión</p>
                    </Col>
                    <Col xs={12} md={4} className="text-center">
                        <img
                            src="https://via.placeholder.com/150"
                            alt="Imagen de ejemplo"
                            className="img-fluid rounded-circle"
                        />
                        <h3>Nombre</h3>
                        <p>Opinión</p>
                    </Col>
                </Row>
            </Container> */}
        </>
    );
};

export default PageHome;
