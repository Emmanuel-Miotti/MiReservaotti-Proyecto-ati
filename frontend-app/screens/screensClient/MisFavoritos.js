import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { UserContext } from "../../contexts/UserContext";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import Config from "../Config";

const Favoritos = () => {
  const { user } = useContext(UserContext);
  const [favoritos, setFavoritos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    obtenerFavoritos();
  }, []);

  const obtenerFavoritos = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(`${Config.url()}/favoritos/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // console.log(response.data.data);
      setFavoritos(response.data.data);
    } catch (error) {
      console.error("Error al obtener los favoritos:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const verEmpresa = (empresaId) => {
    navigation.navigate("VerEmpresa", { empresaId });
  };

  const eliminarFavorito = async (id) => {
    try {
      await axios.delete(`${Config.url()}/favoritos/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      obtenerFavoritos();
    } catch (error) {
      console.error("Error al eliminar de favoritos:", error);
    }
  };

  const renderFavorito = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{
          uri: item.empresa.profile_picture
            ? `${Config.urlFoto()}${item.empresa.profile_picture}`
            : "https://via.placeholder.com/150",
        }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{item.empresa.name}</Text>
        <Text style={styles.text}>{item.empresa.address}</Text>
        <Text style={styles.text}>{item.empresa.cellphone}</Text>
        <Text style={styles.text}>{item.empresa.email}</Text>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => verEmpresa(item.empresa.id)}
          >
            <Text style={styles.buttonText}>Ver Empresa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => eliminarFavorito(item.id)}
          >
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Mis Empresas Favoritas</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={obtenerFavoritos}
        >
          <Icon name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {favoritos.length > 0 ? (
        <FlatList
          data={favoritos}
          renderItem={renderFavorito}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={obtenerFavoritos}
            />
          }
        />
      ) : (
        <Text style={styles.emptyMessage}>No tienes empresas favoritas.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f3f4",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a73e8",
  },
  refreshButton: {
    backgroundColor: "#1a73e8",
    padding: 8,
    borderRadius: 50,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  text: {
    fontSize: 16,
    color: "#555",
  },
  buttons: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "space-between",
  },
  viewButton: {
    backgroundColor: "#1a73e8",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#e53935",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyMessage: {
    textAlign: "center",
    fontSize: 18,
    color: "#888",
    marginTop: 32,
    fontStyle: "italic",
  },
});

export default Favoritos;
