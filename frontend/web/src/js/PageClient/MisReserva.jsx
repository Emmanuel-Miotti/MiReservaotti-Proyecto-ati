import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Modal  } from 'react-bootstrap';
import axios from 'axios';
import Config from '../Config';
import AuthUser from '../pageauth/AuthUser';
import moment from 'moment';
import NavBar from "../components/Navbar.jsx";

const MisReservas = () => {
    const { getToken } = AuthUser();
    const { getUser } = AuthUser();
    const user = getUser();
    const [reservasProximas, setReservasProximas] = useState([]);
    const [reservasPasadas, setReservasPasadas] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
const [successMessage, setSuccessMessage] = useState('');


    useEffect(() => {
        fetchReservas();
    }, []);

    const fetchReservas = async () => {
        try {
            const response = await axios.get(`${Config.url()}/reservas/${user.id}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            console.log("Response data:", response.data); // Verifica los datos de la respuesta

            if (response.data.success) {
                const proximas = Object.values(response.data.proximas);
                const pasadas = Object.values(response.data.pasadas);

                setReservasProximas(proximas);
                setReservasPasadas(pasadas);

                console.log("Próximas reservas:", proximas); // Verifica las próximas reservas
                console.log("Reservas pasadas:", pasadas); // Verifica las reservas pasadas
            } else {
                setError('Error al obtener las reservas');
            }
        } catch (err) {
            setError('Error al obtener las reservas');
            console.error("Error fetching reservations:", err);
        }
    };

    const cancelarReserva = async (id) => {
        console.log(id)
        try {
            await axios.post(`${Config.url()}/cancelar-reserva/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });
            // setReservasProximas(reservasProximas.filter(reserva => reserva.id !== id));
            fetchReservas();
            // alert('Reserva cancelada exitosamente');
            setSuccessMessage('Cancelación realizada con éxito');
        setShowModal(true);
        } catch (err) {
            setError('Error al cancelar la reserva');
            console.error("Error cancelling reservation:", err);
        }
    };

    return (
        <>
      <NavBar />

      <Modal show={showModal} onHide={() => setShowModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title>Confirmación</Modal.Title>
    </Modal.Header>
    <Modal.Body>{successMessage}</Modal.Body>
    <Modal.Footer>
        <Button variant="primary" onClick={() => setShowModal(false)}>
            Aceptar
        </Button>
    </Modal.Footer>
</Modal>



        <Container className="mt-5">
            <h1>Mis Reservas</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <h2>Próximas Reservas</h2>
            <p>No puedes cancelar una reserva 4 horas antes de la misma</p>
            {reservasProximas.length > 0 ? (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            {/* <th>ID</th> */}
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Duración (min)</th>
                            <th>Precio</th>
                            <th>Estado</th>
                            <th>Observaciones</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservasProximas.map((reserva) => (
                            <tr key={reserva.id}>
                                {/* <td>{reserva.id}</td> */}
                                <td>{reserva.fecha}</td>
                                <td>{reserva.hora}</td>
                                <td>{reserva.duracion}</td>
                                <td>${reserva.precio}</td>
                                <td>{reserva.estado}</td>
                                
                                <td>{reserva.observaciones}</td>
                                <td>
                                    {reserva.estado !== 'cancelado' && (
                                        <Button
                                            variant="danger"
                                            onClick={() => cancelarReserva(reserva.id)}
                                            disabled={moment(`${reserva.fecha} ${reserva.hora}`).diff(moment(), 'hours') < 4}
                                        >
                                            Cancelar
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>No tienes próximas reservas.</p>
            )}
            <h2>Reservas Pasadas</h2>
            {reservasPasadas.length > 0 ? (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            {/* <th>ID</th> */}
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Duración (min)</th>
                            <th>Precio</th>
                            <th>Estado</th>
                            <th>Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservasPasadas.map((reserva) => (
                            <tr key={reserva.id}>
                                {/* <td>{reserva.id}</td> */}
                                <td>{reserva.fecha}</td>
                                <td>{reserva.hora}</td>
                                <td>{reserva.duracion}</td>
                                <td>${reserva.precio}</td>
                                <td>{reserva.estado}</td>
                                <td>{reserva.observaciones}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>No tienes reservas pasadas.</p>
            )}
        </Container>
            </>
    );
};

export default MisReservas;
