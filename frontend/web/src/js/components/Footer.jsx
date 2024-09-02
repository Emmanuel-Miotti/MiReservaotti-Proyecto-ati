import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { BiHeart, BiInfoCircle } from "react-icons/bi";

const CustomFooter = () => {
    return (
        <>
        <footer className="bg-light text-center text-lg-start mt-5">
            <Container className="p-4 containercss">
                <Row>
                    <Col lg={8} md={12} className="mb-4 mb-md-0">
                        <h5 className="text-uppercase">Sobre Nosotros</h5>
                        <p>
                            Somos una plataforma dedicada a conectar compradores
                            y vendedores de manera rápida y sencilla.
                        </p>
                    </Col>
                    {/* <Col lg={3} md={6} className="mb-4 mb-md-0">
                        <h5 className="text-uppercase"></h5>
                        <ul className="list-unstyled mb-0">
                            <li>
                                <a href="#!" className="text-dark">
                                    
                                </a>
                            </li>
                           
                        </ul>
                    </Col> */}
                    <Col lg={3} md={6} className="mb-4 mb-md-0 ">
                        <h5 className="text-uppercase">Contacto</h5>
                        <ul className="list-unstyled mb-0">
                            <li>
                                <p className="text-dark">
                                    Contacto@MiReservaOtti.online
                                </p>
                            </li>
                            <li>
                                <p className="text-dark">+598 97306493</p>
                            </li>
                            {/* <li>
                                <p className="text-dark">ORT</p>
                            </li> */}
                        </ul>
                    </Col>
                </Row>
            </Container>

            <div
                className="text-center p-3"
                // style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
            >
                © {new Date().getFullYear()} MiReservaOtti
            </div>
        </footer>
        </>
    );
};

export default CustomFooter;
