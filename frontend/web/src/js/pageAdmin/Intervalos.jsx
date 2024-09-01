import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import NavBar from "../components/Navbar.jsx";
import AuthUser from "../pageauth/AuthUser";
import Config from "../Config";

const ManageIntervals = () => {
    const { empresaId } = useParams();
    const [intervalos, setIntervalos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        agenda_id: '',
        dias_semanas: [],
        hora_inicio: '',
        hora_fin: '',
    });
    const [errors, setErrors] = useState({});
    const { getUser } = AuthUser();

    useEffect(() => {
        fetchIntervalos();
    }, []);

    const fetchIntervalos = async () => {
        try {
            const response = await axios.get(`${Config.url()}/intervalos/empresa/${getUser().id}`);
            setIntervalos(response.data.data);
        } catch (error) {
            console.error('Error al obtener los intervalos:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        let dias_semanas = [...formData.dias_semanas];
        if (checked) {
            dias_semanas.push(value);
        } else {
            dias_semanas = dias_semanas.filter(dia => dia !== value);
        }
        setFormData({ ...formData, dias_semanas });
    };

    const validateForm = () => {
        const newErrors = {};
        if (formData.dias_semanas.length === 0) {
            newErrors.dias_semanas = 'Debe seleccionar al menos un día de la semana.';
        }
        if (formData.hora_inicio >= formData.hora_fin) {
            newErrors.hora_fin = 'La hora de inicio no puede ser igual o superior a la hora de fin.';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const data = {
            agenda_id: getUser().id.toString(),
            dias_semanas: formData.dias_semanas,
            hora_inicio: formData.hora_inicio,
            hora_fin: formData.hora_fin,
        };

        try {
            if (editMode) {
                await axios.put(`${Config.url()}/intervalos/${formData.id}`, data);
            } else {
                const response = await axios.post(`${Config.url()}/intervalo`, data);
                console.log('Respuesta del servidor:', response.data);
            }
            fetchIntervalos();
            setShowModal(false);
            setEditMode(false);
            setFormData({
                id: '',
                agenda_id: '',
                dias_semanas: [],
                hora_inicio: '',
                hora_fin: '',
            });
            setErrors({});
        } catch (error) {
            if (error.response) {
                console.error('Error al guardar el intervalo:', error.response.data);
                setErrors({ server: error.response.data.message });
            } else {
                console.error('Error al guardar el intervalo:', error.message);
            }
        }
    };

    const handleEdit = (intervalo) => {
        setFormData({
            id: intervalo.id,
            agenda_id: getUser().id.toString(),
            dias_semanas: JSON.parse(intervalo.dias_semanas),
            hora_inicio: intervalo.hora_inicio.slice(0, 5), 
            hora_fin: intervalo.hora_fin.slice(0, 5), 
        });
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${Config.url()}/intervalos/${id}`);
            fetchIntervalos();
        } catch (error) {
            console.error('Error al eliminar el intervalo:', error);
        }
    };

    const generateTimeOptions = () => {
        const times = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minutes = 0; minutes < 60; minutes += 15) {
                const formattedTime = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                times.push(formattedTime);
            }
        }
        return times;
    };

    

    return (
        <>
            <NavBar />
            <Container className="mt-2">
                <h1 className="mt-3">Horarios</h1>

                <Button variant="primary" onClick={() => {
                    setShowModal(true);
                    setEditMode(false);
                    setFormData({
                        id: '',
                        agenda_id: '',
                        dias_semanas: [],
                        hora_inicio: '',
                        hora_fin: '',
                    });
                    setErrors({});
                }}>Agregar horario</Button>
                <Table striped bordered hover responsive className="mt-3">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Días de la Semana</th>
                            <th>Hora Inicio</th>
                            <th>Hora Fin</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {intervalos.map(intervalo => (
                            <tr key={intervalo.id}>
                                <td>{intervalo.id}</td>
                                <td>{JSON.parse(intervalo.dias_semanas).join(', ')}</td>
                                <td>{intervalo.hora_inicio.slice(0, 5)}</td> 
                                <td>{intervalo.hora_fin.slice(0, 5)}</td> 
                                <td>
                                    <Button variant="warning" onClick={() => handleEdit(intervalo)}>Editar</Button>
                                    <Button variant="danger" onClick={() => handleDelete(intervalo.id)}>Eliminar</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {intervalos.length === 0 && (
                    <Alert variant="info">
                        Todavía no tienes ningún horario registrado. Utiliza el botón "Agregar horario" para crear tu primer horario.
                    </Alert>
                )}

                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>{editMode ? 'Editar Intervalo' : 'Agregar Intervalo'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="dias_semanas">
                                <Form.Label>Días de la Semana</Form.Label>
                                <div>
                                    {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map(dia => (
                                        <Form.Check
                                            inline
                                            label={dia}
                                            type="checkbox"
                                            value={dia}
                                            checked={formData.dias_semanas.includes(dia)}
                                            onChange={handleCheckboxChange}
                                            key={dia}
                                        />
                                    ))}
                                </div>
                                {errors.dias_semanas && <div className="text-danger">{errors.dias_semanas}</div>}
                            </Form.Group>
                            {/* <Form.Group controlId="hora_inicio">
                                <Form.Label>Hora Inicio</Form.Label>
                                <Form.Control
                                    type="time"
                                    name="hora_inicio"
                                    value={formData.hora_inicio}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.hora_inicio && <div className="text-danger">{errors.hora_inicio}</div>}
                            </Form.Group>
                            <Form.Group controlId="hora_fin">
                                <Form.Label>Hora Fin</Form.Label>
                                <Form.Control
                                    type="time"
                                    name="hora_fin"
                                    value={formData.hora_fin}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.hora_fin && <div className="text-danger">{errors.hora_fin}</div>}
                            </Form.Group> */}



                            <Form.Group controlId="hora_inicio">
    <Form.Label>Hora Inicio</Form.Label>
    <Form.Control
        as="select"  
        name="hora_inicio"
        value={formData.hora_inicio}
        onChange={handleInputChange}
        required
    >
        {generateTimeOptions().map((time) => (
            <option key={time} value={time}>
                {time}
            </option>
        ))}
    </Form.Control>
    {errors.hora_inicio && <div className="text-danger">{errors.hora_inicio}</div>}
</Form.Group>

<Form.Group controlId="hora_fin">
    <Form.Label>Hora Fin</Form.Label>
    <Form.Control
        as="select"  
        name="hora_fin"
        value={formData.hora_fin}
        onChange={handleInputChange}
        required
    >
        {generateTimeOptions().map((time) => (
            <option key={time} value={time}>
                {time}
            </option>
        ))}
    </Form.Control>
    {errors.hora_fin && <div className="text-danger">{errors.hora_fin}</div>}
</Form.Group>






                            {errors.server && <div className="text-danger">{errors.server}</div>}
                            <Button variant="primary" type="submit">{editMode ? 'Guardar Cambios' : 'Guardar'}</Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container>
        </>
    );
};

export default ManageIntervals;



// import React, { useState, useEffect } from 'react';
// import { Table, Button, Modal, Form, Container } from 'react-bootstrap';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';
// import NavBar from "../components/Navbar.jsx";
// import AuthUser from "../pageauth/AuthUser";
// import Config from "../Config";

// const ManageIntervals = () => {
//     const { empresaId } = useParams();
//     const [intervalos, setIntervalos] = useState([]);
//     const [showModal, setShowModal] = useState(false);
//     const [editMode, setEditMode] = useState(false);
//     const [formData, setFormData] = useState({
//         id: '',
//         agenda_id: '',
//         dias_semanas: [],
//         hora_inicio: '',
//         hora_fin: '',
//     });
//     const [errors, setErrors] = useState({});
//     const { getUser } = AuthUser();

//     useEffect(() => {
//         fetchIntervalos();
//     }, []);

//     const fetchIntervalos = async () => {
//         try {
//             const response = await axios.get(`${Config.url()}/intervalos/empresa/${getUser().id}`);
//             setIntervalos(response.data.data);
//         } catch (error) {
//             console.error('Error al obtener los intervalos:', error);
//         }
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//     };

//     const handleCheckboxChange = (e) => {
//         const { value, checked } = e.target;
//         let dias_semanas = [...formData.dias_semanas];
//         if (checked) {
//             dias_semanas.push(value);
//         } else {
//             dias_semanas = dias_semanas.filter(dia => dia !== value);
//         }
//         setFormData({ ...formData, dias_semanas });
//     };

//     const validateForm = () => {
//         const newErrors = {};
//         if (formData.dias_semanas.length === 0) {
//             newErrors.dias_semanas = 'Debe seleccionar al menos un día de la semana.';
//         }
//         if (formData.hora_inicio >= formData.hora_fin) {
//             newErrors.hora_fin = 'La hora de inicio no puede ser igual o superior a la hora de fin.';
//         }
//         return newErrors;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const validationErrors = validateForm();
//         if (Object.keys(validationErrors).length > 0) {
//             setErrors(validationErrors);
//             return;
//         }

//         const data = {
//             agenda_id: getUser().id.toString(),
//             dias_semanas: formData.dias_semanas,
//             hora_inicio: formData.hora_inicio,
//             hora_fin: formData.hora_fin,
//         };

//         try {
//             if (editMode) {
//                 await axios.put(`${Config.url()}/intervalos/${formData.id}`, data);
//             } else {
//                 const response = await axios.post(`${Config.url()}/intervalo`, data);
//                 console.log('Respuesta del servidor:', response.data);
//             }
//             fetchIntervalos();
//             setShowModal(false);
//             setEditMode(false);
//             setFormData({
//                 id: '',
//                 agenda_id: '',
//                 dias_semanas: [],
//                 hora_inicio: '',
//                 hora_fin: '',
//             });
//             setErrors({});
//         } catch (error) {
//             if (error.response) {
//                 console.error('Error al guardar el intervalo:', error.response.data);
//                 setErrors({ server: error.response.data.message });
//             } else {
//                 console.error('Error al guardar el intervalo:', error.message);
//             }
//         }
//     };

//     const handleEdit = (intervalo) => {
//         setFormData({
//             id: intervalo.id,
//             agenda_id: getUser().id.toString(),
//             dias_semanas: JSON.parse(intervalo.dias_semanas),
//             hora_inicio: intervalo.hora_inicio.slice(0, 5), 
//             hora_fin: intervalo.hora_fin.slice(0, 5), 
//         });
//         setEditMode(true);
//         setShowModal(true);
//     };

//     const handleDelete = async (id) => {
//         try {
//             await axios.delete(`${Config.url()}/intervalos/${id}`);
//             fetchIntervalos();
//         } catch (error) {
//             console.error('Error al eliminar el intervalo:', error);
//         }
//     };

//     return (
//         <>
//             <NavBar />
//             <Container className="mt-2">
//                 <h1 className="mt-3">Gestión de Intervalos</h1>
//                 <Button variant="primary" onClick={() => {
//                     setShowModal(true);
//                     setEditMode(false);
//                     setFormData({
//                         id: '',
//                         agenda_id: '',
//                         dias_semanas: [],
//                         hora_inicio: '',
//                         hora_fin: '',
//                     });
//                     setErrors({});
//                 }}>Agregar Intervalo</Button>
//                 <Table striped bordered hover responsive className="mt-3">
//                     <thead>
//                         <tr>
//                             <th>ID</th>
//                             <th>Días de la Semana</th>
//                             <th>Hora Inicio</th>
//                             <th>Hora Fin</th>
//                             <th>Acciones</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {intervalos.map(intervalo => (
//                             <tr key={intervalo.id}>
//                                 <td>{intervalo.id}</td>
//                                 <td>{JSON.parse(intervalo.dias_semanas).join(', ')}</td>
//                                 <td>{intervalo.hora_inicio.slice(0, 5)}</td> {/* Ensure format HH:mm */}
//                                 <td>{intervalo.hora_fin.slice(0, 5)}</td> {/* Ensure format HH:mm */}
//                                 <td>
//                                     <Button variant="warning" onClick={() => handleEdit(intervalo)}>Editar</Button>
//                                     <Button variant="danger" onClick={() => handleDelete(intervalo.id)}>Eliminar</Button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </Table>

//                 <Modal show={showModal} onHide={() => setShowModal(false)}>
//                     <Modal.Header closeButton>
//                         <Modal.Title>{editMode ? 'Editar Intervalo' : 'Agregar Intervalo'}</Modal.Title>
//                     </Modal.Header>
//                     <Modal.Body>
//                         <Form onSubmit={handleSubmit}>
//                             <Form.Group controlId="dias_semanas">
//                                 <Form.Label>Días de la Semana</Form.Label>
//                                 <div>
//                                     {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map(dia => (
//                                         <Form.Check
//                                             inline
//                                             label={dia}
//                                             type="checkbox"
//                                             value={dia}
//                                             checked={formData.dias_semanas.includes(dia)}
//                                             onChange={handleCheckboxChange}
//                                             key={dia}
//                                         />
//                                     ))}
//                                 </div>
//                                 {errors.dias_semanas && <div className="text-danger">{errors.dias_semanas}</div>}
//                             </Form.Group>
//                             <Form.Group controlId="hora_inicio">
//                                 <Form.Label>Hora Inicio</Form.Label>
//                                 <Form.Control
//                                     type="time"
//                                     name="hora_inicio"
//                                     value={formData.hora_inicio}
//                                     onChange={handleInputChange}
//                                     required
//                                 />
//                                 {errors.hora_inicio && <div className="text-danger">{errors.hora_inicio}</div>}
//                             </Form.Group>
//                             <Form.Group controlId="hora_fin">
//                                 <Form.Label>Hora Fin</Form.Label>
//                                 <Form.Control
//                                     type="time"
//                                     name="hora_fin"
//                                     value={formData.hora_fin}
//                                     onChange={handleInputChange}
//                                     required
//                                 />
//                                 {errors.hora_fin && <div className="text-danger">{errors.hora_fin}</div>}
//                             </Form.Group>
//                             {errors.server && <div className="text-danger">{errors.server}</div>}
//                             <Button variant="primary" type="submit">{editMode ? 'Guardar Cambios' : 'Guardar'}</Button>
//                         </Form>
//                     </Modal.Body>
//                 </Modal>
//             </Container>
//         </>
//     );
// };

// export default ManageIntervals;
