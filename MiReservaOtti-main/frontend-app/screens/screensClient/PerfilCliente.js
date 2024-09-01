import React, { useContext } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { UserContext } from "../../contexts/UserContext";

const PerfilCliente = ({ navigation }) => {
  const { user, logout } = useContext(UserContext);

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: user.profile_picture || "https://via.placeholder.com/150",
          }}
          style={styles.profileImage}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.phone}>{user.cellphone}</Text>
          <Text style={styles.address}>{user.address}</Text>
        </View>
      </View>
      <View style={styles.profileContainerBotones}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditarCliente")}
        >
          <Icon name="pencil-outline" size={20} color="#fff" />
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.reservationsButton}
          onPress={() => navigation.navigate("MisReservas")}
        >
          <Icon name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.reservationsButtonText}>Mis Reservas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
    alignItems: "center",
    margin: 20,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileContainerBotones: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  infoContainer: {
    justifyContent: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  email: {
    fontSize: 16,
    color: "#888",
  },
  phone: {
    fontSize: 16,
    color: "#888",
  },
  address: {
    fontSize: 16,
    color: "#888",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  editButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
  reservationsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745", // Verde
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  reservationsButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d9534f",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  logoutButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
});

export default PerfilCliente;
