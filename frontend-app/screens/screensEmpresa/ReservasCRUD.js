import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { UserContext } from "../../contexts/UserContext";
import DateTimePicker from '@react-native-community/datetimepicker';
import BotonVolver from "../components/BotonVolver"; 
import Config from '../Config';
import moment from 'moment';

const initializeFormData = () => {
  return {
    nombre_cliente: '',
    email_cliente: '',
    telefono_cliente: '',
    agenda_id: '',
    fecha: new Date(),
    hora: new Date(),
    duracion: 60,
    precio: 0,
    estado: 'reservado',
    observaciones: '',
    servicios: [],
    sin_cliente: false,
  };
};

const ReservasCRUD = ({ navigation }) => {
  const user = useContext(UserContext).user;
  const [reservasPendientes, setReservasPendientes] = useState([]);
  const [reservasPasadas, setReservasPasadas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(initializeFormData());
  const [formErrors, setFormErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [availableServices, setAvailableServices] = useState([]);

  useEffect(() => {
    fetchReservas();
    fetchServicios();
  }, []);

  const fetchReservas = async () => {
    try {
      // const response = await axios.get(`${Config.url()}/reservas/empresa/${user.id}`);
      // const todasReservas = response.data.data;
      const responseReservas = await axios.get(
        `${Config.url()}/reservas/empresa/${user.id}`
      );
      const responseReservasUsuariosNoRegistrados = await axios.get(
        `${Config.url()}/reservas2/empresa/${user.id}`
      );

      const todasReservas = [
        ...responseReservas.data.data,
        ...responseReservasUsuariosNoRegistrados.data.data,
      ];


      console.log(todasReservas)

      const now = moment();

      const pendientes = todasReservas.filter(reserva =>
        moment(reserva.fecha + ' ' + reserva.hora).isSameOrAfter(now)
      );

      const pasadas = todasReservas.filter(reserva =>
        moment(reserva.fecha + ' ' + reserva.hora).isBefore(now)
      );

      console.log("pendientes")
      console.log(pendientes)
      setReservasPendientes(pendientes);
      setReservasPasadas(pasadas);

    } catch (error) {
      console.error('Error al obtener reservas:', error);
    }
  };

  const fetchServicios = async () => {
    try {
      const response = await axios.get(`${Config.url()}/servicios/empresa/${user.id}`);
      setAvailableServices(response.data);
    } catch (error) {
      console.error('Error al obtener servicios:', error);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.fecha;
    setShowDatePicker(false);
    setFormData({ ...formData, fecha: currentDate });
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || formData.hora;
    setShowTimePicker(false);
    setFormData({ ...formData, hora: currentTime });
  };

  const handleServiceSelection = (serviceId) => {
    const alreadySelected = formData.servicios.includes(serviceId);
    let updatedServices = [];

    if (alreadySelected) {
      updatedServices = formData.servicios.filter(id => id !== serviceId);
    } else {
      updatedServices = [...formData.servicios, serviceId];
    }

    // Recalcular precio y duración
    let totalPrecio = 0;
    let totalDuracion = 0;

    updatedServices.forEach(id => {
      const service = availableServices.find(service => service.id === id);
      if (service) {
        const precio = parseFloat(service.precio);
        if (!isNaN(precio)) {
          totalPrecio += precio;
        }
        totalDuracion += service.duracion;
      }
    });

    setFormData({
      ...formData,
      servicios: updatedServices,
      precio: totalPrecio.toFixed(2),
      duracion: totalDuracion,
    });
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        agenda_id: user.id,
        fecha: formData.fecha.toISOString().split('T')[0],
        hora: formData.hora.toTimeString().split(' ')[0],
        servicios: JSON.stringify(formData.servicios),
      };

      if (editMode) {
        await axios.put(`${Config.url()}/reservas/${formData.id}`, data);
      } else {
        if (formData.sin_cliente) {
          delete data.cliente_id;
          await axios.post(`${Config.url()}/reservas/usuarioNoRegistrado`, data);
        } else {
          await axios.post(`${Config.url()}/reservas`, data);
        }
      }
      fetchReservas();
      setShowModal(false);
      setFormData(initializeFormData());
    } catch (error) {
      console.error('Error al guardar reserva:', error);
      if (error.response && error.response.status === 422) {
        setFormErrors(error.response.data);
        Alert.alert('Error', 'Ocurrió un error al intentar guardar la reserva. Verifique los datos ingresados.');
      }
    }
  };

  const handleEdit = (reserva) => {
    setFormData({
      ...reserva,
      fecha: new Date(reserva.fecha),
      hora: new Date(`${reserva.fecha}T${reserva.hora}`),
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleCancel = async (id) => {
    try {
      await axios.put(`${Config.url()}/reservas/${id}/cancelar`);
      fetchReservas();
      Alert.alert('Reserva cancelada', 'La reserva se ha cancelado exitosamente.');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        const errorMessage = error.response.data.message || 'No se puede cancelar la reserva.';
        Alert.alert('No se puede cancelar', errorMessage);
      } else {
        console.error('Error al cancelar reserva:', error);
        Alert.alert('Error', 'Ocurrió un error al intentar cancelar la reserva.');
      }
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddWithoutClient = () => {
    setFormData({ ...initializeFormData(), sin_cliente: true });
    setShowModal(true);
  };

  return (
    <View style={styles.container}>
      <BotonVolver onBack={handleBack} />
      <ScrollView>
        {/* <Button title="Agregar Reserva sin Cliente" onPress={handleAddWithoutClient} color="#6c757d" /> */}

        <Text style={styles.sectionTitle}>Reservas Pendientes</Text>
        {reservasPendientes.map((reserva) => (
          <View key={reserva.id} style={styles.reservaContainer}>
            {/* <Text>ID: {reserva.id}</Text> */}
            <Text>Cliente: {reserva.cliente ? reserva.cliente.name : reserva.nombre_cliente}</Text>
            {/* <Text>Agenda: {reserva.agenda_id}</Text> */}
            <Text>Fecha: {reserva.fecha}</Text>
            <Text>Hora: {reserva.hora}</Text>
            <Text>Duración: {reserva.duracion} min</Text>
            <Text>Precio: ${reserva.precio}</Text>
            <Text>Estado: {reserva.estado}</Text>
            <View style={styles.buttonContainer}>
             <Button title="Editar" /*  onPress={() => handleEdit(reserva)} */ />
              {reserva.estado !== 'cancelado' && (
                <Button title="Cancelar Reserva"  /* onPress={() => handleCancel(reserva.id)}*/ color="red" />
              )}
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Reservas Pasadas</Text>
        {reservasPasadas.map((reserva) => (
          <View key={reserva.id} style={styles.reservaContainer}>
            {/* <Text>ID: {reserva.id}</Text> */}
            {/* <Text>Cliente: {reserva.cliente_id || "Sin cliente"}</Text> */}
            <Text>Cliente: {reserva.cliente ? reserva.cliente.name : reserva.nombre_cliente}</Text>
            {/* <Text>Agenda: {reserva.agenda_id}</Text> */}
            <Text>Fecha: {reserva.fecha}</Text>
            <Text>Hora: {reserva.hora}</Text>
            <Text>Duración: {reserva.duracion} min</Text>
            <Text>Precio: ${reserva.precio}</Text>
            <Text>Estado: {reserva.estado}</Text>
            {/* No mostramos botones de edición o cancelación para reservas pasadas */}
          </View>
        ))}
      </ScrollView>
      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editMode ? 'Editar Reserva' : 'Agregar Reserva'}</Text>
          <ScrollView>
            {!formData.sin_cliente && (
              <TextInput
                placeholder="Cliente ID"
                value={formData.cliente_id}
                onChangeText={(value) => handleInputChange('cliente_id', value)}
                style={styles.input}
              />
            )}

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                placeholder="Fecha"
                value={formData.fecha.toDateString()}
                editable={false}
                style={styles.input}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={formData.fecha}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
              <TextInput
                placeholder="Hora"
                value={formData.hora.toTimeString().split(' ')[0]}
                editable={false}
                style={styles.input}
              />
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={formData.hora}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}

            <View style={styles.input}>
              <Text>Seleccionar Servicios:</Text>
              {availableServices.map(service => (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => handleServiceSelection(service.id)}
                >
                  <Text style={{ color: formData.servicios.includes(service.id) ? 'green' : 'black' }}>
                    {service.nombre} - ${parseFloat(service.precio).toFixed(2)} - {service.duracion} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Duración (minutos)"
              value={formData.duracion.toString()}
              onChangeText={(value) => handleInputChange('duracion', parseInt(value))}
              style={styles.input}
              keyboardType="numeric"
              editable={false} // No editable porque se calcula automáticamente
            />
            <TextInput
              placeholder="Precio"
              value={formData.precio.toString()}
              onChangeText={(value) => handleInputChange('precio', parseFloat(value))}
              style={styles.input}
              keyboardType="numeric"
              editable={false} // No editable porque se calcula automáticamente
            />
            <TextInput
              placeholder="Observaciones"
              value={formData.observaciones}
              onChangeText={(value) => handleInputChange('observaciones', value)}
              style={styles.input}
              multiline
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default ReservasCRUD;



// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   Button,
//   TextInput,
//   Modal,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
// } from 'react-native';
// import axios from 'axios';
// import { UserContext } from "../../contexts/UserContext";
// import DateTimePicker from '@react-native-community/datetimepicker';
// import BotonVolver from "../components/BotonVolver"; 
// import Config from '../Config';
// import moment from 'moment';

// const initializeFormData = () => {
//   return {
//     id: null,
//     cliente_id: '',
//     agenda_id: '',
//     fecha: new Date(),
//     hora: new Date(),
//     duracion: 60,
//     precio: 0,
//     estado: 'reservado',
//     observaciones: '',
//     servicios: [],
//     sin_cliente: false,
//   };
// };

// const ReservasCRUD = ({ navigation }) => {
//   const user = useContext(UserContext).user;
//   const [reservasPendientes, setReservasPendientes] = useState([]);
//   const [reservasPasadas, setReservasPasadas] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [formData, setFormData] = useState(initializeFormData());
//   const [formErrors, setFormErrors] = useState({});
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const [availableServices, setAvailableServices] = useState([]);

//   useEffect(() => {
//     fetchReservas();
//     fetchServicios();
//   }, []);

//   const fetchReservas = async () => {
//     try {
//       const response = await axios.get(`${Config.url()}/reservas/empresa/${user.id}`);
//       const todasReservas = response.data.data;

//       const now = moment();

//       const pendientes = todasReservas.filter(reserva =>
//         moment(reserva.fecha + ' ' + reserva.hora).isSameOrAfter(now)
//       );

//       const pasadas = todasReservas.filter(reserva =>
//         moment(reserva.fecha + ' ' + reserva.hora).isBefore(now)
//       );

//       setReservasPendientes(pendientes);
//       setReservasPasadas(pasadas);

//     } catch (error) {
//       console.error('Error al obtener reservas:', error);
//     }
//   };

//   const fetchServicios = async () => {
//     try {
//       const response = await axios.get(`${Config.url()}/servicios`);
//       setAvailableServices(response.data.data);
//     } catch (error) {
//       console.error('Error al obtener servicios:', error);
//     }
//   };

//   const handleInputChange = (name, value) => {
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   const handleDateChange = (event, selectedDate) => {
//     const currentDate = selectedDate || formData.fecha;
//     setShowDatePicker(false);
//     setFormData({ ...formData, fecha: currentDate });
//   };

//   const handleTimeChange = (event, selectedTime) => {
//     const currentTime = selectedTime || formData.hora;
//     setShowTimePicker(false);
//     setFormData({ ...formData, hora: currentTime });
//   };

//   const handleSubmit = async () => {
//     try {
//       const data = {
//         ...formData,
//         fecha: formData.fecha.toISOString().split('T')[0],
//         hora: formData.hora.toTimeString().split(' ')[0],
//       };

//       if (editMode) {
//         await axios.put(`${Config.url()}/reservas/${formData.id}`, data);
//       } else {
//         if (formData.sin_cliente) {
//           delete data.cliente_id;
//           await axios.post(`${Config.url()}/reservas_sin_cliente`, data);
//         } else {
//           await axios.post(`${Config.url()}/reservas`, data);
//         }
//       }
//       fetchReservas();
//       setShowModal(false);
//       setFormData(initializeFormData());
//     } catch (error) {
//       console.error('Error al guardar reserva:', error);
//       if (error.response && error.response.status === 422) {
//         setFormErrors(error.response.data);
//       }
//     }
//   };

//   const handleEdit = (reserva) => {
//     setFormData({
//       ...reserva,
//       fecha: new Date(reserva.fecha),
//       hora: new Date(`${reserva.fecha}T${reserva.hora}`),
//     });
//     setEditMode(true);
//     setShowModal(true);
//   };

//   const handleCancel = async (id) => {
//     try {
//       await axios.put(`${Config.url()}/reservas/${id}/cancelar`);
//       fetchReservas();
//       Alert.alert('Reserva cancelada', 'La reserva se ha cancelado exitosamente.');
//     } catch (error) {
//       if (error.response && error.response.status === 403) {
//         const errorMessage = error.response.data.message || 'No se puede cancelar la reserva.';
//         Alert.alert('No se puede cancelar', errorMessage);
//       } else {
//         console.error('Error al cancelar reserva:', error);
//         Alert.alert('Error', 'Ocurrió un error al intentar cancelar la reserva.');
//       }
//     }
//   };

//   const handleBack = () => {
//     navigation.goBack();
//   };

//   const handleAddWithoutClient = () => {
//     setFormData({ ...initializeFormData(), sin_cliente: true });
//     setShowModal(true);
//   };

//   return (
//     <View style={styles.container}>
//       <BotonVolver onBack={handleBack} />
//       <ScrollView>
//         <Button title="Agregar Reserva" onPress={() => setShowModal(true)} />
//         <Button title="Agregar Reserva sin Cliente" onPress={handleAddWithoutClient} color="#6c757d" />

//         <Text style={styles.sectionTitle}>Reservas Pendientes</Text>
//         {reservasPendientes.map((reserva) => (
//           <View key={reserva.id} style={styles.reservaContainer}>
//             <Text>ID: {reserva.id}</Text>
//             <Text>Cliente: {reserva.cliente_id || "Sin cliente"}</Text>
//             <Text>Agenda: {reserva.agenda_id}</Text>
//             <Text>Fecha: {reserva.fecha}</Text>
//             <Text>Hora: {reserva.hora}</Text>
//             <Text>Duración: {reserva.duracion} min</Text>
//             <Text>Precio: ${reserva.precio}</Text>
//             <Text>Estado: {reserva.estado}</Text>
//             <View style={styles.buttonContainer}>
//               <Button title="Editar" onPress={() => handleEdit(reserva)} />
//               {reserva.estado !== 'cancelado' && (
//                 <Button title="Cancelar Reserva" onPress={() => handleCancel(reserva.id)} color="red" />
//               )}
//             </View>
//           </View>
//         ))}

//         <Text style={styles.sectionTitle}>Reservas Pasadas</Text>
//         {reservasPasadas.map((reserva) => (
//           <View key={reserva.id} style={styles.reservaContainer}>
//             <Text>ID: {reserva.id}</Text>
//             <Text>Cliente: {reserva.cliente_id || "Sin cliente"}</Text>
//             <Text>Agenda: {reserva.agenda_id}</Text>
//             <Text>Fecha: {reserva.fecha}</Text>
//             <Text>Hora: {reserva.hora}</Text>
//             <Text>Duración: {reserva.duracion} min</Text>
//             <Text>Precio: ${reserva.precio}</Text>
//             <Text>Estado: {reserva.estado}</Text>
//             {/* No mostramos botones de edición o cancelación para reservas pasadas */}
//           </View>
//         ))}
//       </ScrollView>
//       <Modal visible={showModal} animationType="slide">
//         <View style={styles.modalContainer}>
//           <Text style={styles.modalTitle}>{editMode ? 'Editar Reserva' : 'Agregar Reserva'}</Text>
//           <ScrollView>
//             {!formData.sin_cliente && (
//               <TextInput
//                 placeholder="Cliente ID"
//                 value={formData.cliente_id}
//                 onChangeText={(value) => handleInputChange('cliente_id', value)}
//                 style={styles.input}
//               />
//             )}

//             <TouchableOpacity onPress={() => setShowDatePicker(true)}>
//               <TextInput
//                 placeholder="Fecha"
//                 value={formData.fecha.toDateString()}
//                 editable={false}
//                 style={styles.input}
//               />
//             </TouchableOpacity>

//             {showDatePicker && (
//               <DateTimePicker
//                 value={formData.fecha}
//                 mode="date"
//                 display="default"
//                 onChange={handleDateChange}
//               />
//             )}

//             <TouchableOpacity onPress={() => setShowTimePicker(true)}>
//               <TextInput
//                 placeholder="Hora"
//                 value={formData.hora.toTimeString().split(' ')[0]}
//                 editable={false}
//                 style={styles.input}
//               />
//             </TouchableOpacity>

//             {showTimePicker && (
//               <DateTimePicker
//                 value={formData.hora}
//                 mode="time"
//                 display="default"
//                 onChange={handleTimeChange}
//               />
//             )}

//             <View style={styles.input}>
//               <Text>Seleccionar Servicios:</Text>
//               {availableServices.map(service => (
//                 <TouchableOpacity
//                   key={service.id}
//                   onPress={() => {
//                     const alreadySelected = formData.servicios.includes(service.id);
//                     const updatedServices = alreadySelected
//                       ? formData.servicios.filter(id => id !== service.id)
//                       : [...formData.servicios, service.id];
//                     handleInputChange('servicios', updatedServices);
//                   }}
//                 >
//                   <Text style={{ color: formData.servicios.includes(service.id) ? 'green' : 'black' }}>
//                     {service.nombre}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>

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
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginTop: 20,
//     marginBottom: 10,
//   },
// });

// export default ReservasCRUD;


