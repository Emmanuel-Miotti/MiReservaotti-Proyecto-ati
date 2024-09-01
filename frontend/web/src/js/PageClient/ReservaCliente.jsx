import React, { useEffect, useState } from 'react';
import { Table, Button, Container } from 'react-bootstrap';
import axios from 'axios';
import Config from "../Config";

const MisReservas = () => {
    const [reservas, setReservas] = useState([]);

    useEffect(() => {
        fetchReservas();
    }, []);

    const fetchReservas = async () => {
        try {
            const response = await axios.get(`${Config.url()}/mis-reservas`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Asegúrate de que el token esté almacenado
                },
            });
            console.log(response.data.data);
            setReservas(response.data.data);
        } catch (error) {
            console.error('Error al obtener las reservas:', error);
        }
    };
    // const fetchReservas = async () => {
    //     try {
    //         const token = localStorage.getItem('token'); // Obtén el token de localStorage
    //         // if (!token) {
    //         //     throw new Error('Token de autorización no encontrado');
    //         // }
    
    //         const response = await axios.get('http://127.0.0.1:8000/api/v1/mis-reservas', {
    //             headers: {
    //                 Authorization: `Bearer ${token}`, // Usa el token como parte del header de Authorization
    //             },
    //         });
    //         setReservas(response.data.data);
    //     } catch (error) {
    //         console.error('Error al obtener las reservas:', error);
    //     }
    // };


    const cancelarReserva = async (id) => {
        try {
            await axios.delete(`${Config.url()}/reservas/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            fetchReservas();
        } catch (error) {
            console.error('Error al cancelar la reserva:', error);
        }
    };

    return (
        <Container className="mt-5">
            <h2>Mis Reservas</h2>
            <Table striped bordered hover responsive className="mt-3">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {reservas.map((reserva) => (
                        <tr key={reserva.id}>
                            <td>{reserva.nombre_cliente}</td>
                            <td>{reserva.fecha}</td>
                            <td>{reserva.hora}</td>
                            <td>{reserva.estado}</td>
                            <td>
                                <Button
                                    variant="danger"
                                    onClick={() => cancelarReserva(reserva.id)}
                                >
                                    Cancelar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default MisReservas;
