import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import { UserContext } from "../../contexts/UserContext";
import { Calendar } from 'react-native-calendars';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const ReservaForm = () => {
  const user = useContext(UserContext).user;

  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [duracion, setDuracion] = useState(30); // Duración por defecto en minutos
  const [servicios, setServicios] = useState([]);
  const [error, setError] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  useEffect(() => {
    obtenerServicios();
  }, []);

  const obtenerServicios = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/v1/servicios/empresa/${user.id}`);
      setServicios(response.data);
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      setError('Error al cargar servicios. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  const handleSubmit = async () => {
    // Validar si se ha seleccionado fecha, hora y al menos un servicio
    if (!fecha || !hora || servicios.length === 0) {
      setError('Debe seleccionar fecha, hora y al menos un servicio.');
      return;
    }

    try {
      // Crear la reserva en la API
      await axios.post('http://127.0.0.1:8000/api/v1/reservas', {
        cliente_id: 1,
        agenda_id: 1,
        fecha,
        hora,
        duracion,
        precio: calcularPrecio(),
        estado: 'reservado',
        observaciones: '',
        fecha_reserva: new Date(),
        servicios: servicios.map(servicio => servicio.id)
      });

      // Reiniciar estado y mostrar mensaje de éxito
      setFecha('');
      setHora('');
      setDuracion(30);
      setServicios([]);
      setError('');
      Alert.alert('¡Reserva realizada con éxito!');
    } catch (error) {
      console.error('Error al hacer la reserva:', error);
      setError('Error al hacer la reserva. Por favor, inténtalo de nuevo más tarde.');
    }
  };

  const calcularPrecio = () => {
    return servicios.reduce((total, servicio) => total + servicio.precio, 0);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = date => {
    setFecha(date.toISOString().split('T')[0]);
    hideDatePicker();
  };

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleTimeConfirm = time => {
    setHora(time.toLocaleTimeString('en-US', { hour12: false }));
    hideTimePicker();
  };

  const toggleServicio = servicioId => {
    const servicioIndex = servicios.findIndex(servicio => servicio.id === servicioId);
    if (servicioIndex !== -1) {
      setServicios(servicios.filter(servicio => servicio.id !== servicioId));
    } else {
      const servicio = servicios.find(servicio => servicio.id === servicioId);
      setServicios([...servicios, servicio]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Formulario de Reserva</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <View style={styles.formGroup}>
        <Text>Fecha:</Text>
        <TouchableOpacity style={styles.button} onPress={showDatePicker}>
          <Text style={styles.buttonText}>Seleccionar Fecha</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={hideDatePicker}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text>Hora:</Text>
        <TouchableOpacity style={styles.button} onPress={showTimePicker}>
          <Text style={styles.buttonText}>Seleccionar Hora</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleTimeConfirm}
          onCancel={hideTimePicker}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text>Servicios:</Text>
        {servicios.map(servicio => (
          <TouchableOpacity
            key={servicio.id}
            style={[styles.servicioItem, servicios.includes(servicio) ? styles.servicioSelected : null]}
            onPress={() => toggleServicio(servicio.id)}
          >
            <Text style={styles.servicioText}>{`${servicio.nombre} - ${servicio.descripcion} - $${servicio.precio}`}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Button title="Realizar Reserva" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
    width: '100%',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#0099ff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  servicioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  servicioSelected: {
    backgroundColor: '#e6f7ff',
    borderColor: '#0099ff',
  },
  servicioText: {
    flex: 1,
    marginLeft: 10,
  },
});

export default ReservaForm;