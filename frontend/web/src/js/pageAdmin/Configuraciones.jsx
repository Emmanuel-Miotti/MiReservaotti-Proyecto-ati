import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Alert, Button, Form, FormGroup, FormLabel, FormControl, Table, Spinner } from 'react-bootstrap';
import AuthUser from "../pageauth/AuthUser";
import { useNavigate } from "react-router-dom";
import Config from "../Config";

const IntervalConfig = () => {
    const navigate = useNavigate();
    const { getUser } = AuthUser();
    const [user] = useState(getUser());
    const [form, setForm] = useState({
        agenda_id: user.id,
        dias_semanas: [],
        hora_inicio: '',
        hora_fin: ''
    });
    const [intervalos, setIntervalos] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIntervalos();
    }, []);

    const fetchIntervalos = async () => {
        try {
            setLoading(true);
            const response = await Config.getIntervalosEmpresa(user.id);
            console.log(response.data);
            console.log(user.id);
            setIntervalos(response.data.data);
        } catch (error) {
            console.error("Error fetching intervalos", error);
            setError("Error fetching intervalos");
            setIntervalos([]);
        } finally {
            setLoading(false);
        }
    };

    const saveIntervalo = async (e) => {
        e.preventDefault();
        const method = editingId ? 'put' : 'post';
        const url = editingId ? `https://mireservaotti2.miguelsordi.com/api/v1/intervalos/${editingId}` : 'https://mireservaotti2.miguelsordi.com/api/v1/intervalos';

        try {
            await axios[method](url, form);
            fetchIntervalos();
            resetForm();
            setSuccess("Intervalo guardado exitosamente");
        } catch (error) {
            console.error("Error saving intervalo", error);
            setError("Error saving intervalo");
        }
    };

    const editIntervalo = (intervalo) => {
        setForm({
            agenda_id: intervalo.agenda_id,
            dias_semanas: Array.isArray(intervalo.dias_semanas) ? intervalo.dias_semanas : JSON.parse(intervalo.dias_semanas),
            hora_inicio: intervalo.hora_inicio,
            hora_fin: intervalo.hora_fin
        });
        setEditingId(intervalo.id);
        setError(null);
        setSuccess(null);
    };

    const deleteIntervalo = async (id) => {
        try {
            await axios.delete(`/api/intervalos/${id}`);
            fetchIntervalos();
            setSuccess("Intervalo eliminado exitosamente");
        } catch (error) {
            console.error("Error deleting intervalo", error);
            setError("Error deleting intervalo");
        }
    };

    const resetForm = () => {
        setForm({
            agenda_id: user.id,
            dias_semanas: [],
            hora_inicio: '',
            hora_fin: ''
        });
        setEditingId(null);
        setError(null);
        setSuccess(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    };

    const handleMultiSelectChange = (e) => {
        const options = e.target.options;
        const values = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                values.push(options[i].value);
            }
        }
        setForm(prevForm => ({
            ...prevForm,
            dias_semanas: values
        }));
    };

    const diasDeLaSemana = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

    return (
        <div className="container mt-5">
            <div className="mb-3">
                <Button variant="secondary" onClick={() => navigate("/Empresa")}>
                    Volver
                </Button>
            </div>
            <h1>Configuración de Intervalos</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={saveIntervalo}>
                <FormGroup className="mb-3">
                    <FormLabel htmlFor="dias_semanas">Días de la Semana:</FormLabel>
                    <FormControl
                        as="select"
                        name="dias_semanas"
                        id="dias_semanas"
                        multiple
                        value={form.dias_semanas}
                        onChange={handleMultiSelectChange}
                    >
                        <option value="lunes">Lunes</option>
                        <option value="martes">Martes</option>
                        <option value="miercoles">Miércoles</option>
                        <option value="jueves">Jueves</option>
                        <option value="viernes">Viernes</option>
                        <option value="sabado">Sábado</option>
                        <option value="domingo">Domingo</option>
                    </FormControl>
                </FormGroup>
                <FormGroup className="mb-3">
                    <FormLabel htmlFor="hora_inicio">Hora Inicio:</FormLabel>
                    <FormControl
                        type="time"
                        name="hora_inicio"
                        id="hora_inicio"
                        value={form.hora_inicio}
                        onChange={handleChange}
                    />
                </FormGroup>
                <FormGroup className="mb-3">
                    <FormLabel htmlFor="hora_fin">Hora Fin:</FormLabel>
                    <FormControl
                        type="time"
                        name="hora_fin"
                        id="hora_fin"
                        value={form.hora_fin}
                        onChange={handleChange}
                    />
                </FormGroup>
                <Button variant="primary" type="submit">Guardar</Button>
            </Form>
            {loading ? (
                <div className="d-flex justify-content-center mt-4">
                    <Spinner animation="border" />
                </div>
            ) : (
                <div className="mt-4">
                    {intervalos.length === 0 ? (
                        <Alert variant="info">No hay intervalos configurados.</Alert>
                    ) : (
                        <>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Día</th>
                                        <th>Hora Inicio</th>
                                        <th>Hora Fin</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {diasDeLaSemana.map(dia => {
                                        const intervalosDelDia = intervalos.filter(intervalo => JSON.parse(intervalo.dias_semanas).includes(dia));
                                        if (intervalosDelDia.length === 0) {
                                            return (
                                                <tr key={dia}>
                                                    <td>{dia.charAt(0).toUpperCase() + dia.slice(1)}</td>
                                                    <td colSpan="3">No hay intervalos configurados para este día.</td>
                                                </tr>
                                            );
                                        }
                                        return intervalosDelDia.map(intervalo => (
                                            <tr key={intervalo.id}>
                                                <td>{dia.charAt(0).toUpperCase() + dia.slice(1)}</td>
                                                <td>{intervalo.hora_inicio}</td>
                                                <td>{intervalo.hora_fin}</td>
                                                <td>
                                                    <Button variant="secondary" size="sm" className="me-2" onClick={() => editIntervalo(intervalo)}>
                                                        <FaEdit />
                                                    </Button>
                                                    <Button variant="danger" size="sm" onClick={() => deleteIntervalo(intervalo.id)}>
                                                        <FaTrash />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ));
                                    })}
                                </tbody>
                            </Table>
                            <h5>Horarios</h5>
                            <ul>
                                {intervalos.length > 0 ? (
                                    intervalos.map((intervalo) => {
                                        const diasSemanaArray = JSON.parse(intervalo.dias_semanas);
                                        return (
                                            <li key={intervalo.id}>
                                                <strong>{diasSemanaArray.join(", ")}</strong>:{" "}
                                                {intervalo.hora_inicio.slice(0, 5)} -{" "}
                                                {intervalo.hora_fin.slice(0, 5)}
                                            </li>
                                        );
                                    })
                                ) : (
                                    <li>No hay horarios disponibles.</li>
                                )}
                            </ul>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default IntervalConfig;
