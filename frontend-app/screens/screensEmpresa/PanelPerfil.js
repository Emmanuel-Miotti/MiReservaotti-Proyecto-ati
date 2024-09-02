import React, { useContext } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { UserContext } from "../../contexts/UserContext";
import Config from "../Config";

const PanelPerfil = ({ navigation }) => {
  const { user, logout } = useContext(UserContext);

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Login");
  };

  const handleOpenWeb = () => {
    if (user.url) {
      const fullUrl = `https://mireservaotti.online/${user.url}`;
      Linking.openURL(fullUrl);
    } else {
      alert("No se ha proporcionado una URL para esta empresa.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: user.profile_picture
            ? `${Config.urlFoto()}${user.profile_picture}`
            : "https://via.placeholder.com/150",
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

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => navigation.navigate("EditarEmpresa")}
        >
          <Icon name="pencil-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Editar Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.scheduleButton]}
          onPress={() => navigation.navigate("HorariosCrud")}
        >
          <Icon name="time-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Mis Horarios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.servicesButton]}
          onPress={() => navigation.navigate("ServiciosCRUD")}
        >
          <Icon name="construct-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Mis Servicios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.productsButton]}
          onPress={() => navigation.navigate("ProductoCrud")}
        >
          <Icon name="cart-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Mis Productos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clientsButton]}
          onPress={() => navigation.navigate("GestionDeClientes")}
        >
          <Icon name="people-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Gestión de Clientes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.webButton]}
          onPress={handleOpenWeb}
        >
          <Icon name="globe-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Mi Web</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Icon name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    elevation: 2,
    alignItems: "center",
    margin: 20,
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
    color: "#333",
  },
  email: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  phone: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  address: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  buttonsContainer: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    width: "90%",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
  editButton: {
    backgroundColor: "#007bff", // Azul
  },
  scheduleButton: {
    backgroundColor: "#2196F3", // Azul Claro
  },
  servicesButton: {
    backgroundColor: "#28a745", // Verde
  },
  productsButton: {
    backgroundColor: "#ff9800", // Naranja
  },
  clientsButton: {
    backgroundColor: "#9c27b0", // Púrpura
  },
  webButton: {
    backgroundColor: "#17a2b8", // Azul Celeste
  },
  logoutButton: {
    backgroundColor: "#d9534f", // Rojo
  },
});

export default PanelPerfil;
