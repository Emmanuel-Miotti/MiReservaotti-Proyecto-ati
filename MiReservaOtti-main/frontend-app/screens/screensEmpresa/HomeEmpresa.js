import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Button,

} from "react-native";
import { UserContext } from "../../contexts/UserContext";
import ButtonGradient from "../components/ButtonGradient";
import axios from "axios";

const HomeEmpresa = ({ navigation }) => {
  const { user, logout } = useContext(UserContext);
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    // if (user) {
      obtenerReservas();
    // }
  }, []);

  const obtenerReservas = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/v1/reservas/empresa/${user.id}`
      );
      setReservas(response.data.data);
    } catch (error) {
      console.error("Error al cargar reservas:", error);
      setReservas([]); // En caso de error, inicializa reservas como un array vacío
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

  const ServiciosCRUD = () => {
    navigation.navigate("ServiciosCRUD");
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: user.profile_picture || "https://via.placeholder.com/150",
          }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{user.name}</Text>
      </View>

      <View style={styles.reservasContainer}>
        <Text style={styles.sectionTitle}>Próximas citas</Text>
        {Array.isArray(reservas) && reservas.length === 0 ? (
          <Text style={styles.noReservas}>No hay reservas próximas.</Text>
        ) : (
          Array.isArray(reservas) &&
          reservas.map((reserva) => (
            <View key={reserva.id} style={styles.reservaItem}>
              <Text style={styles.reservaText}>
                {reserva.hora} - {"Duracion: "+reserva.duracion +" min"}
              </Text>
              <Text style={styles.reservaText}>Fecha: {reserva.fecha}</Text>
              <Text style={styles.reservaText}>
                Cliente: {reserva.cliente_id}
              </Text>
              <Text style={styles.reservaText}>Estado: {reserva.estado}</Text>
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
  welcome: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#343a40",
  },
  buttonContainer: {
    width: "80%",
    marginVertical: 10,
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
  },

});

export default HomeEmpresa;
