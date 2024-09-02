import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { UserContext } from "../../contexts/UserContext";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import Config from "../Config";

const MisReservas = () => {
  const { user } = useContext(UserContext);
  const [reservasProximas, setReservasProximas] = useState([]);
  const [reservasPasadas, setReservasPasadas] = useState([]);
  const [reservasCanceladas, setReservasCanceladas] = useState([]);
  const [serviciosPorEmpresa, setServiciosPorEmpresa] = useState({});

  useEffect(() => {
    obtenerReservas();
  }, []);

  const obtenerServiciosPorEmpresa = async (empresaId) => {
    try {
      if (!serviciosPorEmpresa[empresaId]) {
        const response = await axios.get(
          `${Config.url()}/servicios/empresa/${empresaId}`
        );
        setServiciosPorEmpresa((prev) => ({
          ...prev,
          [empresaId]: response.data || [],
        }));
      }
    } catch (error) {
      console.error("Error al cargar los servicios:", error);
    }
  };

  const obtenerReservas = async () => {
    try {
      const response = await axios.get(`${Config.url()}/reservas/${user.id}`);
      const proximas = Array.isArray(response.data.proximas)
        ? response.data.proximas
        : Object.values(response.data.proximas);

      const fechaActual = new Date();

      const nuevasProximas = proximas.filter((reserva) => {
        const fechaReserva = new Date(`${reserva.fecha}T${reserva.hora}`);
        return fechaReserva >= fechaActual && reserva.estado !== "cancelado";
      });

      const nuevasPasadas = proximas.filter((reserva) => {
        const fechaReserva = new Date(`${reserva.fecha}T${reserva.hora}`);
        return fechaReserva < fechaActual;
      });

      setReservasProximas(nuevasProximas);
      setReservasPasadas([
        ...nuevasPasadas,
        ...(Array.isArray(response.data.pasadas) ? response.data.pasadas : []),
      ]);

      const canceladas = proximas.filter(
        (reserva) => reserva.estado === "cancelado"
      );
      setReservasCanceladas(canceladas);

      const empresasIds = nuevasProximas.map((reserva) => reserva.empresa_id);
      for (const empresaId of empresasIds) {
        await obtenerServiciosPorEmpresa(empresaId);
      }
    } catch (error) {
      console.error("Error al cargar reservas:", error);
    }
  };

  const cancelarReserva = async (reservaId) => {
    try {
      await axios.post(`${Config.url()}/cancelar-reserva/${reservaId}`);
      Alert.alert(
        "Reserva cancelada",
        "La reserva ha sido cancelada exitosamente."
      );
      obtenerReservas();
    } catch (error) {
      console.error("Error al cancelar la reserva:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al cancelar la reserva. Inténtalo de nuevo."
      );
    }
  };

  const obtenerNombreServicio = (servicioIds, empresaId) => {
    try {
      const serviciosSeleccionados = JSON.parse(servicioIds);
      const servicios = serviciosPorEmpresa[empresaId] || [];
      const nombresServicios = serviciosSeleccionados.map((id) => {
        const servicio = servicios.find((s) => s.id === id);
        return servicio ? servicio.nombre : "Servicio no especificado";
      });
      return nombresServicios.join(", ");
    } catch (e) {
      return "Servicio no especificado";
    }
  };

  const defaultImage = "https://via.placeholder.com/150";

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Mis Reservas</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={obtenerReservas}
        >
          <Icon name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Próximas Reservas</Text>
        {reservasProximas.length === 0 ? (
          <Text style={styles.noReservasText}>
            No tienes reservas próximas.
          </Text>
        ) : (
          reservasProximas.map((item) => (
            <View key={item.id} style={styles.card}>
              {/* <Image
                source={{ uri: item.image || defaultImage }}
                style={styles.image}
              /> */}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardInfo}>Fecha: {item.fecha}</Text>
                <Text style={styles.cardInfo}>Hora: {item.hora}</Text>
                <Text style={styles.cardInfo}>
                  Duración: {item.duracion ? `${item.duracion} Minutos` : "N/A"}
                </Text>
                <Text style={styles.cardProximo}>Estado: {item.estado}</Text>
                {item.estado === "reservado" && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => cancelarReserva(item.id)}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Reservas Pasadas</Text>
        {reservasPasadas.length === 0 ? (
          <Text style={styles.noReservasText}>No tienes reservas pasadas.</Text>
        ) : (
          reservasPasadas.map((item) => (
            <View key={item.id} style={styles.card}>
              {/* <Image
                source={{ uri: item.image || defaultImage }}
                style={styles.image}
              /> */}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardInfo}>Fecha: {item.fecha}</Text>
                <Text style={styles.cardInfo}>Hora: {item.hora}</Text>
                <Text style={styles.cardInfo}>
                  Duración: {item.duracion ? `${item.duracion} Minutos` : "N/A"}
                </Text>
              </View>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Reservas Canceladas</Text>
        {reservasCanceladas.length === 0 ? (
          <Text style={styles.noReservasText}>
            No tienes reservas canceladas.
          </Text>
        ) : (
          reservasCanceladas.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image
                source={{ uri: item.image || defaultImage }}
                style={styles.image}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardInfo}>Fecha: {item.fecha}</Text>
                <Text style={styles.cardInfo}>Hora: {item.hora}</Text>
                <Text style={styles.cardCancelInfo}>Estado: Cancelado</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F7FA",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a73e8",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#1a73e8",
    paddingBottom: 5,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#34495E",
    marginBottom: 5,
  },
  cardInfo: {
    fontSize: 16,
    color: "#7F8C8D",
  },
  cardCancelInfo: {
    fontSize: 16,
    color: "#E74C3C",
    fontWeight: "bold",
  },
  noReservasText: {
    fontSize: 16,
    color: "#95A5A6",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#E74C3C",
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cardProximo: {
    fontSize: 16,
    color: "#2CB438",
    fontWeight: "bold",
  },
  refreshButton: {
    backgroundColor: "#1a73e8",
    padding: 8,
    borderRadius: 50,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
});

export default MisReservas;

// import React, { useState, useEffect, useContext } from "react";
// import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
// import { UserContext } from "../../contexts/UserContext";
// import axios from "axios";
// import Config from "../Config";

// const MisReservas = () => {
//   const { user } = useContext(UserContext);
//   const [reservasProximas, setReservasProximas] = useState([]);
//   const [reservasPasadas, setReservasPasadas] = useState([]);
//   const [reservasCanceladas, setReservasCanceladas] = useState([]);

//   useEffect(() => {
//     obtenerReservas();
//   }, []);

//   const obtenerReservas = async () => {
//     try {
//       const response = await axios.get(`${Config.url()}/reservas/${user.id}`);
//       const proximas = Array.isArray(response.data.proximas)
//         ? response.data.proximas
//         : Object.values(response.data.proximas);

//       // Fecha actual para comparación
//       const fechaActual = new Date();

//       // Filtra y mueve las reservas pasadas
//       const nuevasProximas = proximas.filter((reserva) => {
//         const fechaReserva = new Date(reserva.fecha_reserva);
//         return fechaReserva >= fechaActual && reserva.estado !== "cancelado";
//       });

//       const nuevasPasadas = proximas.filter((reserva) => {
//         const fechaReserva = new Date(reserva.fecha_reserva);
//         return fechaReserva < fechaActual;
//       });

//       setReservasProximas(nuevasProximas);
//       setReservasPasadas([...nuevasPasadas, ...(Array.isArray(response.data.pasadas) ? response.data.pasadas : [])]);

//       // Filtra y guarda las reservas canceladas
//       const canceladas = proximas.filter((reserva) => reserva.estado === "cancelado");
//       setReservasCanceladas(canceladas);

//     } catch (error) {
//       console.error("Error al cargar reservas:", error);
//     }
//   };

//   const cancelarReserva = async (reservaId) => {
//     try {
//       await axios.post(`${Config.url()}/cancelar-reserva/${reservaId}`);
//       Alert.alert("Reserva cancelada", "La reserva ha sido cancelada exitosamente.");
//       obtenerReservas(); // Recargar las reservas después de cancelar
//     } catch (error) {
//       console.error("Error al cancelar la reserva:", error);
//       Alert.alert("Error", "Hubo un problema al cancelar la reserva. Inténtalo de nuevo.");
//     }
//   };

//   const defaultImage = "https://via.placeholder.com/150";
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Mis Reservas</Text>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         <Text style={styles.sectionTitle}>Próximas Reservas</Text>
//         {reservasProximas.length === 0 ? (
//           <Text style={styles.noReservasText}>No tienes reservas próximas.</Text>
//         ) : (
//           reservasProximas
//             .map((item) => (
//               <View key={item.id} style={styles.card}>
//                 <Image
//                   source={{ uri: item.image || defaultImage }}
//                   style={styles.image}
//                 />
//                 <View style={styles.cardContent}>
//                   <Text style={styles.cardTitle}>{item.name}</Text>
//                   <Text style={styles.cardInfo}>
//                     Fecha: {new Date(item.fecha_reserva).toLocaleDateString()}
//                   </Text>
//                   <Text style={styles.cardInfo}>
//                     Hora: {new Date(item.fecha_reserva).toLocaleTimeString()}
//                   </Text>
//                   <Text style={styles.cardInfo}>
//                     Duración: {item.duracion ? `${item.duracion} Minutos` : "N/A"}
//                   </Text>
//                   <Text style={styles.cardInfo}>
//                     Servicio: {item.servicios ? item.servicios : "N/A"}
//                   </Text>
//                   <Text style={styles.cardProximo}>
//                     Estado: Reservado
//                   </Text>
//                   {item.estado === "reservado" && (
//                     <TouchableOpacity
//                       style={styles.cancelButton}
//                       onPress={() => cancelarReserva(item.id)}
//                     >
//                       <Text style={styles.cancelButtonText}>Cancelar</Text>
//                     </TouchableOpacity>
//                   )}
//                 </View>
//               </View>
//             ))
//         )}

//         <Text style={styles.sectionTitle}>Reservas Pasadas</Text>
//         {reservasPasadas.length === 0 ? (
//           <Text style={styles.noReservasText}>No tienes reservas pasadas.</Text>
//         ) : (
//           reservasPasadas.map((item) => (
//             <View key={item.id} style={styles.card}>
//               <Image
//                 source={{ uri: item.image || defaultImage }}
//                 style={styles.image}
//               />
//               <View style={styles.cardContent}>
//                 <Text style={styles.cardTitle}>{item.name}</Text>
//                 <Text style={styles.cardInfo}>
//                   Fecha: {new Date(item.fecha_reserva).toLocaleDateString()}
//                 </Text>
//                 <Text style={styles.cardInfo}>
//                   Hora: {new Date(item.fecha_reserva).toLocaleTimeString()}
//                 </Text>
//                 <Text style={styles.cardInfo}>
//                   Duración: {item.duracion ? `${item.duracion} Minutos` : "N/A"}
//                 </Text>
//                 <Text style={styles.cardInfo}>
//                   Servicio: {item.servicios ? item.servicios : "N/A"}
//                 </Text>
//               </View>
//             </View>
//           ))
//         )}

//         <Text style={styles.sectionTitle}>Reservas Canceladas</Text>
//         {reservasCanceladas.length === 0 ? (
//           <Text style={styles.noReservasText}>No tienes reservas canceladas.</Text>
//         ) : (
//           reservasCanceladas.map((item) => (
//             <View key={item.id} style={styles.card}>
//               <Image
//                 source={{ uri: item.image || defaultImage }}
//                 style={styles.image}
//               />
//               <View style={styles.cardContent}>
//                 <Text style={styles.cardTitle}>{item.name}</Text>
//                 <Text style={styles.cardInfo}>
//                   Fecha: {new Date(item.fecha_reserva).toLocaleDateString()}
//                 </Text>
//                 <Text style={styles.cardInfo}>
//                   Hora: {new Date(item.fecha_reserva).toLocaleTimeString()}
//                 </Text>
//                 <Text style={styles.cardInfo}>
//                   Duración: {item.duracion ? `${item.duracion} Minutos` : "N/A"}
//                 </Text>
//                 <Text style={styles.cardCancelInfo}>
//                   Estado: Cancelado
//                 </Text>
//               </View>
//             </View>
//           ))
//         )}

//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#F5F7FA",
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#333",
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: "600",
//     color: "#2C3E50",
//     marginBottom: 10,
//     borderBottomWidth: 2,
//     borderBottomColor: "#2980B9",
//     paddingBottom: 5,
//   },
//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 15,
//     padding: 15,
//     marginBottom: 15,
//     flexDirection: "row",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   image: {
//     width: 70,
//     height: 70,
//     borderRadius: 10,
//     marginRight: 15,
//   },
//   cardContent: {
//     flex: 1,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#34495E",
//     marginBottom: 5,
//   },
//   cardInfo: {
//     fontSize: 16,
//     color: "#7F8C8D",
//   },
//   cardCancelInfo: {
//     fontSize: 16,
//     color: "#E74C3C",
//     fontWeight: "bold",
//   },
//   noReservasText: {
//     fontSize: 16,
//     color: "#95A5A6",
//     textAlign: "center",
//     marginTop: 20,
//     fontStyle: "italic",
//   },
//   cancelButton: {
//     marginTop: 10,
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     backgroundColor: "#E74C3C",
//     borderRadius: 5,
//     alignItems: "center",
//   },
//   cancelButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   cardProximo: {
//     fontSize: 16,
//     color: "#2CB438",
//     fontWeight: "bold",
//   },
// });

// export default MisReservas;
