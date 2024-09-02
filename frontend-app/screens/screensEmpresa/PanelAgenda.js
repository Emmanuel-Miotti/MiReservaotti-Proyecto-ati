import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Text, Button, ActivityIndicator, TextInput, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { UserContext } from "../../contexts/UserContext";
import { Agenda } from 'react-native-calendars';
import axios from "axios";
import Config from '../Config';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

const AgendaScreen = ({ navigation }) => {
  const user = useContext(UserContext).user;
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [servicios, setServicios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    nombre_cliente: '',
    email_cliente: '',
    telefono_cliente: '',
    fecha: '',
    hora: '',
    duracion: 60,
    precio: 0,
    estado: 'reservado',
    observaciones: '',
    servicios: [],
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [serviciosData, clientesData, reservasData, reservasNoRegistradas] = await Promise.all([
          fetchServicios(),
          fetchClientes(),
          fetchReservas(),
          fetchReservasNoRegistradas()
        ]);

        setServicios(serviciosData);
        setClientes(clientesData);

        const todasReservas = [...reservasData, ...reservasNoRegistradas];
        if (todasReservas.length > 0 && serviciosData.length > 0 && clientesData.length > 0) {
          const formattedItems = formatDataToItems(todasReservas, serviciosData, clientesData);
          setItems(formattedItems);
        } else {
          setItems({});
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "empresa") {
      cargarDatos();
    }
  }, [user]);

  const fetchServicios = async () => {
    const response = await axios.get(`${Config.url()}/servicios/empresa/${user.id}`);
    return response.data || [];
  };

  const fetchClientes = async () => {
    const response = await axios.get(`${Config.url()}/empresas/${user.id}/clientes`);
    return response.data.data || [];
  };

  const fetchReservas = async () => {
    const response = await axios.get(`${Config.url()}/reservas/empresa/${user.id}`);
    return response.data.data || [];
  };

  const fetchReservasNoRegistradas = async () => {
    const response = await axios.get(`${Config.url()}/reservas2/empresa/${user.id}`);
    return response.data.data || [];
  };

  const formatDataToItems = (reservas, servicios, clientes) => {
    const formattedItems = {};
    reservas.forEach(reserva => {
      const fecha = reserva.fecha;
      if (!formattedItems[fecha]) {
        formattedItems[fecha] = [];
      }
      const nombreServicio = obtenerNombreServicio(reserva.servicios, servicios);
      const nombreCliente = obtenerNombreCliente(reserva.cliente_id, clientes);
      const precioTotal = isNaN(reserva.precio) ? "N/A" : `$${parseFloat(reserva.precio).toFixed(2)}`;

      formattedItems[fecha].push({
        Cliente_Id: `Cliente: ${nombreCliente}`,
        hora: `Hora: ${reserva.hora}`,
        servicio: `Servicio: ${nombreServicio}`,
        Duracion: `Duracion: ${reserva.duracion} Minutos`,
        Precio: `Precio Total: ${precioTotal}`,
        Estado: `Estado: ${reserva.estado}`,
      });
    });
    return formattedItems;
  };

  const obtenerNombreServicio = (serviciosArray, servicios) => {
    try {
      const servicioIds = Array.isArray(serviciosArray) ? serviciosArray : JSON.parse(serviciosArray);
      if (!Array.isArray(servicioIds)) {
        throw new Error('serviciosArray no es un arreglo');
      }

      const nombresServicios = servicioIds.map((id) => {
        const servicio = servicios.find(s => s.id == id); 
        return servicio ? servicio.nombre : "Servicio no especificado";
      });
      return nombresServicios.join(", ");
    } catch (e) {
      console.error('Error al obtener nombre del servicio:', e);
      return "Servicio no especificado";
    }
  };

  const obtenerNombreCliente = (clienteId, clientes) => {
    const cliente = clientes.find(c => c.id == clienteId);
    return cliente ? cliente.name : "Cliente no especificado";
  };

  const handleServiceSelection = (serviceId) => {
    const alreadySelected = formData.servicios.includes(serviceId);
    let updatedServices = [];

    if (alreadySelected) {
      updatedServices = formData.servicios.filter(id => id !== serviceId);
    } else {
      updatedServices = [...formData.servicios, serviceId];
    }

    let totalPrecio = 0;
    let totalDuracion = 0;

    updatedServices.forEach(id => {
      const service = servicios.find(service => service.id === id);
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
        fecha: moment(formData.fecha, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        hora: moment(formData.hora, 'HH:mm').format('HH:mm'),
        servicios: formData.servicios,
      };

      const response = await axios.post(`${Config.url()}/reservas/usuarioNoRegistradoPocosDatos`, data);

      if (response.data.success) {
        Alert.alert('Reserva creada', 'La reserva ha sido creada exitosamente.');
        setShowModal(false);
      } else {
        Alert.alert('Error', 'Ocurrió un error al crear la reserva.');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setFormErrors(error.response.data);
      } else {
        console.error('Error al guardar reserva:', error);
        Alert.alert('Error', 'Ocurrió un error al intentar guardar la reserva.');
      }
    }
  };

  const renderError = (field) => {
    if (formErrors[field]) {
      return <Text style={styles.errorText}>{formErrors[field][0]}</Text>;
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda</Text>
      <Button title="Listado Reserva" onPress={() => navigation.navigate('ReservasCRUD')} />
      <Button title="Agregar Reserva" onPress={() => setShowModal(true)} />
      <Agenda
        items={items}
        renderItem={(item) => (
          <View style={styles.item}>
            <View style={styles.itemTextContainer}>
              <Icon name="person-circle-outline" size={20} color="#333" />
              <Text style={styles.itemText}>{item.Cliente_Id}</Text>
            </View>
            <View style={styles.itemTextContainer}>
              <Icon name="time-outline" size={20} color="#333" />
              <Text style={styles.itemText}>{item.hora}</Text>
            </View>
            <View style={styles.itemTextContainer}>
              <Icon name="briefcase-outline" size={20} color="#333" />
              <Text style={styles.itemText}>{item.servicio}</Text>
            </View>
            <View style={styles.itemTextContainer}>
              <Icon name="hourglass-outline" size={20} color="#333" />
              <Text style={styles.itemText}>{item.Duracion}</Text>
            </View>
            <View style={styles.itemTextContainer}>
              <Icon name="cash-outline" size={20} color="#333" />
              <Text style={styles.itemText}>{item.Precio}</Text>
            </View>
            <View style={styles.itemTextContainer}>
              <Icon name="alert-circle-outline" size={20} color="#333" />
              <Text style={styles.itemText}>{item.Estado}</Text>
            </View>
          </View>
        )}
        renderEmptyDate={() => (
          <View style={styles.emptyDate}>
            <Text>No hay reservas para este día.</Text>
          </View>
        )}
        rowHasChanged={(r1, r2) => r1.Cliente_Id !== r2.Cliente_Id}
        renderEmptyData={() => (
          <View style={styles.emptyDate}>
            <Text>No hay reservas para este día.</Text>
          </View>
        )}
      />
      
      {/* Modal para crear reserva */}
      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Crear Reserva</Text>
          <ScrollView>
            <TextInput
              placeholder="Nombre del Cliente"
              value={formData.nombre_cliente}
              onChangeText={(value) => setFormData({ ...formData, nombre_cliente: value })}
              style={styles.input}
            />
            {renderError('nombre_cliente')}
            <TextInput
              placeholder="Email del Cliente"
              value={formData.email_cliente}
              onChangeText={(value) => setFormData({ ...formData, email_cliente: value })}
              style={styles.input}
            />
            {renderError('email_cliente')}
            <TextInput
              placeholder="Teléfono del Cliente"
              value={formData.telefono_cliente}
              onChangeText={(value) => setFormData({ ...formData, telefono_cliente: value })}
              style={styles.input}
            />
            {renderError('telefono_cliente')}
            <TextInput
              placeholder="Fecha (DD/MM/YYYY)"
              value={formData.fecha}
              onChangeText={(value) => setFormData({ ...formData, fecha: value })}
              style={styles.input}
            />
            {renderError('fecha')}
            <TextInput
              placeholder="Hora (HH:mm)"
              value={formData.hora}
              onChangeText={(value) => setFormData({ ...formData, hora: value })}
              style={styles.input}
            />
            {renderError('hora')}
            <View style={styles.input}>
              <Text>Seleccionar Servicios:</Text>
              {servicios.map(service => (
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
            {renderError('servicios')}
            <TextInput
              placeholder="Observaciones"
              value={formData.observaciones}
              onChangeText={(value) => setFormData({ ...formData, observaciones: value })}
              style={styles.input}
              multiline
            />
            {renderError('observaciones')}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <Button title="Guardar Reserva" onPress={handleSubmit} />
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
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    backgroundColor: '#fff',
    flex: 1,
    borderRadius: 8,
    padding: 15,
    marginRight: 10,
    marginTop: 17,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  itemTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  emptyDate: {
    height: 15,
    flex: 1, 
    paddingTop: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#007bff',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    marginTop: -10,
  },
});

export default AgendaScreen;




// import React, { useEffect, useState, useContext } from 'react';
// import { View, StyleSheet, Text, Button, ActivityIndicator, TextInput, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
// import { UserContext } from "../../contexts/UserContext";
// import { Agenda } from 'react-native-calendars';
// import axios from "axios";
// import Config from '../Config';
// import Icon from 'react-native-vector-icons/Ionicons';
// import moment from 'moment';

// const AgendaScreen = ({ navigation }) => {
//   const user = useContext(UserContext).user;
//   const [items, setItems] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [servicios, setServicios] = useState([]);
//   const [clientes, setClientes] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState({
//     nombre_cliente: '',
//     email_cliente: '',
//     telefono_cliente: '',
//     fecha: '',
//     hora: '',
//     duracion: 60,
//     precio: 0,
//     estado: 'reservado',
//     observaciones: '',
//     servicios: [],
//   });

//   useEffect(() => {
//     const cargarDatos = async () => {
//       try {
//         const [serviciosData, clientesData, reservasData, reservasNoRegistradas] = await Promise.all([
//           fetchServicios(),
//           fetchClientes(),
//           fetchReservas(),
//           fetchReservasNoRegistradas()
//         ]);

//         setServicios(serviciosData);
//         setClientes(clientesData);

//         const todasReservas = [...reservasData, ...reservasNoRegistradas];
//         if (todasReservas.length > 0 && serviciosData.length > 0 && clientesData.length > 0) {
//           const formattedItems = formatDataToItems(todasReservas, serviciosData, clientesData);
//           setItems(formattedItems);
//         } else {
//           setItems({});
//         }
//       } catch (error) {
//         console.error('Error al cargar datos:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user && user.role === "empresa") {
//       cargarDatos();
//     }
//   }, [user]);

//   const fetchServicios = async () => {
//     const response = await axios.get(`${Config.url()}/servicios/empresa/${user.id}`);
//     return response.data || [];
//   };

//   const fetchClientes = async () => {
//     const response = await axios.get(`${Config.url()}/empresas/${user.id}/clientes`);
//     return response.data.data || [];
//   };

//   const fetchReservas = async () => {
//     const response = await axios.get(`${Config.url()}/reservas/empresa/${user.id}`);
//     return response.data.data || [];
//   };

//   const fetchReservasNoRegistradas = async () => {
//     const response = await axios.get(`${Config.url()}/reservas2/empresa/${user.id}`);
//     return response.data.data || [];
//   };

//   const formatDataToItems = (reservas, servicios, clientes) => {
//     const formattedItems = {};
//     reservas.forEach(reserva => {
//       const fecha = reserva.fecha;
//       if (!formattedItems[fecha]) {
//         formattedItems[fecha] = [];
//       }
//       const nombreServicio = obtenerNombreServicio(reserva.servicios, servicios);
//       const nombreCliente = obtenerNombreCliente(reserva.cliente_id, clientes);
//       const precioTotal = isNaN(reserva.precio) ? "N/A" : `$${parseFloat(reserva.precio).toFixed(2)}`;

//       formattedItems[fecha].push({
//         Cliente_Id: `Cliente: ${nombreCliente}`,
//         hora: `Hora: ${reserva.hora}`,
//         servicio: `Servicio: ${nombreServicio}`,
//         Duracion: `Duracion: ${reserva.duracion} Minutos`,
//         Precio: `Precio Total: ${precioTotal}`,
//         Estado: `Estado: ${reserva.estado}`,
//       });
//     });
//     return formattedItems;
//   };

//   const obtenerNombreServicio = (serviciosArray, servicios) => {
//     try {
//       const servicioIds = Array.isArray(serviciosArray) ? serviciosArray : JSON.parse(serviciosArray);
//       if (!Array.isArray(servicioIds)) {
//         throw new Error('serviciosArray no es un arreglo');
//       }

//       const nombresServicios = servicioIds.map((id) => {
//         const servicio = servicios.find(s => s.id == id); 
//         return servicio ? servicio.nombre : "Servicio no especificado";
//       });
//       return nombresServicios.join(", ");
//     } catch (e) {
//       console.error('Error al obtener nombre del servicio:', e);
//       return "Servicio no especificado";
//     }
//   };

//   const obtenerNombreCliente = (clienteId, clientes) => {
//     const cliente = clientes.find(c => c.id == clienteId);
//     return cliente ? cliente.name : "Cliente no especificado";
//   };

//   const handleServiceSelection = (serviceId) => {
//     const alreadySelected = formData.servicios.includes(serviceId);
//     let updatedServices = [];

//     if (alreadySelected) {
//       updatedServices = formData.servicios.filter(id => id !== serviceId);
//     } else {
//       updatedServices = [...formData.servicios, serviceId];
//     }

//     let totalPrecio = 0;
//     let totalDuracion = 0;

//     updatedServices.forEach(id => {
//       const service = servicios.find(service => service.id === id);
//       if (service) {
//         const precio = parseFloat(service.precio);
//         if (!isNaN(precio)) {
//           totalPrecio += precio;
//         }
//         totalDuracion += service.duracion;
//       }
//     });

//     setFormData({
//       ...formData,
//       servicios: updatedServices,
//       precio: totalPrecio.toFixed(2),
//       duracion: totalDuracion,
//     });
//   };

//   const handleSubmit = async () => {
//     try {
//       const data = {
//         ...formData,
//         agenda_id: user.id,
//         fecha: moment(formData.fecha, 'DD/MM/YYYY').format('YYYY-MM-DD'),
//         hora: moment(formData.hora, 'HH:mm').format('HH:mm'),
//         servicios: formData.servicios,
//         precio: 100
//       };

//       console.log(data)
//       const response = await axios.post(`${Config.url()}/reservas/usuarioNoRegistradoPocosDatos`, data);

//       console.log(response)
//       if (response.data.success) {
//         Alert.alert('Reserva creada', 'La reserva ha sido creada exitosamente.');
//         setShowModal(false);
//       } else {
//         Alert.alert('Error', 'Ocurrió un error al crear la reserva.');
//       }
//     } catch (error) {
//       console.error('Error al guardar reserva:', error);
//       Alert.alert('Error', 'Ocurrió un error al intentar guardar la reserva.');
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Agenda</Text>
//       <Button title="Listado Reserva" onPress={() => navigation.navigate('ReservasCRUD')} />
//       <Button title="Realizar Reserva" onPress={() => setShowModal(true)} />
//       <Agenda
//         items={items}
//         renderItem={(item) => (
//           <View style={styles.item}>
//             <View style={styles.itemTextContainer}>
//               <Icon name="person-circle-outline" size={20} color="#333" />
//               <Text style={styles.itemText}>{item.Cliente_Id}</Text>
//             </View>
//             <View style={styles.itemTextContainer}>
//               <Icon name="time-outline" size={20} color="#333" />
//               <Text style={styles.itemText}>{item.hora}</Text>
//             </View>
//             <View style={styles.itemTextContainer}>
//               <Icon name="briefcase-outline" size={20} color="#333" />
//               <Text style={styles.itemText}>{item.servicio}</Text>
//             </View>
//             <View style={styles.itemTextContainer}>
//               <Icon name="hourglass-outline" size={20} color="#333" />
//               <Text style={styles.itemText}>{item.Duracion}</Text>
//             </View>
//             <View style={styles.itemTextContainer}>
//               <Icon name="cash-outline" size={20} color="#333" />
//               <Text style={styles.itemText}>{item.Precio}</Text>
//             </View>
//             <View style={styles.itemTextContainer}>
//               <Icon name="alert-circle-outline" size={20} color="#333" />
//               <Text style={styles.itemText}>{item.Estado}</Text>
//             </View>
//           </View>
//         )}
//         renderEmptyDate={() => (
//           <View style={styles.emptyDate}>
//             <Text>No hay reservas para este día.</Text>
//           </View>
//         )}
//         rowHasChanged={(r1, r2) => r1.Cliente_Id !== r2.Cliente_Id}
//         renderEmptyData={() => (
//           <View style={styles.emptyDate}>
//             <Text>No hay reservas para este día.</Text>
//           </View>
//         )}
//       />
      
//       {/* Modal para crear reserva */}
//       <Modal visible={showModal} animationType="slide">
//         <View style={styles.modalContainer}>
//           <Text style={styles.modalTitle}>Crear Reserva</Text>
//           <ScrollView>
//             <TextInput
//               placeholder="Nombre del Cliente"
//               value={formData.nombre_cliente}
//               onChangeText={(value) => setFormData({ ...formData, nombre_cliente: value })}
//               style={styles.input}
//             />
//             <TextInput
//               placeholder="Email del Cliente"
//               value={formData.email_cliente}
//               onChangeText={(value) => setFormData({ ...formData, email_cliente: value })}
//               style={styles.input}
//             />
//             <TextInput
//               placeholder="Teléfono del Cliente"
//               value={formData.telefono_cliente}
//               onChangeText={(value) => setFormData({ ...formData, telefono_cliente: value })}
//               style={styles.input}
//             />
//             <TextInput
//               placeholder="Fecha (DD/MM/YYYY)"
//               value={formData.fecha}
//               onChangeText={(value) => setFormData({ ...formData, fecha: value })}
//               style={styles.input}
//             />
//             <TextInput
//               placeholder="Hora (HH:mm)"
//               value={formData.hora}
//               onChangeText={(value) => setFormData({ ...formData, hora: value })}
//               style={styles.input}
//             />
//             <View style={styles.input}>
//               <Text>Seleccionar Servicios:</Text>
//               {servicios.map(service => (
//                 <TouchableOpacity
//                   key={service.id}
//                   onPress={() => handleServiceSelection(service.id)}
//                 >
//                   <Text style={{ color: formData.servicios.includes(service.id) ? 'green' : 'black' }}>
//                     {service.nombre} - ${parseFloat(service.precio).toFixed(2)} - {service.duracion} min
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//             <TextInput
//               placeholder="Observaciones"
//               value={formData.observaciones}
//               onChangeText={(value) => setFormData({ ...formData, observaciones: value })}
//               style={styles.input}
//               multiline
//             />
//           </ScrollView>
//           <View style={styles.buttonContainer}>
//             <Button title="Guardar Reserva" onPress={handleSubmit} />
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
//     backgroundColor: '#f8f9fa',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   item: {
//     backgroundColor: '#fff',
//     flex: 1,
//     borderRadius: 8,
//     padding: 15,
//     marginRight: 10,
//     marginTop: 17,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   itemTextContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   itemText: {
//     fontSize: 16,
//     color: '#333',
//     marginLeft: 10,
//   },
//   emptyDate: {
//     height: 15,
//     flex: 1, 
//     paddingTop: 30,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#007bff',
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
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 8,
//   },
// });

// export default AgendaScreen;



// // import React, { useEffect, useState, useContext } from 'react';
// // import { View, StyleSheet, Text, Button, ActivityIndicator, TextInput, Modal, ScrollView, TouchableOpacity, Alert } from 'react-native';
// // import { UserContext } from "../../contexts/UserContext";
// // import { Agenda } from 'react-native-calendars';
// // import axios from "axios";
// // import Config from '../Config';
// // import Icon from 'react-native-vector-icons/Ionicons';
// // import DateTimePicker from '@react-native-community/datetimepicker';
// // import moment from 'moment';

// // const AgendaScreen = ({ navigation }) => {
// //   const user = useContext(UserContext).user;
// //   const [items, setItems] = useState({});
// //   const [loading, setLoading] = useState(true);
// //   const [servicios, setServicios] = useState([]);
// //   const [clientes, setClientes] = useState([]);
// //   const [showModal, setShowModal] = useState(false);
// //   const [formData, setFormData] = useState({
// //     nombre_cliente: '',
// //     email_cliente: '',
// //     telefono_cliente: '',
// //     fecha: new Date(),
// //     hora: new Date(),
// //     duracion: 60,
// //     precio: 0,
// //     estado: 'reservado',
// //     observaciones: '',
// //     servicios: [],
// //   });
// //   const [showDatePicker, setShowDatePicker] = useState(false);
// //   const [showTimePicker, setShowTimePicker] = useState(false);

// //   useEffect(() => {
// //     const cargarDatos = async () => {
// //       try {
// //         const [serviciosData, clientesData, reservasData, reservasNoRegistradas] = await Promise.all([
// //           fetchServicios(),
// //           fetchClientes(),
// //           fetchReservas(),
// //           fetchReservasNoRegistradas()
// //         ]);

// //         setServicios(serviciosData);
// //         setClientes(clientesData);

// //         const todasReservas = [...reservasData, ...reservasNoRegistradas];
// //         if (todasReservas.length > 0 && serviciosData.length > 0 && clientesData.length > 0) {
// //           const formattedItems = formatDataToItems(todasReservas, serviciosData, clientesData);
// //           setItems(formattedItems);
// //         } else {
// //           setItems({});
// //         }
// //       } catch (error) {
// //         console.error('Error al cargar datos:', error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     if (user && user.role === "empresa") {
// //       cargarDatos();
// //     }
// //   }, [user]);

// //   const fetchServicios = async () => {
// //     const response = await axios.get(`${Config.url()}/servicios/empresa/${user.id}`);
// //     return response.data || [];
// //   };

// //   const fetchClientes = async () => {
// //     const response = await axios.get(`${Config.url()}/empresas/${user.id}/clientes`);
// //     return response.data.data || [];
// //   };

// //   const fetchReservas = async () => {
// //     const response = await axios.get(`${Config.url()}/reservas/empresa/${user.id}`);
// //     return response.data.data || [];
// //   };

// //   const fetchReservasNoRegistradas = async () => {
// //     const response = await axios.get(`${Config.url()}/reservas2/empresa/${user.id}`);
// //     return response.data.data || [];
// //   };

// //   const formatDataToItems = (reservas, servicios, clientes) => {
// //     const formattedItems = {};
// //     reservas.forEach(reserva => {
// //       const fecha = reserva.fecha;
// //       if (!formattedItems[fecha]) {
// //         formattedItems[fecha] = [];
// //       }
// //       const nombreServicio = obtenerNombreServicio(reserva.servicios, servicios);
// //       const nombreCliente = obtenerNombreCliente(reserva.cliente_id, clientes);
// //       const precioTotal = isNaN(reserva.precio) ? "N/A" : `$${parseFloat(reserva.precio).toFixed(2)}`;

// //       formattedItems[fecha].push({
// //         Cliente_Id: `Cliente: ${nombreCliente}`,
// //         hora: `Hora: ${reserva.hora}`,
// //         servicio: `Servicio: ${nombreServicio}`,
// //         Duracion: `Duracion: ${reserva.duracion} Minutos`,
// //         Precio: `Precio Total: ${precioTotal}`,
// //         Estado: `Estado: ${reserva.estado}`,
// //       });
// //     });
// //     return formattedItems;
// //   };

// //   const obtenerNombreServicio = (serviciosArray, servicios) => {
// //     try {
// //       const servicioIds = Array.isArray(serviciosArray) ? serviciosArray : JSON.parse(serviciosArray);
// //       if (!Array.isArray(servicioIds)) {
// //         throw new Error('serviciosArray no es un arreglo');
// //       }

// //       const nombresServicios = servicioIds.map((id) => {
// //         const servicio = servicios.find(s => s.id == id); 
// //         return servicio ? servicio.nombre : "Servicio no especificado";
// //       });
// //       return nombresServicios.join(", ");
// //     } catch (e) {
// //       console.error('Error al obtener nombre del servicio:', e);
// //       return "Servicio no especificado";
// //     }
// //   };

// //   const obtenerNombreCliente = (clienteId, clientes) => {
// //     const cliente = clientes.find(c => c.id == clienteId);
// //     return cliente ? cliente.name : "Cliente no especificado";
// //   };

// //   const handleDateChange = (event, selectedDate) => {
// //     const currentDate = selectedDate || formData.fecha;
// //     setShowDatePicker(false);
// //     setFormData({ ...formData, fecha: currentDate });
// //   };

// //   const handleTimeChange = (event, selectedTime) => {
// //     const currentTime = selectedTime || formData.hora;
// //     setShowTimePicker(false);
// //     setFormData({ ...formData, hora: currentTime });
// //   };

// //   const handleServiceSelection = (serviceId) => {
// //     const alreadySelected = formData.servicios.includes(serviceId);
// //     let updatedServices = [];

// //     if (alreadySelected) {
// //       updatedServices = formData.servicios.filter(id => id !== serviceId);
// //     } else {
// //       updatedServices = [...formData.servicios, serviceId];
// //     }

// //     let totalPrecio = 0;
// //     let totalDuracion = 0;

// //     updatedServices.forEach(id => {
// //       const service = servicios.find(service => service.id === id);
// //       if (service) {
// //         const precio = parseFloat(service.precio);
// //         if (!isNaN(precio)) {
// //           totalPrecio += precio;
// //         }
// //         totalDuracion += service.duracion;
// //       }
// //     });

// //     setFormData({
// //       ...formData,
// //       servicios: updatedServices,
// //       precio: totalPrecio.toFixed(2),
// //       duracion: totalDuracion,
// //     });
// //   };

// //   const handleSubmit = async () => {
// //     try {
// //       const data = {
// //         ...formData,
// //         agenda_id: user.id,
// //         fecha: moment(formData.fecha).format('YYYY-MM-DD'),
// //         hora: moment(formData.hora).format('HH:mm:ss'),
// //         servicios: formData.servicios,
// //       };

// //       const response = await axios.post(`${Config.url()}/reservas/usuarioNoRegistrado`, data);
// //       if (response.data.success) {
// //         Alert.alert('Reserva creada', 'La reserva ha sido creada exitosamente.');
// //         setShowModal(false);
// //       } else {
// //         Alert.alert('Error', 'Ocurrió un error al crear la reserva.');
// //       }
// //     } catch (error) {
// //       console.error('Error al guardar reserva:', error);
// //       Alert.alert('Error', 'Ocurrió un error al intentar guardar la reserva.');
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#0000ff" />
// //       </View>
// //     );
// //   }

// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.title}>Agenda</Text>
// //       <Button title="Listado Reserva" onPress={() => navigation.navigate('ReservasCRUD')} />
// //       <Button title="Realizar Reserva" onPress={() => setShowModal(true)} />
// //       <Agenda
// //         items={items}
// //         renderItem={(item) => (
// //           <View style={styles.item}>
// //             <View style={styles.itemTextContainer}>
// //               <Icon name="person-circle-outline" size={20} color="#333" />
// //               <Text style={styles.itemText}>{item.Cliente_Id}</Text>
// //             </View>
// //             <View style={styles.itemTextContainer}>
// //               <Icon name="time-outline" size={20} color="#333" />
// //               <Text style={styles.itemText}>{item.hora}</Text>
// //             </View>
// //             <View style={styles.itemTextContainer}>
// //               <Icon name="briefcase-outline" size={20} color="#333" />
// //               <Text style={styles.itemText}>{item.servicio}</Text>
// //             </View>
// //             <View style={styles.itemTextContainer}>
// //               <Icon name="hourglass-outline" size={20} color="#333" />
// //               <Text style={styles.itemText}>{item.Duracion}</Text>
// //             </View>
// //             <View style={styles.itemTextContainer}>
// //               <Icon name="cash-outline" size={20} color="#333" />
// //               <Text style={styles.itemText}>{item.Precio}</Text>
// //             </View>
// //             <View style={styles.itemTextContainer}>
// //               <Icon name="alert-circle-outline" size={20} color="#333" />
// //               <Text style={styles.itemText}>{item.Estado}</Text>
// //             </View>
// //           </View>
// //         )}
// //         renderEmptyDate={() => (
// //           <View style={styles.emptyDate}>
// //             <Text>No hay reservas para este día.</Text>
// //           </View>
// //         )}
// //         rowHasChanged={(r1, r2) => r1.Cliente_Id !== r2.Cliente_Id}
// //         renderEmptyData={() => (
// //           <View style={styles.emptyDate}>
// //             <Text>No hay reservas para este día.</Text>
// //           </View>
// //         )}
// //       />
      
// //       {/* Modal para crear reserva */}
// //       <Modal visible={showModal} animationType="slide">
// //         <View style={styles.modalContainer}>
// //           <Text style={styles.modalTitle}>Crear Reserva</Text>
// //           <ScrollView>
// //             <TextInput
// //               placeholder="Nombre del Cliente"
// //               value={formData.nombre_cliente}
// //               onChangeText={(value) => setFormData({ ...formData, nombre_cliente: value })}
// //               style={styles.input}
// //             />
// //             <TextInput
// //               placeholder="Email del Cliente"
// //               value={formData.email_cliente}
// //               onChangeText={(value) => setFormData({ ...formData, email_cliente: value })}
// //               style={styles.input}
// //             />
// //             <TextInput
// //               placeholder="Teléfono del Cliente"
// //               value={formData.telefono_cliente}
// //               onChangeText={(value) => setFormData({ ...formData, telefono_cliente: value })}
// //               style={styles.input}
// //             />
// //             <TouchableOpacity onPress={() => setShowDatePicker(true)}>
// //               <TextInput
// //                 placeholder="Fecha"
// //                 value={moment(formData.fecha).format('DD/MM/YYYY')}
// //                 editable={false}
// //                 style={styles.input}
// //               />
// //             </TouchableOpacity>

// //             {showDatePicker && (
// //               <DateTimePicker
// //                 value={formData.fecha}
// //                 mode="date"
// //                 display="default"
// //                 onChange={handleDateChange}
// //               />
// //             )}

// //             <TouchableOpacity onPress={() => setShowTimePicker(true)}>
// //               <TextInput
// //                 placeholder="Hora"
// //                 value={moment(formData.hora).format('HH:mm')}
// //                 editable={false}
// //                 style={styles.input}
// //               />
// //             </TouchableOpacity>

// //             {showTimePicker && (
// //               <DateTimePicker
// //                 value={formData.hora}
// //                 mode="time"
// //                 display="default"
// //                 onChange={handleTimeChange}
// //               />
// //             )}

// //             <View style={styles.input}>
// //               <Text>Seleccionar Servicios:</Text>
// //               {servicios.map(service => (
// //                 <TouchableOpacity
// //                   key={service.id}
// //                   onPress={() => handleServiceSelection(service.id)}
// //                 >
// //                   <Text style={{ color: formData.servicios.includes(service.id) ? 'green' : 'black' }}>
// //                     {service.nombre} - ${parseFloat(service.precio).toFixed(2)} - {service.duracion} min
// //                   </Text>
// //                 </TouchableOpacity>
// //               ))}
// //             </View>

// //             <TextInput
// //               placeholder="Observaciones"
// //               value={formData.observaciones}
// //               onChangeText={(value) => setFormData({ ...formData, observaciones: value })}
// //               style={styles.input}
// //               multiline
// //             />
// //           </ScrollView>
// //           <View style={styles.buttonContainer}>
// //             <Button title="Guardar Reserva" onPress={handleSubmit} />
// //             <Button title="Cancelar" onPress={() => setShowModal(false)} color="red" />
// //           </View>
// //         </View>
// //       </Modal>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#f8f9fa',
// //   },
// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   item: {
// //     backgroundColor: '#fff',
// //     flex: 1,
// //     borderRadius: 8,
// //     padding: 15,
// //     marginRight: 10,
// //     marginTop: 17,
// //     shadowColor: '#000',
// //     shadowOffset: { width: 0, height: 2 },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 5,
// //   },
// //   itemTextContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginBottom: 5,
// //   },
// //   itemText: {
// //     fontSize: 16,
// //     color: '#333',
// //     marginLeft: 10,
// //   },
// //   emptyDate: {
// //     height: 15,
// //     flex: 1, 
// //     paddingTop: 30,
// //     alignItems: 'center',
// //   },
// //   title: {
// //     fontSize: 28,
// //     fontWeight: 'bold',
// //     marginBottom: 20,
// //     textAlign: 'center',
// //     color: '#007bff',
// //   },
// //   modalContainer: {
// //     flex: 1,
// //     padding: 16,
// //   },
// //   modalTitle: {
// //     fontSize: 18,
// //     marginBottom: 16,
// //     textAlign: 'center',
// //   },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: '#ccc',
// //     padding: 8,
// //     marginVertical: 8,
// //     borderRadius: 4,
// //   },
// //   buttonContainer: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginTop: 8,
// //   },
// // });

// // export default AgendaScreen;


// // // import React, { useEffect, useState, useContext } from 'react';
// // // import { UserContext } from "../../contexts/UserContext";
// // // import { View, StyleSheet, Text, Button, ActivityIndicator } from 'react-native';
// // // import { Agenda } from 'react-native-calendars';
// // // import axios from "axios";
// // // import Config from '../Config';
// // // import Icon from 'react-native-vector-icons/Ionicons';

// // // const AgendaScreen = ({ navigation }) => {
// // //   const user = useContext(UserContext).user;
// // //   const [items, setItems] = useState({});
// // //   const [loading, setLoading] = useState(true);
// // //   const [servicios, setServicios] = useState([]);
// // //   const [clientes, setClientes] = useState([]);

// // //   useEffect(() => {
// // //     const cargarDatos = async () => {
// // //       try {
// // //         const [serviciosData, clientesData, reservasData, reservasNoRegistradas] = await Promise.all([
// // //           fetchServicios(),
// // //           fetchClientes(),
// // //           fetchReservas(),
// // //           fetchReservasNoRegistradas()
// // //         ]);

// // //         setServicios(serviciosData);
// // //         setClientes(clientesData);

// // //         const todasReservas = [...reservasData, ...reservasNoRegistradas];
// // //         if (todasReservas.length > 0 && serviciosData.length > 0 && clientesData.length > 0) {
// // //           const formattedItems = formatDataToItems(todasReservas, serviciosData, clientesData);
// // //           setItems(formattedItems);
// // //         } else {
// // //           setItems({});
// // //         }
// // //       } catch (error) {
// // //         console.error('Error al cargar datos:', error);
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     };

// // //     if (user && user.role === "empresa") {
// // //       cargarDatos();
// // //     }
// // //   }, [user]);

// // //   const fetchServicios = async () => {
// // //     console.log('Cargando servicios...');
// // //     const response = await axios.get(`${Config.url()}/servicios/empresa/${user.id}`);
// // //     return response.data || [];
// // //   };

// // //   const fetchClientes = async () => {
// // //     console.log('Cargando clientes...');
// // //     const response = await axios.get(`${Config.url()}/empresas/${user.id}/clientes`);
// // //     return response.data.data || [];
// // //   };

// // //   const fetchReservas = async () => {
// // //     console.log('Cargando reservas...');
// // //     const response = await axios.get(`${Config.url()}/reservas/empresa/${user.id}`);
// // //     return response.data.data || [];
// // //   };

// // //   const fetchReservasNoRegistradas = async () => {
// // //     console.log('Cargando reservas de usuarios no registrados...');
// // //     const response = await axios.get(`${Config.url()}/reservas2/empresa/${user.id}`);
// // //     return response.data.data || [];
// // //   };

// // //   const formatDataToItems = (reservas, servicios, clientes) => {
// // //     const formattedItems = {};
// // //     reservas.forEach(reserva => {
// // //       const fecha = reserva.fecha;
// // //       if (!formattedItems[fecha]) {
// // //         formattedItems[fecha] = [];
// // //       }
// // //       const nombreServicio = obtenerNombreServicio(reserva.servicios, servicios);
// // //       const nombreCliente = obtenerNombreCliente(reserva.cliente_id, clientes);
// // //       const precioTotal = isNaN(reserva.precio) ? "N/A" : `$${parseFloat(reserva.precio).toFixed(2)}`;

// // //       formattedItems[fecha].push({
// // //         Cliente_Id: `Cliente: ${nombreCliente}`,
// // //         hora: `Hora: ${reserva.hora}`,
// // //         servicio: `Servicio: ${nombreServicio}`,
// // //         Duracion: `Duracion: ${reserva.duracion} Minutos`,
// // //         Precio: `Precio Total: ${precioTotal}`,
// // //         Estado: `Estado: ${reserva.estado}`,
// // //       });
// // //     });
// // //     return formattedItems;
// // //   };

// // //   const obtenerNombreServicio = (serviciosArray, servicios) => {
// // //     try {
// // //       const servicioIds = Array.isArray(serviciosArray) ? serviciosArray : JSON.parse(serviciosArray);
// // //       if (!Array.isArray(servicioIds)) {
// // //         throw new Error('serviciosArray no es un arreglo');
// // //       }

// // //       const nombresServicios = servicioIds.map((id) => {
// // //         const servicio = servicios.find(s => s.id == id); 
// // //         return servicio ? servicio.nombre : "Servicio no especificado";
// // //       });
// // //       return nombresServicios.join(", ");
// // //     } catch (e) {
// // //       console.error('Error al obtener nombre del servicio:', e);
// // //       return "Servicio no especificado";
// // //     }
// // //   };

// // //   const obtenerNombreCliente = (clienteId, clientes) => {
// // //     const cliente = clientes.find(c => c.id == clienteId);
// // //     return cliente ? cliente.name : "Cliente no especificado";
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <View style={styles.loadingContainer}>
// // //         <ActivityIndicator size="large" color="#0000ff" />
// // //       </View>
// // //     );
// // //   }

// // //   return (
// // //     <View style={styles.container}>
// // //       <Text style={styles.title}>Agenda</Text>
// // //       <Button title="Listado Reserva" onPress={() => navigation.navigate('ReservasCRUD')} />
// // //       <Agenda
// // //         items={items}
// // //         renderItem={(item) => (
// // //           <View style={styles.item}>
// // //             <View style={styles.itemTextContainer}>
// // //               <Icon name="person-circle-outline" size={20} color="#333" />
// // //               <Text style={styles.itemText}>{item.Cliente_Id}</Text>
// // //             </View>
// // //             <View style={styles.itemTextContainer}>
// // //               <Icon name="time-outline" size={20} color="#333" />
// // //               <Text style={styles.itemText}>{item.hora}</Text>
// // //             </View>
// // //             <View style={styles.itemTextContainer}>
// // //               <Icon name="briefcase-outline" size={20} color="#333" />
// // //               <Text style={styles.itemText}>{item.servicio}</Text>
// // //             </View>
// // //             <View style={styles.itemTextContainer}>
// // //               <Icon name="hourglass-outline" size={20} color="#333" />
// // //               <Text style={styles.itemText}>{item.Duracion}</Text>
// // //             </View>
// // //             <View style={styles.itemTextContainer}>
// // //               <Icon name="cash-outline" size={20} color="#333" />
// // //               <Text style={styles.itemText}>{item.Precio}</Text>
// // //             </View>
// // //             <View style={styles.itemTextContainer}>
// // //               <Icon name="alert-circle-outline" size={20} color="#333" />
// // //               <Text style={styles.itemText}>{item.Estado}</Text>
// // //             </View>
// // //           </View>
// // //         )}
// // //         renderEmptyDate={() => (
// // //           <View style={styles.emptyDate}>
// // //             <Text>No hay reservas para este día.</Text>
// // //           </View>
// // //         )}
// // //         rowHasChanged={(r1, r2) => r1.Cliente_Id !== r2.Cliente_Id}
// // //         renderEmptyData={() => (
// // //           <View style={styles.emptyDate}>
// // //             <Text>No hay reservas para este día.</Text>
// // //           </View>
// // //         )}
// // //       />
// // //     </View>
// // //   );
// // // };

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     backgroundColor: '#f8f9fa',
// // //   },
// // //   loadingContainer: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //   },
// // //   item: {
// // //     backgroundColor: '#fff',
// // //     flex: 1,
// // //     borderRadius: 8,
// // //     padding: 15,
// // //     marginRight: 10,
// // //     marginTop: 17,
// // //     shadowColor: '#000',
// // //     shadowOffset: { width: 0, height: 2 },
// // //     shadowOpacity: 0.1,
// // //     shadowRadius: 4,
// // //     elevation: 5,
// // //   },
// // //   itemTextContainer: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     marginBottom: 5,
// // //   },
// // //   itemText: {
// // //     fontSize: 16,
// // //     color: '#333',
// // //     marginLeft: 10,
// // //   },
// // //   emptyDate: {
// // //     height: 15,
// // //     flex: 1, 
// // //     paddingTop: 30,
// // //     alignItems: 'center',
// // //   },
// // //   title: {
// // //     fontSize: 28,
// // //     fontWeight: 'bold',
// // //     marginBottom: 20,
// // //     textAlign: 'center',
// // //     color: '#007bff',
// // //   },
// // // });

// // // export default AgendaScreen;



// // // // import React, { useEffect, useState, useContext } from 'react';
// // // // import { UserContext } from "../../contexts/UserContext";
// // // // import { View, StyleSheet, Text, Button, ActivityIndicator } from 'react-native';
// // // // import { Agenda } from 'react-native-calendars';
// // // // import axios from "axios";
// // // // import Config from '../Config';

// // // // const AgendaScreen = ({ navigation }) => {
// // // //   const user = useContext(UserContext).user;
// // // //   const [items, setItems] = useState({});
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [servicios, setServicios] = useState([]);
// // // //   const [clientes, setClientes] = useState([]);

// // // //   useEffect(() => {
// // // //     const cargarDatos = async () => {
// // // //       try {
// // // //         const serviciosData = await fetchServicios();
// // // //         setServicios(serviciosData);

// // // //         const clientesData = await fetchClientes();
// // // //         setClientes(clientesData);

// // // //         const reservasData = await fetchReservas();
// // // //         if (reservasData.length > 0 && serviciosData.length > 0 && clientesData.length > 0) {
// // // //           const formattedItems = formatDataToItems(reservasData, serviciosData, clientesData);
// // // //           setItems(formattedItems);
// // // //         } else {
// // // //           setItems({});
// // // //         }
// // // //       } catch (error) {
// // // //         console.error('Error al cargar datos:', error);
// // // //       } finally {
// // // //         setLoading(false);
// // // //       }
// // // //     };

// // // //     if (user && user.role === "empresa") {
// // // //       cargarDatos();
// // // //     }
// // // //   }, [user]);

// // // //   const fetchServicios = async () => {
// // // //     console.log('Cargando servicios...');
// // // //     const response = await axios.get(`${Config.url()}/servicios/empresa/${user.id}`);
// // // //     return response.data || [];
// // // //   };

// // // //   const fetchClientes = async () => {
// // // //     console.log('Cargando clientes...');
// // // //     const response = await axios.get(`${Config.url()}/empresas/${user.id}/clientes`);
// // // //     return response.data.data || [];
// // // //   };

// // // //   const fetchReservas = async () => {
// // // //     console.log('Cargando reservas...');
// // // //     const response = await axios.get(`${Config.url()}/reservas/empresa/${user.id}`);
// // // //     return response.data.data || [];
// // // //   };

// // // //   const formatDataToItems = (reservas, servicios, clientes) => {
// // // //     const formattedItems = {};
// // // //     reservas.forEach(reserva => {
// // // //       const fecha = reserva.fecha;
// // // //       if (!formattedItems[fecha]) {
// // // //         formattedItems[fecha] = [];
// // // //       }
// // // //       const nombreServicio = obtenerNombreServicio(reserva.servicios, servicios);
// // // //       const nombreCliente = obtenerNombreCliente(reserva.cliente_id, clientes);
// // // //       formattedItems[fecha].push({
// // // //         Cliente_Id: `Cliente: ${nombreCliente}`,
// // // //         hora: `Hora: ${reserva.hora}`,
// // // //         servicio: `Servicio: ${nombreServicio}`,
// // // //         Duracion: `Duracion: ${reserva.duracion} Minutos`,
// // // //         Precio: `Precio Total: $${reserva.precio}`,
// // // //         Estado: `Estado: ${reserva.estado}`,
// // // //       });
// // // //     });
// // // //     return formattedItems;
// // // //   };

// // // //   const obtenerNombreServicio = (serviciosArray, servicios) => {
// // // //     try {
// // // //       const servicioIds = JSON.parse(serviciosArray);
// // // //       const nombresServicios = servicioIds.map((id) => {
// // // //         const servicio = servicios.find(s => s.id == id); 
// // // //         return servicio ? servicio.nombre : "Servicio no especificado";
// // // //       });
// // // //       return nombresServicios.join(", ");
// // // //     } catch (e) {
// // // //       console.error('Error al obtener nombre del servicio:', e);
// // // //       return "Servicio no especificado";
// // // //     }
// // // //   };

// // // //   const obtenerNombreCliente = (clienteId, clientes) => {
// // // //     const cliente = clientes.find(c => c.id == clienteId);
// // // //     return cliente ? cliente.name : "Cliente no especificado";
// // // //   };

// // // //   if (loading) {
// // // //     return (
// // // //       <View style={styles.loadingContainer}>
// // // //         <ActivityIndicator size="large" color="#0000ff" />
// // // //       </View>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <View style={styles.container}>
// // // //       <Text style={styles.title}>Agenda</Text>
// // // //       <Button title="Listado Reserva" onPress={() => navigation.navigate('ReservasCRUD')} />
// // // //       <Agenda
// // // //         items={items}
// // // //         renderItem={(item) => (
// // // //           <View style={[styles.item]}>
// // // //             <Text>{item.Cliente_Id}</Text>
// // // //             <Text>{item.hora}</Text>
// // // //             <Text>{item.servicio}</Text>
// // // //             <Text>{item.Duracion}</Text>
// // // //             <Text>{item.Precio}</Text>
// // // //             <Text>{item.Estado}</Text>
// // // //           </View>
// // // //         )}
// // // //         renderEmptyDate={() => (
// // // //           <View style={styles.emptyDate}>
// // // //             <Text>No hay reservas para este día.</Text>
// // // //           </View>
// // // //         )}
// // // //         rowHasChanged={(r1, r2) => r1.Cliente_Id !== r2.Cliente_Id}
// // // //         renderEmptyData={() => (
// // // //           <View style={styles.emptyDate}>
// // // //             <Text>No hay reservas para este día.</Text>
// // // //           </View>
// // // //         )}
// // // //       />
// // // //     </View>
// // // //   );
// // // // };

// // // // const styles = StyleSheet.create({
// // // //   container: {
// // // //     flex: 1,
// // // //     backgroundColor: 'white',
// // // //   },
// // // //   loadingContainer: {
// // // //     flex: 1,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //   },
// // // //   item: {
// // // //     backgroundColor: 'lightblue',
// // // //     flex: 1,
// // // //     borderRadius: 5,
// // // //     padding: 10,
// // // //     marginRight: 10,
// // // //     marginTop: 17,
// // // //   },
// // // //   emptyDate: {
// // // //     height: 15,
// // // //     flex: 1, 
// // // //     paddingTop: 30,
// // // //   },
// // // //   title: {
// // // //     fontSize: 24,
// // // //     marginBottom: 20,
// // // //     fontWeight: "bold",
// // // //     textAlign: "center",
// // // //   },
// // // // });

// // // // export default AgendaScreen;


