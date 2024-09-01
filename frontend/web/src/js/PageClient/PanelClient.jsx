import React, { useEffect, useState } from 'react';
import { Card, Button, Container, Row, Col, Form } from 'react-bootstrap';
import { FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Config from "../Config";
import '../../css/Cliente.css'; // Import the CSS file
import NavBar from "../components/Navbar.jsx";

const PanelClient = () => {
    const [empresas, setEmpresas] = useState([]);
    const [categorias, setCategorias] = useState({});
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const navigate = useNavigate();
    const [departamentos, setDepartamentos] = useState([]);
const [ciudades, setCiudades] = useState([]);
const [filtroDepartamento, setFiltroDepartamento] = useState('');
const [filtroCiudad, setFiltroCiudad] = useState('');


    useEffect(() => {
        fetchEmpresas();
        obtenerCategorias();
        obtenerDepartamentos();
    }, []);

    const fetchEmpresas = async () => {
        try {
            const response = await Config.getEmpresas();
           // const response = await axios.get('https://mireservaotti2.miguelsordi.com/api/v1/empresas');
            setEmpresas(response.data.data);
        } catch (error) {
            console.error('Error al obtener empresas:', error);
        }
    };

    const obtenerCategorias = async () => {
        try {
            const response = await axios.get(`${Config.url()}/categorias`);
            console.log("Categorías:", response.data); // Verifica los datos recibidos
            const categoriasMap = {};
            response.data.forEach((cat) => {
                categoriasMap[cat.id] = cat.name;
            });
            console.log("Mapeo de categorías:", categoriasMap); // Verifica el mapeo
            setCategorias(categoriasMap); // Accede al array de categorías correctamente
        } catch (error) {
            console.error("Error al cargar categorías:", error);
        }
    };

    const manejarBusqueda = (event) => {
        setTerminoBusqueda(event.target.value);
    };

    const manejarFiltroCategoria = (event) => {
        setFiltroCategoria(event.target.value);
    };

    // const empresasFiltradas = empresas.filter((empresa) =>
    //     empresa.name.toLowerCase().includes(terminoBusqueda.toLowerCase()) &&
    //     (filtroCategoria === '' || empresa.categoria_id === Number(filtroCategoria))
    // );

    const empresasFiltradas = empresas.filter((empresa) =>
        empresa.name.toLowerCase().includes(terminoBusqueda.toLowerCase()) &&
        (filtroCategoria === '' || empresa.categoria_id === Number(filtroCategoria)) &&
        (filtroDepartamento === '' || empresa.departamento_id === Number(filtroDepartamento)) &&
        (filtroCiudad === '' || empresa.ciudad_id === Number(filtroCiudad))
    );

    const obtenerDepartamentos = async () => {
        try {
            const response = await axios.get(`${Config.url()}/departamentos`);
            setDepartamentos(response.data); // Asegúrate de que el backend devuelve un array de departamentos
        } catch (error) {
            console.error("Error al cargar departamentos:", error);
        }
    };
    
    const obtenerCiudades = async (departamentoId) => {
        try {
            const response = await axios.get(`${Config.url()}/departamento/ciudades/${departamentoId}`);
            setCiudades(response.data); // Asegúrate de que el backend devuelve un array de ciudades
        } catch (error) {
            console.error("Error al cargar ciudades:", error);
        }
    };

    const manejarFiltroDepartamento = (event) => {
        const departamentoId = event.target.value;
        console.log(departamentoId)
        setFiltroDepartamento(departamentoId);
        obtenerCiudades(departamentoId); // Cargar las ciudades del departamento seleccionado
        setFiltroCiudad(''); // Reiniciar el filtro de ciudad cuando se cambia de departamento
    };
    
    const manejarFiltroCiudad = (event) => {
        setFiltroCiudad(event.target.value);
    };
    

    return (
        <>
      <NavBar />

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
                {Object.keys(categorias).map((key) => (
                    <option key={key} value={key}>
                        {categorias[key]}
                    </option>
                ))}
            </Form.Control>
        </Col>
    </Row>
    <Row className="mb-4">
        <Col md={6}>
            <Form.Control as="select" value={filtroDepartamento} onChange={manejarFiltroDepartamento}>
                <option value="">Filtrar por departamento</option>
                {departamentos.map((departamento) => (
                    <option key={departamento.id} value={departamento.id}>
                        {departamento.name}
                    </option>
                ))}
            </Form.Control>
        </Col>
        <Col md={6}>
            <Form.Control as="select" value={filtroCiudad} onChange={manejarFiltroCiudad} disabled={!filtroDepartamento}>
                <option value="">Filtrar por ciudad</option>
                {ciudades.map((ciudad) => (
                    <option key={ciudad.id} value={ciudad.id}>
                        {ciudad.name}
                    </option>
                ))}
            </Form.Control>
        </Col>
    </Row>
    <div className="grid-container">
        {empresasFiltradas.length > 0 ? (
            empresasFiltradas.map((empresa) => (
                <Card key={empresa.id} className="custom-card">
                    <div className="image-container">
                        <Card.Img 
                            variant="top" 
                            src={empresa.profile_picture ? `${Config.urlFoto()}${empresa.profile_picture}` : 'https://via.placeholder.com/150'}
                            alt={empresa.name} 
                            className="custom-card-img"
                        />
                    </div>
                    <Card.Body className="custom-card-body">
                        <Card.Title className="text-center">{empresa.name}</Card.Title>
                        <Card.Text className="text-center">Categoria: {categorias[empresa.categoria_id]}</Card.Text>
                        <Card.Text className="text-center">
                            <FaMapMarkerAlt /> {empresa.address}
                        </Card.Text>
                        
                        <div className="text-center mt-3">
                            <Button variant="primary" onClick={() => navigate(`/${empresa.url}`)}>
                                Ver Empresa
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            ))
        ) : (
            <p>No se encontraron empresas</p>
            /* <p>Cargando...</p> */
        )}
    </div>
</Container>

        </>
    );
};

export default PanelClient;
