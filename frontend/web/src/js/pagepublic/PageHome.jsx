import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaRegCalendarCheck, FaUsers, FaRegSmileBeam } from "react-icons/fa";
import ButtonGradient from "../components/ButtonGradient";
import SvgHome from "../components/SVGHome";

import "../../css/Home.css";

const PageHome = () => {
    return (
        <>
            <Container
                fluid
                className="d-flex align-items-center justify-content-center min-vh-100 bg-light text-dark p-5"
            >
                <Row className="w-100 d-flex align-items-center justify-content-center">
                    <Col
                        xs={12}
                        md={5}
                        className="d-flex flex-column homeCol"
                    >
                        <p className="mb-4">
                            SOFTWARE GRATUITO PARA ESTÉTICA, SALUD, SPA, BELLEZA Y BARBERÍA
                        </p>
                        <h1 className="mb-4">
                            ¡Optimiza y automatiza la gestión de tu negocio sin costo!
                        </h1>
                        <p className="mb-4">
                            Centraliza la administración de tus citas, recordatorios, clientes y más, de manera sencilla y gratuita.
                        </p>
                        <ButtonGradient title="¡Empieza ahora!" href="register-empresa" />
                    </Col>
                    <Col
                        xs={12}
                        md={6}
                        className="d-flex align-items-center justify-content-center"
                    >
                        <div className="containerHomeImg">
                            <SvgHome />
                        </div>
                    </Col>
                </Row>
            </Container>

            <Container >
                <h2 className="text-center">¿Por qué elegirnos?</h2>
                <Row className="mt-4">
                    <Col xs={12} md={4} className="text-center">
                        <FaRegCalendarCheck size={50} className="mb-3" style={{ color: "#28a745" }} />
                        <h3>Gestión Simplificada</h3>
                        <p>
                            Nuestro software te permite manejar todas tus citas y recordatorios desde un solo lugar, ahorrando tiempo y esfuerzo.
                        </p>
                    </Col>
                    <Col xs={12} md={4} className="text-center">
                        <FaUsers size={50} className="mb-3" style={{ color: "#28a745" }} />
                        <h3>Conéctate con tus Clientes</h3>
                        <p>
                            Mantén a tus clientes informados con recordatorios automáticos por correo electrónico y WhatsApp.
                        </p>
                    </Col>
                    <Col xs={12} md={4} className="text-center">
                        <FaRegSmileBeam size={50} className="mb-3" style={{ color: "#28a745" }} />
                        <h3>Completamente Gratis</h3>
                        <p>
                            Disfruta de todas nuestras funcionalidades sin ningún costo oculto. Ideal para negocios de todos los tamaños.
                        </p>
                    </Col>
                </Row>
            </Container>

            <Container className="mt-5 bg-light text-dark p-5">
                <h2 className="text-center mb-5">Lo que dicen nuestros usuarios</h2>
                <Row>
                    <Col xs={12} md={4} className="text-center mb-4">
                        <img
                            src="https://lh3.googleusercontent.com/p/AF1QipOMrc_PCXa2oYlQJ9goMrffyLi1UtEIKD-EPvAr=s680-w680-h510"
                            alt="Usuario 1"
                            className="img-fluid rounded-circle mb-3"
                            style={{ width: "150px", height: "150px" }}
                        />
                        <h3>Martín Reymond</h3>
                        <p>
                        "Tengo una barbería y este software me va a ser de gran ayuda para gestionar las reservas y mantener a mis clientes informados."
                        </p>
                    </Col>
                    {/* <Col xs={12} md={4} className="text-center mb-4">
                        <img
                            src="https://via.placeholder.com/150"
                            alt="Usuario 2"
                            className="img-fluid rounded-circle mb-3"
                        />
                        <h3>Raúl Gómez</h3>
                        <p>
                            "La integración con WhatsApp es una maravilla. Mis clientes adoran la facilidad para hacer reservas."
                        </p>
                    </Col>
                    <Col xs={12} md={4} className="text-center mb-4">
                        <img
                            src="https://via.placeholder.com/150"
                            alt="Usuario 3"
                            className="img-fluid rounded-circle mb-3"
                        />
                        <h3>Lucía Fernández</h3>
                        <p>
                            "¡Y lo mejor de todo es que es gratis! No podría estar más feliz con esta herramienta."
                        </p>
                    </Col> */}
                </Row>
            </Container>

            <Container className="mt-3 containercss">
                <h2 className="text-center">Empieza a optimizar tu negocio hoy</h2>
                <Row className="mt-3">
                    <Col xs={12} className="text-center">
                        <p>
                            No esperes más, comienza a gestionar tus citas y clientes con nuestra plataforma gratuita y eficiente.
                        </p>
                        <ButtonGradient title="¡Regístrate gratis!" href="register-admin" />
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default PageHome;

// import React from "react";
// import { Container, Row, Col } from "react-bootstrap";
// import ButtonGradient from "../components/ButtonGradient";
// import SvgHome from "../components/SVGHome";

// import "../../css/Home.css";

// const PageHome = () => {
//     return (
//         <>
//             <Container
//                 fluid
//                 className="d-flex align-items-center justify-content-center min-vh-100 bg-light text-dark p-5"
//             >
//                 <Row className="w-100 d-flex align-items-center justify-content-center">
//                     <Col
//                         xs={12}
//                         md={5}
//                         className="d-flex flex-column homeCol"
//                     >
//                         <p className="mb-4">
//                             SOFTWARE GRATUITO PARA ESTÉTICA, SALUD, SPA, BELLEZA Y BARBERÍA
//                         </p>
//                         <h1 className="mb-4">
//                             ¡Optimiza y automatiza la gestión de tu negocio sin costo!
//                         </h1>
//                         <p className="mb-4">
//                             Centraliza la administración de tus citas, recordatorios, clientes y más, de manera sencilla y gratuita.
//                         </p>
//                         <ButtonGradient title="¡Empieza ahora!" href="register-admin" />
//                     </Col>
//                     <Col
//                         xs={12}
//                         md={6}
//                         className="d-flex align-items-center justify-content-center"
//                     >
//                         <div className="containerHomeImg">
//                             <SvgHome />
//                         </div>
//                     </Col>
//                 </Row>
//             </Container>

//             <Container className="mt-3">
//                 <h2 className="text-center">¿Por qué elegirnos?</h2>
//                 <Row className="mt-4">
//                     <Col xs={12} md={4} className="text-center">
//                         <h3>Gestión Simplificada</h3>
//                         <p>
//                             Nuestro software te permite manejar todas tus citas y recordatorios desde un solo lugar, ahorrando tiempo y esfuerzo.
//                         </p>
//                     </Col>
//                     <Col xs={12} md={4} className="text-center">
//                         <h3>Conéctate con tus Clientes</h3>
//                         <p>
//                             Mantén a tus clientes informados con recordatorios automáticos por correo electrónico y WhatsApp.
//                         </p>
//                     </Col>
//                     <Col xs={12} md={4} className="text-center">
//                         <h3>Completamente Gratis</h3>
//                         <p>
//                             Disfruta de todas nuestras funcionalidades sin ningún costo oculto. Ideal para negocios de todos los tamaños.
//                         </p>
//                     </Col>
//                 </Row>
//             </Container>

//             <Container className="mt-5 bg-light text-dark p-5">
//                 <h2 className="text-center mb-5">Lo que dicen nuestros usuarios</h2>
//                 <Row>
//                     <Col xs={12} md={4} className="text-center mb-4">
//                         <img
//                             src="https://lh3.googleusercontent.com/p/AF1QipOMrc_PCXa2oYlQJ9goMrffyLi1UtEIKD-EPvAr=s680-w680-h510"
//                             alt="Usuario 1"
//                             className="img-fluid rounded-circle mb-3"
//                             style={{ width: "150px", height: "150px" }}
//                         />
//                         <h3>Martin Martínez</h3>
//                         <p>
//                             "Este software ha transformado cómo gestiono mi spa. Ahora mis clientes nunca olvidan sus citas."
//                         </p>
//                     </Col>
//                     {/* <Col xs={12} md={4} className="text-center mb-4">
//                         <img
//                             src="https://via.placeholder.com/150"
//                             alt="Usuario 2"
//                             className="img-fluid rounded-circle mb-3"
//                         />
//                         <h3>Raúl Gómez</h3>
//                         <p>
//                             "La integración con WhatsApp es una maravilla. Mis clientes adoran la facilidad para hacer reservas."
//                         </p>
//                     </Col>
//                     <Col xs={12} md={4} className="text-center mb-4">
//                         <img
//                             src="https://via.placeholder.com/150"
//                             alt="Usuario 3"
//                             className="img-fluid rounded-circle mb-3"
//                         />
//                         <h3>Lucía Fernández</h3>
//                         <p>
//                             "¡Y lo mejor de todo es que es gratis! No podría estar más feliz con esta herramienta."
//                         </p>
//                     </Col> */}
//                 </Row>
//             </Container>

//             <Container className="mt-5 containercss">
//                 <h2 className="text-center">Empieza a optimizar tu negocio hoy</h2>
//                 <Row className="mt-5">
//                     <Col xs={12} className="text-center">
//                         <p>
//                             No esperes más, comienza a gestionar tus citas y clientes con nuestra plataforma gratuita y eficiente.
//                         </p>
//                         <ButtonGradient title="¡Regístrate gratis!" href="register-admin" />
//                     </Col>
//                 </Row>
//             </Container>
//         </>
//     );
// };

// export default PageHome;


// // import React from "react";
// // import { Container, Row, Col } from "react-bootstrap";
// // import ButtonGradient from "../components/ButtonGradient";
// // import SvgHome from "../components/SVGHome";

// // import "../../css/Home.css";

// // const PageHome = () => {
// //     return (
// //         <>
// //             <Container
// //                 fluid
// //                 className="d-flex align-items-center justify-content-center min-vh-100 bg-light text-dark p-5"
// //             >
// //                 <Row className="w-100 d-flex align-items-center justify-content-center">
// //                     <Col
// //                         xs={12}
// //                         md={5}
// //                         className="d-flex flex-column homeCol "
// //                     >
// //                         <p className="mb-4">
// //                             SOFTWARE GRATUITO PARA ESTÉTICA, SALUD, SPA, BELLEZA Y BARBERÍA
// //                         </p>
// //                         <h1 className="mb-4">
// //                             ¡Optimiza y automatiza la gestión de tu negocio sin costo!
// //                         </h1>
// //                         <p className="mb-4">
// //                             Centraliza la administración de tus citas, recordatorios, clientes y más, de manera sencilla y gratuita.
// //                         </p>
// //                         <ButtonGradient title="¡Empieza ahora!" href="register-admin" />
// //                     </Col>
// //                     <Col
// //                         xs={12}
// //                         md={6}
// //                         className="d-flex align-items-center justify-content-center"
// //                     >
// //                         <div className="containerHomeImg">
// //                             <SvgHome />
// //                         </div>
// //                     </Col>
// //                 </Row>
// //             </Container>

// //             <Container className="mt-1">
// //                 <h2 className="text-center">¿Por qué elegirnos?</h2>
// //                 <Row className="mt-5">
// //                     <Col xs={12} md={4} className="text-center">
// //                         <h3>Gestión Simplificada</h3>
// //                         <p>
// //                             Nuestro software te permite manejar todas tus citas y recordatorios desde un solo lugar, ahorrando tiempo y esfuerzo.
// //                         </p>
// //                     </Col>
// //                     <Col xs={12} md={4} className="text-center">
// //                         <h3>Conéctate con tus Clientes</h3>
// //                         <p>
// //                             Mantén a tus clientes informados con recordatorios automáticos por correo electrónico y WhatsApp.
// //                         </p>
// //                     </Col>
// //                     <Col xs={12} md={4} className="text-center">
// //                         <h3>Completamente Gratis</h3>
// //                         <p>
// //                             Disfruta de todas nuestras funcionalidades sin ningún costo oculto. Ideal para negocios de todos los tamaños.
// //                         </p>
// //                     </Col>
// //                 </Row>
// //             </Container>

// //             <Container className="mt-5 bg-light text-dark p-5">
// //                 <h2 className="text-center mb-5">Lo que dicen nuestros usuarios</h2>
// //                 <Row>
// //                     <Col xs={12} md={4} className="text-center mb-4">
// //                         <img
// //                             src="https://lh3.googleusercontent.com/p/AF1QipOMrc_PCXa2oYlQJ9goMrffyLi1UtEIKD-EPvAr=s680-w680-h510"
// //                             alt="Usuario 1"
// //                             className="img-fluid rounded-circle mb-3"
// //                         />
// //                         <h3>Martin Martínez</h3>
// //                         <p>
// //                             "Este software ha transformado cómo gestiono mi spa. Ahora mis clientes nunca olvidan sus citas."
// //                         </p>
// //                     </Col>
// //                     {/* <Col xs={12} md={4} className="text-center mb-4">
// //                         <img
// //                             src="https://via.placeholder.com/150"
// //                             alt="Usuario 2"
// //                             className="img-fluid rounded-circle mb-3"
// //                         />
// //                         <h3>Raúl Gómez</h3>
// //                         <p>
// //                             "La integración con WhatsApp es una maravilla. Mis clientes adoran la facilidad para hacer reservas."
// //                         </p>
// //                     </Col>
// //                     <Col xs={12} md={4} className="text-center mb-4">
// //                         <img
// //                             src="https://via.placeholder.com/150"
// //                             alt="Usuario 3"
// //                             className="img-fluid rounded-circle mb-3"
// //                         />
// //                         <h3>Lucía Fernández</h3>
// //                         <p>
// //                             "¡Y lo mejor de todo es que es gratis! No podría estar más feliz con esta herramienta."
// //                         </p>
// //                     </Col> */}
// //                 </Row>
// //             </Container>

// //             <Container className="mt-5 containercss">
// //                 <h2 className="text-center">Empieza a optimizar tu negocio hoy</h2>
// //                 <Row className="mt-5">
// //                     <Col xs={12} className="text-center">
// //                         <p>
// //                             No esperes más, comienza a gestionar tus citas y clientes con nuestra plataforma gratuita y eficiente.
// //                         </p>
// //                         <ButtonGradient title="¡Regístrate gratis!" href="register-admin" />
// //                     </Col>
// //                 </Row>
// //             </Container>
// //         </>
// //     );
// // };

// // export default PageHome;




// // // import React from "react";
// // // import { Container, Row, Col, Button } from "react-bootstrap";
// // // import ButtonGradient from "../components/ButtonGradient";
// // // import SvgHome from "../components/SVGHome";

// // // import "../../css/Home.css";
// // // const PageHome = () => {
// // //     return (
// // //         <>
// // //             <Container
// // //                 fluid
// // //                 // className="d-flex align-items-center justify-content-center  bg-light text-dark min-vh-100 p-5"
// // //                 className="d-flex align-items-center justify-content-center"
// // //             >
// // //                 <Row className="w-100 d-flex align-items-center justify-content-center">
// // //                     <Col
// // //                         xs={12}
// // //                         md={5}
// // //                         className="d-flex flex-column homeCol "
// // //                         // className="d-flex flex-column justify-content-center"
// // //                     >
// // //                         <p className="mb-4">
// // //                             SOFTWARE PARA ESTÉTICA, SALUD, SPA, BELLEZA Y
// // //                             BARBERÍA
// // //                         </p>
// // //                         <h1 className="mb-4">
// // //                             ¡Optimiza, automatiza y expande tu negocio!
// // //                         </h1>
// // //                         <p className="mb-4">
// // //                             Administra tus citas, recordatorios, clientes y
// // //                             pagos de manera sencilla y centralizada.
// // //                         </p>
// // //                         <ButtonGradient title="¡Empieza ahora!" href="register-admin"/>
// // //                     </Col>
// // //                     <Col
// // //                         xs={12}
// // //                         md={6}
// // //                         className="d-flex align-items-center justify-content-center"
// // //                     >
// // //                         <div className="containerHomeImg">
// // //                         <SvgHome 
// // //                         />
// // //                         </div>
                       
// // //                     </Col>
// // //                 </Row>
// // //             </Container>
// // //             {/* <Container className="mt-5 containercss">
// // //                 <h2 className="text-center">Características</h2>
// // //                 <Row className="mt-5">
// // //                     <Col xs={12} md={4} className="text-center">
// // //                         <img
// // //                             src="https://via.placeholder.com/150"
// // //                             alt="Imagen de ejemplo"
// // //                             className="img-fluid"
// // //                         />
// // //                         <h3>Agenda</h3>
// // //                         <p>
// // //                             Administra tus citas, recordatorios y disponibilidad
// // //                             de manera sencilla.
// // //                         </p>
// // //                     </Col>
// // //                     <Col xs={12} md={4} className="text-center">
// // //                         <img
// // //                             src="https://via.placeholder.com/150"
// // //                             alt="Imagen de ejemplo"
// // //                             className="img-fluid"
// // //                         />
// // //                         <h3>Clientes</h3>
// // //                         <p>
// // //                             Mantén un registro de tus clientes y sus
// // //                             preferencias para brindar un servicio personalizado.
// // //                         </p>
// // //                     </Col>
// // //                     <Col xs={12} md={4} className="text-center">
// // //                         <img
// // //                             src="https://via.placeholder.com/150"
// // //                             alt="Imagen de ejemplo"
// // //                             className="img-fluid"
// // //                         />
// // //                         <h2>Pagos</h2>
// // //                         <p>
// // //                             Recibe pagos en línea, lleva un registro de tus
// // //                             ingresos y administra tus gastos.
// // //                         </p>
// // //                     </Col>
// // //                 </Row>
// // //             </Container> */}
// // //             {/* <Container className="mt-5 min-vh-100 bg-light text-dark p-5">
// // //                 <h2 className="text-center mb-5 ">Planes</h2>
// // //                 <Row>
// // //                     <Col xs={12} md={4} className="text-center mb-4 cardPlanes">
// // //                         <h3>Plan Básico</h3>
// // //                         <p>Para pequeños negocios</p>
// // //                         <ul className="list-unstyled">
// // //                             <li>Agenda</li>
// // //                             <li>Clientes</li>
// // //                             <li>Recordatorios</li>
// // //                             <li>10</li>
// // //                         </ul>
// // //                         <Button variant="primary">Seleccionar</Button>
// // //                     </Col>
// // //                     <Col xs={12} md={4} className="text-center mb-4 cardPlanes">
// // //                         <h3>Plan Estándar</h3>
// // //                         <p>Para medianos negocios</p>
// // //                         <ul className="list-unstyled">
// // //                             <li>Agenda</li>
// // //                             <li>Clientes</li>
// // //                             <li>Recordatorios</li>
// // //                             <li>Pagos</li>
// // //                             <li>$99/mes</li>
// // //                         </ul>
// // //                         <Button variant="primary">Seleccionar</Button>
// // //                     </Col>
// // //                     <Col xs={12} md={4} className="text-center mb-4 cardPlanes">
// // //                         <h3>Plan Premium</h3>
// // //                         <p>Para grandes negocios</p>
// // //                         <ul className="list-unstyled">
// // //                             <li>Agenda</li>
// // //                             <li>Clientes</li>
// // //                             <li>Recordatorios</li>
// // //                             <li>Pagos</li>
// // //                             <li>Reportes</li>
// // //                             <li>$199/mes</li>
// // //                         </ul>
// // //                         <Button variant="primary">Seleccionar</Button>
// // //                     </Col>
// // //                 </Row>
// // //             </Container> */}

// // //             {/* <Container className=" containercss">
// // //                 <h2 className="text-center">Testimonios</h2>
// // //                 <Row className="mt-5">
// // //                     <Col xs={12} md={4} className="text-center">
// // //                         <img
// // //                             src="https://via.placeholder.com/150"
// // //                             alt="Imagen de ejemplo"
// // //                             className="img-fluid rounded-circle"
// // //                         />
// // //                         <h3>Nombre</h3>
// // //                         <p>Opinión</p>
// // //                     </Col>
// // //                     <Col xs={12} md={4} className="text-center">
// // //                         <img
// // //                             src="https://via.placeholder.com/150"
// // //                             alt="Imagen de ejemplo"
// // //                             className="img-fluid rounded-circle"
// // //                         />
// // //                         <h3>Nombre</h3>
// // //                         <p>Opinión</p>
// // //                     </Col>
// // //                     <Col xs={12} md={4} className="text-center">
// // //                         <img
// // //                             src="https://via.placeholder.com/150"
// // //                             alt="Imagen de ejemplo"
// // //                             className="img-fluid rounded-circle"
// // //                         />
// // //                         <h3>Nombre</h3>
// // //                         <p>Opinión</p>
// // //                     </Col>
// // //                 </Row>
// // //             </Container> */}
// // //         </>
// // //     );
// // // };

// // // export default PageHome;
