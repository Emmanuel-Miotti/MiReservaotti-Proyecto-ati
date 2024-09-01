import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Button,
} from "react-native";
import axios from "axios";
import { UserContext } from "../../contexts/UserContext";
import Config from "../Config";
import BotonVolver from "../components/BotonVolver";

const GestionClientes = ({ navigation }) => {
  const user = useContext(UserContext).user;
  const [clientes, setClientes] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user && user.role === "empresa") {
      obtenerClientes();
      obtenerServicios(); // Obtener los servicios de la empresa
    }
  }, []);

  const obtenerClientes = async () => {
    try {
      const response = await axios.get(
        `${Config.url()}/empresas/${user.id}/clientes`
      );
      setClientes(response.data.data || []);
    } catch (error) {
      setError("Error al cargar los clientes.");
      console.error("Error al cargar los clientes:", error);
    }
  };

  const obtenerServicios = async () => {
    try {
      const response = await axios.get(
        `${Config.url()}/servicios/empresa/${user.id}`
      );
      setServicios(response.data || []);
    } catch (error) {
      setError("Error al cargar los servicios.");
      console.error("Error al cargar los servicios:", error);
    }
  };

  const obtenerReservas = async (clienteId) => {
    try {
      const response = await axios.get(
        `${Config.url()}/reservas/${user.id}/${clienteId}`
      );
      setReservas(response.data.data || []);
    } catch (error) {
      setError("Error al cargar las reservas.");
      console.error("Error al cargar las reservas:", error);
    }
  };

  const obtenerProductos = async (clienteId) => {
    try {
      const response = await axios.get(
        `${Config.url()}/productos/${clienteId}/empresa/${user.id}`
      );
      setCompras(response.data.data || []);
    } catch (error) {
      setError("Error al cargar las compras.");
      console.error("Error al cargar las compras:", error);
    }
  };

  const handleVerReservas = (cliente) => {
    setSelectedCliente(cliente);
    obtenerReservas(cliente.id);
    obtenerProductos(cliente.id);
    setModalVisible(true);
  };

  const handleVolver = () => {
    setSelectedCliente(null);
    setReservas([]);
    setCompras([]);
    setModalVisible(false);
  };

  const obtenerNombreServicio = (serviciosArray) => {
    try {
      const servicioIds = JSON.parse(serviciosArray);
      const nombresServicios = servicioIds.map((id) => {
        const servicio = servicios.find((s) => s.id === id);
        return servicio ? servicio.nombre : "Servicio no especificado";
      });
      return nombresServicios.join(", ");
    } catch (e) {
      return "Servicio no especificado";
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <BotonVolver onBack={handleBack} />
      <Text style={styles.title}>Gestión de Clientes</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={clientes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>
              {index + 1}. {item.name}
            </Text>
            <Text style={styles.itemSubText}>Email: {item.email}</Text>
            <Text style={styles.itemSubText}>Teléfono: {item.cellphone}</Text>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => handleVerReservas(item)}
            >
              <Text style={styles.viewButtonText}>Ver Detalles</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>No hay clientes que hayan realizado reservas.</Text>
        }
      />

      {selectedCliente && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Reservas y Compras de {selectedCliente.name}
            </Text>

            <Text style={styles.sectionTitle}>Reservas</Text>
            <FlatList
              data={reservas}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.modalItem}>
                  <Text style={styles.modalItemText}>
                    {index + 1}. Fecha: {item.fecha}
                  </Text>
                  <Text style={styles.modalItemText}>
                    Servicio: {obtenerNombreServicio(item.servicios)}
                  </Text>
                  <Text style={styles.modalItemText}>Estado: {item.estado}</Text>
                </View>
              )}
              ListEmptyComponent={
                <Text>No hay reservas para este cliente.</Text>
              }
            />

            <Text style={styles.sectionTitle}>Compras</Text>
            <FlatList
              data={compras}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.modalItem}>
                  <Text style={styles.modalItemText}>
                    {index + 1}. Producto ID: {item.producto_id}
                  </Text>
                  <Text style={styles.modalItemText}>
                    Cantidad: {item.cantidad}
                  </Text>
                  <Text style={styles.modalItemText}>Precio: ${item.precio}</Text>
                </View>
              )}
              ListEmptyComponent={
                <Text>No hay compras para este cliente.</Text>
              }
            />

            <TouchableOpacity style={styles.closeButton} onPress={handleVolver}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  item: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  itemText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  itemSubText: {
    fontSize: 16,
    color: "#666",
  },
  viewButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center",
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyListText: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#fff",
    textAlign: "center",
  },
  modalItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
  },
  modalItemText: {
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    backgroundColor: "#ff6347",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default GestionClientes;



// import React, { useState, useEffect, useContext } from 'react';
// import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, Button } from 'react-native';
// import axios from 'axios';
// import { UserContext } from "../../contexts/UserContext";
// import Config from '../Config';
// import BotonVolver from "../components/BotonVolver";

// const GestionClientes = ({ navigation }) => {
//   const user = useContext(UserContext).user;
//   const [clientes, setClientes] = useState([]);
//   const [reservas, setReservas] = useState([]);
//   const [compras, setCompras] = useState([]);
//   const [selectedCliente, setSelectedCliente] = useState(null);
//   const [error, setError] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);

//   useEffect(() => {
//     if (user && user.role === 'empresa') {
//       obtenerClientes();
//     }
//   }, []);

//   const obtenerClientes = async () => {
//     try {
//       const response = await axios.get(`${Config.url()}/empresas/${user.id}/clientes`);
//       setClientes(response.data.data || []);
//       console.log(response.data.data);  // Añade esta línea
//     } catch (error) {
//       setError("Error al cargar los clientes.");
//       console.error("Error al cargar los clientes:", error);
//     }
//   };

//   const obtenerReservas = async (clienteId) => {
//     try {
//       const response = await axios.get(`${Config.url()}/reservas/${user.id}/${clienteId}`);
//       setReservas(response.data.data || []);
//     } catch (error) {
//       setError("Error al cargar las reservas.");
//       console.error("Error al cargar las reservas:", error);
//     }
//   };

//   const obtenerProductos = async (clienteId) => {
//     try {
//       const response = await axios.get(`${Config.url()}/productos/${clienteId}/empresa/${user.id}`);
//       setCompras(response.data.data || []);
//     } catch (error) {
//       setError("Error al cargar las compras.");
//       console.error("Error al cargar las compras:", error);
//     }
//   };

//   const handleVerReservas = (cliente) => {
//     setSelectedCliente(cliente);
//     obtenerReservas(cliente.id);
//     obtenerProductos(cliente.id);
//     setModalVisible(true);
//   };

//   const handleVolver = () => {
//     setSelectedCliente(null);
//     setReservas([]);
//     setCompras([]);
//     setModalVisible(false);
//   };

//   const handleBack = () => {
//     navigation.goBack();
//   };

//   return (
//     <View style={styles.container}>
//         <BotonVolver onBack={handleBack} />
//       <Text style={styles.title}>Gestión de Clientes</Text>
//       {error && <Text style={styles.error}>{error}</Text>}
//       <FlatList
//         data={clientes}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item, index }) => (
//           <View style={styles.item}>
//             <Text style={styles.itemText}>{index + 1}. {item.name}</Text>
//             <Text style={styles.itemText}>Email: {item.email}</Text>
//             <Text style={styles.itemText}>Teléfono: {item.cellphone}</Text>
//             <TouchableOpacity
//               style={styles.button}
//               onPress={() => handleVerReservas(item)}
//             >
//               <Text style={styles.buttonText}>Ver Todo</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         ListEmptyComponent={<Text>No hay clientes que hayan realizado reservas.</Text>}
//       />

//       {selectedCliente && (
//         <Modal
//           animationType="slide"
//           transparent={true}
//           visible={modalVisible}
//           onRequestClose={() => setModalVisible(false)}
//         >
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Reservas y Compras de {selectedCliente.name}</Text>

//             <Text style={styles.sectionTitle}>Reservas</Text>
//             <FlatList
//               data={reservas}
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={({ item, index }) => (
//                 <View style={styles.item}>
//                   <Text style={styles.itemText}>{index + 1}. Fecha: {item.fecha}</Text>
//                   <Text style={styles.itemText}>Servicio: {item.servicios}</Text>
//                   <Text style={styles.itemText}>Estado: {item.estado}</Text>
//                 </View>
//               )}
//               ListEmptyComponent={<Text>No hay reservas para este cliente.</Text>}
//             />

//             <Text style={styles.sectionTitle}>Compras</Text>
//             <FlatList
//               data={compras}
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={({ item, index }) => (
//                 <View style={styles.item}>
//                   <Text style={styles.itemText}>{index + 1}. Producto ID: {item.producto_id}</Text>
//                   <Text style={styles.itemText}>Cantidad: {item.cantidad}</Text>
//                   <Text style={styles.itemText}>Precio: ${item.precio}</Text>
//                 </View>
//               )}
//               ListEmptyComponent={<Text>No hay compras para este cliente.</Text>}
//             />

//             <Button title="Volver" onPress={handleVolver} />
//           </View>
//         </Modal>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   error: {
//     color: 'red',
//     marginBottom: 10,
//   },
//   item: {
//     padding: 10,
//     marginVertical: 8,
//     backgroundColor: '#f9f9f9',
//     borderRadius: 8,
//     elevation: 2,
//   },
//   itemText: {
//     fontSize: 16,
//   },
//   button: {
//     backgroundColor: '#007bff',
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 10,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     padding: 20,
//     marginHorizontal: 20,
//     borderRadius: 10,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 10,
//   },
// });

// export default GestionClientes;
