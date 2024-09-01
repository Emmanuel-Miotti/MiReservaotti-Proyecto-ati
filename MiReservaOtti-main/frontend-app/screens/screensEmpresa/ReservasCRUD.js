import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import { UserContext } from "../../contexts/UserContext";

const ReservaCRUD = () => {
  const user = useContext(UserContext).user;
  const [reservas, setReservas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    cliente_id: '',
    agenda_id: '',
    fecha: '',
    hora: '',
    duracion: 60,
    precio: 0,
    estado: 'reservado',
    observaciones: '',
    servicios: [],
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchReservas();
    // fetchReservasSinUsuario();
  }, []);

  const fetchReservas = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/v1/reservas/empresa/${user.id}`);
      setReservas(response.data.data);
    } catch (error) {
      console.error('Error al obtener reservas:', error);
    }
  };
  // const fetchReservasSinUsuario = async () => {
  //   try {
  //     const response = await axios.get(`http://127.0.0.1:8000/api/v1/reservas-usuario-no-registrado/${user.id}`);
  //     setReservas(response.data);
  //     console.log(response.data);
  //   } catch (error) {
  //     console.error('Error al obtener las reservas:', error);
  //   }
  // };

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await axios.put(`http://127.0.0.1:8000/api/v1/reservas/${formData.id}`, formData);
      } else {
        await axios.post('http://127.0.0.1:8000/api/v1/reservas', formData);
      }
      fetchReservas();
      setShowModal(false);
      setFormData({
        id: null,
        cliente_id: '',
        agenda_id: '',
        fecha: '',
        hora: '',
        duracion: 60,
        precio: 0,
        estado: 'reservado',
        observaciones: '',
        servicios: [],
      });
    } catch (error) {
      console.error('Error al guardar reserva:', error);
      if (error.response && error.response.status === 422) {
        setFormErrors(error.response.data);
      }
    }
  };

  const handleEdit = (reserva) => {
    setFormData(reserva);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/reservas/${id}`);
      fetchReservas();
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Agregar Reserva" onPress={() => setShowModal(true)} />
      <ScrollView>
        {reservas.map((reserva) => (
          <View key={reserva.id} style={styles.reservaContainer}>
            <Text>ID: {reserva.id}</Text>
            <Text>Cliente: {reserva.cliente_id}</Text>
            <Text>Agenda: {reserva.agenda_id}</Text>
            <Text>Fecha: {reserva.fecha}</Text>
            <Text>Hora: {reserva.hora}</Text>
            <Text>Duración: {reserva.duracion} min</Text>
            <Text>Precio: ${reserva.precio}</Text>
            <Text>Estado: {reserva.estado}</Text>
            <View style={styles.buttonContainer}>
              <Button title="Editar" onPress={() => handleEdit(reserva)} />
              <Button title="Eliminar" onPress={() => handleDelete(reserva.id)} color="red" />
            </View>
          </View>
        ))}
      </ScrollView>
      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editMode ? 'Editar Reserva' : 'Agregar Reserva'}</Text>
          <ScrollView>
            <TextInput
              placeholder="Cliente ID"
              value={formData.cliente_id}
              onChangeText={(value) => handleInputChange('cliente_id', value)}
              style={styles.input}
            />
            <TextInput
              placeholder="Agenda ID"
              value={formData.agenda_id}
              onChangeText={(value) => handleInputChange('agenda_id', value)}
              style={styles.input}
            />
            <TextInput
              placeholder="Fecha"
              value={formData.fecha}
              onChangeText={(value) => handleInputChange('fecha', value)}
              style={styles.input}
            />
            <TextInput
              placeholder="Hora"
              value={formData.hora}
              onChangeText={(value) => handleInputChange('hora', value)}
              style={styles.input}
            />
            <TextInput
              placeholder="Duración (minutos)"
              value={formData.duracion.toString()}
              onChangeText={(value) => handleInputChange('duracion', parseInt(value))}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Precio"
              value={formData.precio.toString()}
              onChangeText={(value) => handleInputChange('precio', parseFloat(value))}
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Estado"
              value={formData.estado}
              onChangeText={(value) => handleInputChange('estado', value)}
              style={styles.input}
            />
            <TextInput
              placeholder="Observaciones"
              value={formData.observaciones}
              onChangeText={(value) => handleInputChange('observaciones', value)}
              style={styles.input}
              multiline
            />
            <TextInput
              placeholder="Servicios (separados por comas)"
              value={formData.servicios.join(',')}
              onChangeText={(value) => handleInputChange('servicios', value.split(','))}
              style={styles.input}
            />
          </ScrollView>
          <View style={styles.buttonContainer}>
            <Button title={editMode ? 'Guardar Cambios' : 'Agregar Reserva'} onPress={handleSubmit} />
            <Button title="Cancelar" onPress={() => setShowModal(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  reservaContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 8,
    borderRadius: 4,
  },
});

export default ReservaCRUD;

// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   Button,
//   TextInput,
//   Modal,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity
// } from 'react-native';
// import axios from 'axios';
// import { UserContext } from "../../contexts/UserContext";

// const ReservaCRUD = () => {
//   const user = useContext(UserContext).user;
//   const [reservas, setReservas] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [formData, setFormData] = useState({
//     id: null,
//     cliente_id: '',
//     agenda_id: '',
//     fecha: '',
//     hora: '',
//     duracion: 60,
//     precio: 0,
//     estado: 'reservado',
//     observaciones: '',
//     servicios: [],
//   });

//   useEffect(() => {
//     fetchReservas();
//   }, []);

//   const fetchReservas = async () => {
//     try {
//       const response = await axios.get(`http://127.0.0.1:8000/api/v1/reservas/empresa/${user.id}`);
//       setReservas(response.data.data);
//     } catch (error) {
//       console.error('Error al obtener reservas:', error);
//     }
//   };

//   const handleInputChange = (name, value) => {
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   const handleSubmit = async () => {
//     try {
//       if (editMode) {
//         await axios.put(`http://127.0.0.1:8000/api/v1/reservas/${formData.id}`, formData);
//       } else {
//         await axios.post('http://127.0.0.1:8000/api/v1/reservas', formData);
//       }
//       fetchReservas();
//       setShowModal(false);
//       setFormData({
//         id: null,
//         cliente_id: '',
//         agenda_id: '',
//         fecha: '',
//         hora: '',
//         duracion: 0,
//         precio: 0,
//         estado: 'reservado',
//         observaciones: '',
//         servicios: [],
//       });
//     } catch (error) {
//       console.error('Error al guardar reserva:', error);
//     }
//   };

//   const handleEdit = (reserva) => {
//     setFormData(reserva);
//     setEditMode(true);
//     setShowModal(true);
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`http://127.0.0.1:8000/api/v1/reservas/${id}`);
//       fetchReservas();
//     } catch (error) {
//       console.error('Error al eliminar reserva:', error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Button title="Agregar Reserva" onPress={() => setShowModal(true)} />
//       <ScrollView>
//         {reservas.map((reserva) => (
//           <View key={reserva.id} style={styles.reservaContainer}>
//             <Text>ID: {reserva.id}</Text>
//             <Text>Cliente: {reserva.cliente_id}</Text>
//             <Text>Agenda: {reserva.agenda_id}</Text>
//             <Text>Fecha: {reserva.fecha}</Text>
//             <Text>Hora: {reserva.hora}</Text>
//             <Text>Duración: {reserva.duracion} min</Text>
//             <Text>Precio: ${reserva.precio}</Text>
//             <Text>Estado: {reserva.estado}</Text>
//             <View style={styles.buttonContainer}>
//               <Button title="Editar" onPress={() => handleEdit(reserva)} />
//               <Button title="Eliminar" onPress={() => handleDelete(reserva.id)} color="red" />
//             </View>
//           </View>
//         ))}
//       </ScrollView>
//       <Modal visible={showModal} animationType="slide">
//         <View style={styles.modalContainer}>
//           <Text style={styles.modalTitle}>{editMode ? 'Editar Reserva' : 'Agregar Reserva'}</Text>
//           <ScrollView>
//             <TextInput
//               placeholder="Cliente ID"
//               value={formData.cliente_id}
//               onChangeText={(value) => handleInputChange('cliente_id', value)}
//               style={styles.input}
//             />
//             <TextInput
//               placeholder="Agenda ID"
//               value={formData.agenda_id}
//               onChangeText={(value) => handleInputChange('agenda_id', value)}
//               style={styles.input}
//             />
//             <TextInput
//               placeholder="Fecha"
//               value={formData.fecha}
//               onChangeText={(value) => handleInputChange('fecha', value)}
//               style={styles.input}
//             />
//             <TextInput
//               placeholder="Hora"
//               value={formData.hora}
//               onChangeText={(value) => handleInputChange('hora', value)}
//               style={styles.input}
//             />
//             <TextInput
//               placeholder="Duración (minutos)"
//               value={formData.duracion.toString()}
//               onChangeText={(value) => handleInputChange('duracion', parseInt(value))}
//               style={styles.input}
//               keyboardType="numeric"
//             />
//             <TextInput
//               placeholder="Precio"
//               value={formData.precio.toString()}
//               onChangeText={(value) => handleInputChange('precio', parseFloat(value))}
//               style={styles.input}
//               keyboardType="numeric"
//             />
//             <TextInput
//               placeholder="Estado"
//               value={formData.estado}
//               onChangeText={(value) => handleInputChange('estado', value)}
//               style={styles.input}
//             />
//             <TextInput
//               placeholder="Observaciones"
//               value={formData.observaciones}
//               onChangeText={(value) => handleInputChange('observaciones', value)}
//               style={styles.input}
//               multiline
//             />
//           </ScrollView>
//           <View style={styles.buttonContainer}>
//             <Button title={editMode ? 'Guardar Cambios' : 'Agregar Reserva'} onPress={handleSubmit} />
//             <Button title="Cancelar" onPress={() => setShowModal(false)} color="red" />
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   reservaContainer: {
//     marginBottom: 16,
//     padding: 16,
//     backgroundColor: '#f9f9f9',
//     borderRadius: 8,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 8,
//   },
//   modalContainer: {
//     flex: 1,
//     padding: 16,
//   },
//   modalTitle: {
//     fontSize: 18,
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     padding: 8,
//     marginVertical: 8,
//     borderRadius: 4,
//   },
// });

// export default ReservaCRUD;
