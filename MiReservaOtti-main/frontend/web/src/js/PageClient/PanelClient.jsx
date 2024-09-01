import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Row, Col, Form } from 'react-bootstrap';
import { FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';

const PanelClient = () => {
    const [empresas, setEmpresas] = useState([]);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        fetchEmpresas();
    }, []);

    const fetchEmpresas = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/v1/empresas');
            setEmpresas(response.data.data);
            const categoriasUnicas = [...new Set(response.data.data.map(empresa => empresa.categoria))];
            setCategorias(categoriasUnicas);
        } catch (error) {
            console.error('Error al obtener empresas:', error);
        }
    };

    const manejarBusqueda = (event) => {
        setTerminoBusqueda(event.target.value);
    };

    const manejarFiltroCategoria = (event) => {
        setFiltroCategoria(event.target.value);
    };

    const empresasFiltradas = empresas.filter((empresa) =>
        empresa.name.toLowerCase().includes(terminoBusqueda.toLowerCase()) &&
        (filtroCategoria === '' || empresa.categoria === filtroCategoria)
    );

    return (
        <Container className="mt-5">
            <Row className="mb-4">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por nombre"
                        value={terminoBusqueda}
                        onChange={manejarBusqueda}
                    />
                </Col>
                <Col md={6}>
                    <Form.Control as="select" value={filtroCategoria} onChange={manejarFiltroCategoria}>
                        <option value="">Filtrar por categoría</option>
                        {categorias.map((categoria, index) => (
                            <option key={index} value={categoria}>
                                {categoria}
                            </option>
                        ))}
                    </Form.Control>
                </Col>
            </Row>
            <Row>
                {empresasFiltradas.map((empresa) => (
                    <Col key={empresa.id} sm={12} md={6} lg={4} className="mb-4">
                        <Card>
                            <Card.Img variant="top" src={empresa.profile_picture} alt={empresa.name} />
                            <Card.Body>
                                <Card.Title>{empresa.name}</Card.Title>
                                <Card.Text>
                                    <FaMapMarkerAlt /> {empresa.address}
                                </Card.Text>
                                <Card.Text>{empresa.categoria_id}</Card.Text>
                                <Button variant="primary">Reservar</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default PanelClient;
