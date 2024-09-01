import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';

const MisReservas = () => {
  const { user } = useContext(UserContext);
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    obtenerReservas();
  }, []);

  const obtenerReservas = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/v1/reservas`, {
        params: {
          user_id: user.id
        }
      });
      console.log('Reservas:', response.data); // Verifica los datos recibidos
      setReservas(response.data.data); // Accede al array de reservas correctamente
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    }
  };

  const defaultImage = "https://via.placeholder.com/150";

  return (
    <View style={styles.container}>
      <Text style={styles.bienvenido}>Mis Reservas</Text>
      <ScrollView>
        {reservas.length === 0 ? (
          <Text style={styles.noReservasText}>No tienes reservas disponibles.</Text>
        ) : (
          reservas.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image
                source={{ uri: item.image || defaultImage }}
                style={styles.image}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardCategory}>
                  Fecha: {new Date(item.fecha_reserva).toLocaleDateString()}
                </Text>
                <Text style={styles.cardCategory}>
                  Hora: {new Date(item.fecha_reserva).toLocaleTimeString()}
                </Text>
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
    backgroundColor: '#f8f9fa', // Fondo claro para una mejor estética
  },
  bienvenido: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333', // Texto oscuro para contraste
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row', // Colocar imagen y texto en una fila
    alignItems: 'center', // Alinear contenido de la tarjeta verticalmente
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50, // Hacer la imagen redonda
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  cardCategory: {
    fontSize: 16,
    color: '#777',
  },
  noReservasText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
});

export default MisReservas;
