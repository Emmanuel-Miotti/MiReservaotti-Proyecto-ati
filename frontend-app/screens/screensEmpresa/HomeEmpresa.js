import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { UserContext } from "../../contexts/UserContext";
import axios from "axios";
import Config from "../Config";
import moment from "moment";
import Icon from "react-native-vector-icons/Ionicons";

const HomeEmpresa = ({ navigation }) => {
  const { user, logout } = useContext(UserContext);
  const [reservasHoy, setReservasHoy] = useState([]);
  const [todasReservas, setTodasReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);

  useEffect(() => {
    obtenerClientesYServicios();
    obtenerReservas();
  }, []);

  const obtenerClientesYServicios = async () => {
    try {
      const responseClientes = await axios.get(
        `${Config.url()}/empresas/${user.id}/clientes`
      );
      const responseServicios = await axios.get(
        `${Config.url()}/servicios/empresa/${user.id}`
      );
      console.log("Servicios cargados:", responseServicios.data);
      setClientes(responseClientes.data.data || []);
      setServicios(responseServicios.data || []);
    } catch (error) {
      console.error("Error al cargar clientes y servicios:", error);
      setClientes([]);
      setServicios([]);
    }
  };

  const obtenerReservas = async () => {
    try {
      const responseReservas = await axios.get(
        `${Config.url()}/reservas/empresa/${user.id}`
      );
      const responseReservasUsuariosNoRegistrados = await axios.get(
        `${Config.url()}/reservas2/empresa/${user.id}`
      );

      const allReservas = [
        ...responseReservas.data.data,
        ...responseReservasUsuariosNoRegistrados.data.data,
      ];


      console.log(responseReservas)

      const ahora = moment();


      const reservasFiltradas = allReservas.filter((reserva) => {
        const reservaFechaHora = moment(`${reserva.fecha} ${reserva.hora}`);
        return (
          reservaFechaHora.isSameOrAfter(ahora) &&
          reserva.estado === "reservado"
        );
      });

      reservasFiltradas.sort((a, b) => {
        const fechaHoraA = moment(`${a.fecha} ${a.hora}`);
        const fechaHoraB = moment(`${b.fecha} ${b.hora}`);
        return fechaHoraA.diff(fechaHoraB);
      });

      const reservasDeHoy = reservasFiltradas.filter((reserva) =>
        moment(reserva.fecha).isSame(moment(), "day")
      );

      setReservasHoy(reservasDeHoy);
      setTodasReservas(reservasFiltradas);
    } catch (error) {
      console.error("Error al cargar reservas:", error);
      setReservasHoy([]);
      setTodasReservas([]);
    }
  };

  const obtenerNombreCliente = (clienteId) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente ? cliente.name : "Usuario no registrado";
  };

  const obtenerNombreServicios = (serviciosArray) => {
    try {
      // Primero verifica si serviciosArray es realmente un array
      if (!Array.isArray(serviciosArray)) {
        console.error("serviciosArray no es un array:", serviciosArray);
        return "Servicio no especificado";
      }
  
      // Suponiendo que serviciosArray es un array de objetos con una propiedad 'id'
      const nombresServicios = serviciosArray.map((item) => {
        const servicio = servicios.find((s) => s.id === item.id);
        return servicio ? servicio.nombre : "Servicio no especificado";
      });
  
      return nombresServicios.join(", ");
    } catch (e) {
      console.error("Error en obtenerNombreServicios:", e);
      return "Servicio no especificado";
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: user.profile_picture
            ? `${Config.urlFoto()}${user.profile_picture}`
            : "https://via.placeholder.com/150",
          }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{user.name}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reservasContainer}>
        <Text style={styles.sectionTitle}>
          <Icon name="time-outline" size={20} color="#007bff" /> Próximas citas de hoy
        </Text>
        {Array.isArray(reservasHoy) && reservasHoy.length === 0 ? (
          <Text style={styles.noReservas}>No hay reservas para hoy.</Text>
        ) : (
          Array.isArray(reservasHoy) &&
          reservasHoy.map((reserva) => (
            <View key={reserva.id} style={styles.reservaItem}>
              <Text style={styles.reservaText}>
                <Icon name="alarm-outline" size={16} color="#343a40" /> {reserva.hora} - {"Duración: " + reserva.duracion + " min"}
              </Text>
              <Text style={styles.reservaText}>
                <Icon name="calendar-outline" size={16} color="#343a40" /> Fecha: {reserva.fecha}
              </Text>
              <Text style={styles.reservaText}>
                <Icon name="person-outline" size={16} color="#343a40" /> Cliente: {obtenerNombreCliente(reserva.cliente_id)}
              </Text>
              <Text style={styles.reservaText}>
                <Icon name="briefcase-outline" size={16} color="#343a40" /> Servicio(s): {obtenerNombreServicios(reserva.servicios)}
              </Text>
              <Text style={styles.reservaText}>
                <Icon name="checkmark-circle-outline" size={16} color="#28a745" /> Estado: {reserva.estado}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>
          <Icon name="calendar-outline" size={20} color="#007bff" /> Todas las próximas citas
        </Text>
        {Array.isArray(todasReservas) && todasReservas.length === 0 ? (
          <Text style={styles.noReservas}>No hay reservas próximas.</Text>
        ) : (
          Array.isArray(todasReservas) &&
          todasReservas.map((reserva) => (
            <View key={reserva.id} style={styles.reservaItem}>
              <Text style={styles.reservaText}>
                <Icon name="alarm-outline" size={16} color="#343a40" /> {reserva.hora} - {"Duración: " + reserva.duracion + " min"}
              </Text>
              <Text style={styles.reservaText}>
                <Icon name="calendar-outline" size={16} color="#343a40" /> Fecha: {reserva.fecha}
              </Text>
              <Text style={styles.reservaText}>
                <Icon name="person-outline" size={16} color="#343a40" /> Cliente: {obtenerNombreCliente(reserva.cliente_id)}
              </Text>
              <Text style={styles.reservaText}>
                <Icon name="briefcase-outline" size={16} color="#343a40" /> Servicio(s): {obtenerNombreServicios(reserva.servicios)}
              </Text>
              <Text style={styles.reservaText}>
                <Icon name="checkmark-circle-outline" size={16} color="#28a745" /> Estado: {reserva.estado}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    width: "100%",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#343a40",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  logoutButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
  reservasContainer: {
    width: "100%",
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#343a40",
  },
  noReservas: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  reservaItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  reservaText: {
    fontSize: 16,
    color: "#495057",
    marginBottom: 5,
  },
});

export default HomeEmpresa;

// import React, { useContext, useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   ScrollView,
//   TouchableOpacity,
// } from "react-native";
// import { UserContext } from "../../contexts/UserContext";
// import axios from "axios";
// import Config from "../Config";
// import moment from "moment";
// import Icon from "react-native-vector-icons/Ionicons";

// const HomeEmpresa = ({ navigation }) => {
//   const { user, logout } = useContext(UserContext);
//   const [reservasHoy, setReservasHoy] = useState([]);
//   const [todasReservas, setTodasReservas] = useState([]);
//   const [clientes, setClientes] = useState([]);
//   const [servicios, setServicios] = useState([]);

//   useEffect(() => {
//     obtenerClientesYServicios();
//     obtenerReservas();
//   }, []);

//   const obtenerClientesYServicios = async () => {
//     try {
//       const responseClientes = await axios.get(
//         `${Config.url()}/empresas/${user.id}/clientes`
//       );
//       const responseServicios = await axios.get(
//         `${Config.url()}/servicios/empresa/${user.id}`
//       );

//       setClientes(responseClientes.data.data || []);
//       setServicios(responseServicios.data || []);
//     } catch (error) {
//       console.error("Error al cargar clientes y servicios:", error);
//       setClientes([]);
//       setServicios([]);
//     }
//   };

//   const obtenerReservas = async () => {
//     try {
//       const responseReservas = await axios.get(
//         `${Config.url()}/reservas/empresa/${user.id}`
//       );
//       const responseReservasUsuariosNoRegistrados = await axios.get(
//         `${Config.url()}/reservas2/empresa/${user.id}`
//       );

//       const allReservas = [
//         ...responseReservas.data.data,
//         ...responseReservasUsuariosNoRegistrados.data.data,
//       ];

//       const reservasFiltradas = allReservas.filter((reserva) => {
//         const reservaFechaHora = moment(`${reserva.fecha} ${reserva.hora}`);
//         const ahora = moment();
//         return (
//           reservaFechaHora.isSameOrAfter(ahora) && reserva.estado === "reservado"
//         );
//       });

//       reservasFiltradas.sort((a, b) => {
//         const fechaHoraA = moment(`${a.fecha} ${a.hora}`);
//         const fechaHoraB = moment(`${b.fecha} ${b.hora}`);
//         return fechaHoraA.diff(fechaHoraB);
//       });

//       const reservasDeHoy = reservasFiltradas.filter((reserva) =>
//         moment(reserva.fecha).isSame(moment(), "day")
//       );

//       setReservasHoy(reservasDeHoy);
//       setTodasReservas(reservasFiltradas);
//     } catch (error) {
//       console.error("Error al cargar reservas:", error);
//       setReservasHoy([]);
//       setTodasReservas([]);
//     }
//   };

//   const obtenerNombreCliente = (clienteId) => {
//     const cliente = clientes.find((c) => c.id === clienteId);
//     return cliente ? cliente.name : "Usuario no registrado";
//   };

//   const obtenerNombreServicios = (serviciosArray) => {
//     try {
//       const servicioIds = JSON.parse(serviciosArray);
//       const nombresServicios = servicioIds.map((id) => {
//         const servicio = servicios.find((s) => s.id == id);
//         return servicio ? servicio.nombre : "Servicio no especificado";
//       });
//       return nombresServicios.join(", ");
//     } catch (e) {
//       return "Servicio no especificado";
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//       navigation.navigate("Login");
//     } catch (error) {
//       console.error("Error al cerrar sesión:", error);
//     }
//   };

//   if (!user) {
//     return (
//       <View style={styles.container}>
//         <Text>Cargando...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.profileContainer}>
//         <Image
//           source={{
//             uri: user.profile_picture || "https://via.placeholder.com/150",
//           }}
//           style={styles.profileImage}
//         />
//         <Text style={styles.name}>{user.name}</Text>
//         <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//           <Icon name="log-out-outline" size={20} color="#fff" />
//           <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.reservasContainer}>
//         <Text style={styles.sectionTitle}>
//           <Icon name="time-outline" size={20} color="#007bff" /> Próximas citas de hoy
//         </Text>
//         {Array.isArray(reservasHoy) && reservasHoy.length === 0 ? (
//           <Text style={styles.noReservas}>No hay reservas para hoy.</Text>
//         ) : (
//           Array.isArray(reservasHoy) &&
//           reservasHoy.map((reserva) => (
//             <View key={reserva.id} style={styles.reservaItem}>
//               <Text style={styles.reservaText}>
//                 <Icon name="alarm-outline" size={16} color="#343a40" /> {reserva.hora} - {"Duración: " + reserva.duracion + " min"}
//               </Text>
//               <Text style={styles.reservaText}>
//                 <Icon name="calendar-outline" size={16} color="#343a40" /> Fecha: {reserva.fecha}
//               </Text>
//               <Text style={styles.reservaText}>
//                 <Icon name="person-outline" size={16} color="#343a40" /> Cliente: {obtenerNombreCliente(reserva.cliente_id)}
//               </Text>
//               <Text style={styles.reservaText}>
//                 <Icon name="briefcase-outline" size={16} color="#343a40" /> Servicio(s): {obtenerNombreServicios(reserva.servicios)}
//               </Text>
//               <Text style={styles.reservaText}>
//                 <Icon name="checkmark-circle-outline" size={16} color="#28a745" /> Estado: {reserva.estado}
//               </Text>
//             </View>
//           ))
//         )}

//         <Text style={styles.sectionTitle}>
//           <Icon name="calendar-outline" size={20} color="#007bff" /> Todas las próximas citas
//         </Text>
//         {Array.isArray(todasReservas) && todasReservas.length === 0 ? (
//           <Text style={styles.noReservas}>No hay reservas próximas.</Text>
//         ) : (
//           Array.isArray(todasReservas) &&
//           todasReservas.map((reserva) => (
//             <View key={reserva.id} style={styles.reservaItem}>
//               <Text style={styles.reservaText}>
//                 <Icon name="alarm-outline" size={16} color="#343a40" /> {reserva.hora} - {"Duración: " + reserva.duracion + " min"}
//               </Text>
//               <Text style={styles.reservaText}>
//                 <Icon name="calendar-outline" size={16} color="#343a40" /> Fecha: {reserva.fecha}
//               </Text>
//               <Text style={styles.reservaText}>
//                 <Icon name="person-outline" size={16} color="#343a40" /> Cliente: {obtenerNombreCliente(reserva.cliente_id)}
//               </Text>
//               <Text style={styles.reservaText}>
//                 <Icon name="briefcase-outline" size={16} color="#343a40" /> Servicio(s): {obtenerNombreServicios(reserva.servicios)}
//               </Text>
//               <Text style={styles.reservaText}>
//                 <Icon name="checkmark-circle-outline" size={16} color="#28a745" /> Estado: {reserva.estado}
//               </Text>
//             </View>
//           ))
//         )}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 20,
//     alignItems: "center",
//     backgroundColor: "#f8f9fa",
//   },
//   profileContainer: {
//     alignItems: "center",
//     marginBottom: 20,
//     padding: 20,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 5,
//     width: "100%",
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 10,
//   },
//   name: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#343a40",
//   },
//   logoutButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#dc3545",
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 15,
//   },
//   logoutButtonText: {
//     color: "#fff",
//     marginLeft: 10,
//     fontSize: 16,
//   },
//   reservasContainer: {
//     width: "100%",
//     marginTop: 20,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     marginBottom: 10,
//     fontWeight: "bold",
//     color: "#343a40",
//   },
//   noReservas: {
//     fontSize: 16,
//     color: "#888",
//     textAlign: "center",
//   },
//   reservaItem: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 10,
//     width: "100%",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 5,
//   },
//   reservaText: {
//     fontSize: 16,
//     color: "#495057",
//     marginBottom: 5,
//   },
// });

// export default HomeEmpresa;
