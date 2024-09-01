// import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import axios from "axios";
import AuthUser from "../pageauth/AuthUser";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-datepicker/dist/react-datepicker.css";
import "../../css/Empresa.css";

import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

moment.locale("es");
const localizer = momentLocalizer(moment);

const PanelAdmin = () => {
  const { getUser } = AuthUser();
  const [reservas, setReservas] = useState([]);
//   const [horarioInicio, setHorarioInicio] = useState(null);
//   const [horarioFin, setHorarioFin] = useState(null);

  useEffect(() => {
    // fetchHorarios();
    obtenerReservas();
  }); // Añadir un array vacío para que useEffect se ejecute solo una vez al montar el componente



  const obtenerReservas = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/v1/reservas/empresa/${getUser().id}`
      );
      setReservas(response.data.data);
    } catch (error) {
      console.error("Error al obtener reservas:", error);
    }
  };
  const calcularFechaFin = (fecha, hora, duracion) => {
    const fechaInicio = new Date(fecha + "T" + hora);
    const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
    return fechaFin;
  };
  
  const eventos = reservas.map((reserva) => ({
    id: reserva.id,
    title: `Reserva para ${reserva.cliente.name}`,
    start: new Date(reserva.fecha + "T" + reserva.hora),
    end: calcularFechaFin(reserva.fecha, reserva.hora, reserva.duracion),

  }));
  return (
    <>
      {/* <Container className="mt-5">
        <h2>Resumen</h2>
      </Container>
      <Container className="mt-3 containercss">
        <h5>Periodo de tiempo:</h5>
        <select name="periodo" id="periodo" className="selectBuscar">
          <option value="dia">Día</option>
          <option value="semana">Semana</option>
          <option value="mes">Mes</option>
          <option value="año">Año</option>
        </select>
        <Button className="btn btn-success">Buscar</Button>
      </Container>
      <Container className="mt-3 ">
        <Row>
          <Col xs={12} md={3} className="text-center  cardAdmin">
            <h3>1</h3>
            <p>TOTAL DE RESERVAS</p>

            <Button className="btn btn-success">Detalles</Button>
          </Col> */}
          {/* <Col xs={12} md={3} className="text-center cardAdmin">
                        <h3>1.83%</h3>
                        <p>DACTOR DE OCUPACIÓN</p>
                        <hr />
                        <p>100%</p>
                        <p>Con respecto a la semana anterior</p>
                    </Col> */}
          {/* <Col xs={12} md={3} className="text-center cardAdmin">
            <h3>3</h3>
            <p>NUEVOS CLIENTES</p>
            <hr />
            <p>100%</p>
            <p>Con respecto a la semana anterior</p>
          </Col>
          <Col xs={12} md={3} className="text-center cardAdmin">
            <h3>$ 3900</h3>
            <p>INGRESOS ESTIMADOS</p>
            <hr />
            <p>100%</p>
            <p>Con respecto a la semana anterior</p>
          </Col>
        </Row>
      </Container> */}
      {/* ---------------------------------------------------------------------------------------------- */}
      <Container className="mt-3 containercss">
      <h2>Reservas de Hoy / Horario de hoy</h2>
          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            defaultView="day"// Mostrar solo la vista diaria
            views={["day"]} // Permitir solo la vista diaria
            selectable={true}
            min={new Date(moment().startOf("day").hour(8))} // Hora de inicio del día, ajustada a las 8:00 AM
            max={new Date(moment().startOf("day").hour(20))} // Hora de fin del día, ajustada a las 6:00 PM
            scrollToTime={new Date(moment().startOf("day").hour(8))} // Desplazar al inicio del día, a las 8:00 AM
         
          />

    </Container>
      {/* ---------------------------------------------------------------------------------------------- */}
      <Container className="mt-5">
        <Row>
          <Col xs={12} md={3} className="text-center  cardAdmin">
            <h3>Factor de ocupación</h3>
            <p>De Lunes a domingo</p>
            <Line
              data={{
                labels: [
                  "Lunes",
                  "Martes",
                  "Miercoles",
                  "Jueves",
                  "Viernes",
                  "Sabado",
                  "Domingo",
                ],
                datasets: [
                  {
                    label: "Ocupación",
                    data: [100, 100, 100, 100, 100, 100, 100],
                    backgroundColor: "rgba(43, 63, 229, 0.8)",
                    borderColor: "rgba(43, 63, 229, 1)",
                    borderWidth: 1,
                  },
                ],
              }}
            />
          </Col>

          <Col xs={12} md={3} className="text-center cardAdmin">
            <h3>Fuentes de reservas</h3>
            <Doughnut
              data={{
                labels: ["Online", "WhatsApp", "Local"],
                datasets: [
                  {
                    data: [70, 20, 10],
                    backgroundColor: [
                      "rgba(43, 63, 229, 0.8)",
                      "rgba(250, 192, 19, 0.8)",
                      "rgba(255, 99, 132, 0.8)",
                    ],
                  },
                ],
              }}
            />
          </Col>
          <Col xs={12} md={3} className="text-center cardAdmin">
            <h3>Ventas facturadas</h3>
            <p>Grafica Servicios,Porducto, planes</p>
            <Bar
              data={{
                labels: ["Servicios", "Productos", "Planes"],
                datasets: [
                  {
                    label: "Ventas",
                    data: [12, 19, 3],
                    backgroundColor: [
                      "rgba(43, 63, 229, 0.8)",
                      "rgba(250, 192, 19, 0.8)",
                      "rgba(255, 99, 132, 0.8)",
                    ],
                  },
                ],
              }}
            />
          </Col>
          <Col xs={12} md={3} className="text-center cardAdmin">
            <h3>Confirmaciones por WhatsApp</h3>
            <p>No hay whatsapp enviados</p>
            <p>
              Comenzaremos a mostrarte los datos una vez que se envíen mensaje
              de WhatsApp
            </p>
          </Col>
          <Col xs={12} md={3} className="text-center cardAdmin">
            <h3>Confirmaciones por email</h3>
            <p>No hay emails registrados</p>
            <p>
              Comenzaremos a mostrarte los datos una vez que se envíe un correo
              de confirmación
            </p>
          </Col>
          <Col xs={12} md={3} className="text-center cardAdmin">
            <h3>Cumpleaños de hoy (26 mayo)</h3>
            <p></p>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PanelAdmin;
