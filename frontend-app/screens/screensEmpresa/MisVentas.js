import React, { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import axios from "axios";
import Config from "../Config"; 
import { UserContext } from "../../contexts/UserContext";

const ListaVentas = () => {
  const { user } = useContext(UserContext);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      const response = await axios.get(`${Config.url()}/empresa/${user.id}/ventas`);
      setVentas(response.data.ventas);
    } catch (error) {
      console.error("Error al obtener las ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!Array.isArray(ventas) || ventas.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noVentasText}>Todavía no se han realizado ventas</Text>
      </View>
    );
  }

  const renderVenta = ({ item }) => {
    let totalFormatted;
    try {
      totalFormatted = `$${Number(item.total).toFixed(2)}`;
    } catch (error) {
      totalFormatted = "$0.00"; // Valor por defecto en caso de error
    }

    return (
      <View style={styles.ventaContainer}>
        <Text style={styles.ventaTitle}>Cliente: {item.cliente ? item.cliente.name : "N/A"}</Text>
        <Text style={styles.ventaText}>Total: <Text style={styles.totalText}>{totalFormatted}</Text></Text>
        <Text style={styles.ventaText}>Fecha: {new Date(item.created_at).toLocaleDateString()}</Text>
        <Text style={styles.detallesText}>Detalles de la compra:</Text>
        <View style={styles.detallesContainer}>
          {item.productos.map((producto) => {
            // Verifica si el precio es un número y si no, lo convierte
            const precio = parseFloat(producto.pivot.precio) || 0;
            return (
              <Text key={producto.id} style={styles.productoText}>
                {producto.nombre} - Cantidad: {producto.pivot.cantidad} - Precio: ${precio.toFixed(2)}
              </Text>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus ventas</Text>
      <FlatList
        data={ventas}
        renderItem={renderVenta}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noVentasText: {
    textAlign: "center",
    fontSize: 18,
    color: "#888",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  ventaContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  ventaTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  ventaText: {
    fontSize: 16,
    marginBottom: 5,
  },
  totalText: {
    fontSize: 16,
    color: "#000",
  },
  detallesText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  detallesContainer: {
    marginLeft: 10,
    marginTop: 5,
  },
  productoText: {
    fontSize: 14,
  },
});

export default ListaVentas;
