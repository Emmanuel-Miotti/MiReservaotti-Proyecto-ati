import React, { useContext } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { UserContext } from "../../contexts/UserContext";
import Config from "../Config";

const PerfilCliente = ({ navigation }) => {
  const { user, logout } = useContext(UserContext);

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Perfil de {user.name}</Text>
      </View>
      <View style={styles.profileContainer}>
        <Image
          source={{
            // uri: user.profile_picture || "https://via.placeholder.com/150",
            uri: user.profile_picture
            ? `${Config.urlFoto()}${user.profile_picture}`
            : "https://via.placeholder.com/150",
          }}
          style={styles.profileImage}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.infoRow}>
            <Icon name="mail-outline" size={20} color="#888" />
            <Text style={styles.email}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="call-outline" size={20} color="#888" />
            <Text style={styles.phone}>{user.cellphone}</Text>
          </View>
          {/* <View style={styles.infoRow}>
            <Icon name="home-outline" size={20} color="#888" />
            <Text style={styles.address}>{user.address}</Text>
          </View> */}
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

        {/* <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate("Configuraciones")}>
          <Icon name="settings-outline" size={20} color="#fff" />
          <Text style={styles.settingsButtonText}>Configuraciones</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate("MisCompras")}
        >
          <Icon name="cart-outline" size={20} color="#fff" />
          <Text style={styles.settingsButtonText}>Mis Compras</Text>
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
    flex: 1,
    backgroundColor: "#f4f4f8",
    padding: 20,
    alignItems: "center",
  },
  header: {
    backgroundColor: "#4a90e2",
    width: "100%",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  profileContainerBotones: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
    borderWidth: 2,
    borderColor: "#4a90e2",
  },
  infoContainer: {
    justifyContent: "center",
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  email: {
    fontSize: 16,
    color: "#888",
    marginLeft: 10,
  },
  phone: {
    fontSize: 16,
    color: "#888",
    marginLeft: 10,
  },
  address: {
    fontSize: 16,
    color: "#888",
    marginLeft: 10,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  editButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  reservationsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745", // Verde
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  reservationsButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0ad4e", // Amarillo
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  settingsButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d9534f",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButtonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PerfilCliente;
