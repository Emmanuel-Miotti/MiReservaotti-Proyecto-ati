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
import { useNavigation } from '@react-navigation/native';

const MisCompras = () => {
  const { user } = useContext(UserContext);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    obtenerCompras();
  }, []);

  const obtenerCompras = async () => {
    try {
      const response = await axios.get(`${Config.url()}/cliente/${user.id}/compras`);
      if (Array.isArray(response.data.compras)) {
        setCompras(response.data.compras);
      } else {
        console.error("La respuesta de la API no es un arreglo:", response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener las compras:", error);
      setLoading(false);
    }
  };

  const defaultImage = "https://via.placeholder.com/150";

  if (loading) {
    return <Text style={styles.loadingText}>Cargando...</Text>;
  }
  const verEmpresa = (empresaId) => {
    navigation.navigate('VerEmpresa', { empresaId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Mis Compras</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={obtenerCompras}
        >
          <Icon name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {compras.length === 0 ? (
          <Text style={styles.noComprasText}>No has realizado compras.</Text>
        ) : (
          compras.map((compra) => (
            <View key={compra.id} style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Total: ${compra.total}</Text>
                <Text style={styles.cardInfo}>
                  Fecha: {new Date(compra.created_at).toLocaleDateString()}
                </Text>
                <Text style={styles.cardInfo}>
                  Empresa: {compra.empresa ? compra.empresa.name : "N/A"}
                </Text>
                <Text style={styles.cardInfo}>
                  Productos:
                  {compra.productos.map((producto) => (
                    <Text key={producto.id} style={styles.productoInfo}>
                      {"\n"}- {producto.nombre} (Cantidad: {producto.pivot.cantidad}) - Precio: ${producto.pivot.precio}
                    </Text>
                  ))}
                </Text>
                {compra.empresa && (
                  <TouchableOpacity
                    style={styles.empresaButton}
                    onPress={() => verEmpresa(compra.empresa.id )} 
                  >
                    <Text style={styles.empresaButtonText}>Ver empresa</Text>
                  </TouchableOpacity>
                  
                )}
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
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
  productoInfo: {
    fontSize: 14,
    color: "#7F8C8D",
    marginLeft: 10,
  },
  empresaButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#1a73e8",
    borderRadius: 5,
    alignItems: "center",
  },
  empresaButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  noComprasText: {
    fontSize: 16,
    color: "#95A5A6",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
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
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#7F8C8D',
  }
});

export default MisCompras;
