import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import axios from "axios";
import Config from "../Config";
import moment from "moment";

const availableTimes = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const occupiedTimes = ["10:00 AM", "01:00 PM", "03:00 PM"];

const ReservaPage = ({ route }) => {
  const { id } = route.params;
  const empresaId = id; // ID de la empresa, ajusta según tu lógica para obtener este ID

  const [paso, setPaso] = useState(1);
  const [cliente, setCliente] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });
  const [fecha, setFecha] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [eventos, setEventos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    obtenerServicios();
  }, []);

  const obtenerServicios = async () => {
    try {
    //   const response = await Config.getServicesByEmpresa(empresaId);
    const response = await axios.get(`http://127.0.0.1:8000/api/v1/servicios/empresa/1`);
      // setServicios(response.data);
      //Guarda solo los servicios activos
      const serviciosActivos = response.data.filter(servicio => servicio.estado === 'activo');
      setServicios(serviciosActivos);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  const handleSeleccionarServicio = (servicioId) => {
    if (serviciosSeleccionados.includes(servicioId)) {
      setServiciosSeleccionados(serviciosSeleccionados.filter((id) => id !== servicioId));
    } else {
      setServiciosSeleccionados([...serviciosSeleccionados, servicioId]);
    }
  };

  const handleClienteSubmit = () => {
    if (!cliente.nombre || !cliente.email || !cliente.telefono) {
      Alert.alert("Por favor completa todos los campos");
      return;
    }
    setPaso(2);
  };

  const handleServiciosSubmit = () => {
    if (serviciosSeleccionados.length === 0) {
      Alert.alert("Selecciona al menos un servicio");
      return;
    }
    setPaso(3);
  };

  const handleFechaHoraSubmit = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert("Selecciona una fecha y hora");
      return;
    }
    setFechaHora(`${selectedDate} ${selectedTime}`);
    setPaso(4);
  };

  const handleConfirmacionSubmit = () => {
    Alert.alert("Reserva confirmada!");
    // Aquí puedes manejar el envío de la reserva al backend
  };

  const calcularDuracionTotal = () => {
    let duracionTotal = 0;
    serviciosSeleccionados.forEach((servicioId) => {
      const servicio = servicios.find((servicio) => servicio.id === servicioId);
      if (servicio) {
        duracionTotal += servicio.duracion;
      }
    });
    return duracionTotal;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Reservación de Servicios</Text>
      {paso === 1 && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={cliente.nombre}
            onChangeText={(text) => setCliente({ ...cliente, nombre: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={cliente.email}
            onChangeText={(text) => setCliente({ ...cliente, email: text })}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            value={cliente.telefono}
            onChangeText={(text) => setCliente({ ...cliente, telefono: text })}
            keyboardType="phone-pad"
          />
          <Button title="Siguiente" onPress={handleClienteSubmit} />
        </View>
      )}
      {paso === 2 && (
        <View>
          <Text style={styles.subtitle}>Selecciona tus servicios</Text>
          {servicios.map((servicio) => (
            <TouchableOpacity
              key={servicio.id}
              onPress={() => handleSeleccionarServicio(servicio.id)}
              style={[
                styles.checkbox,
                serviciosSeleccionados.includes(servicio.id) && styles.selectedCheckbox,
              ]}
            >
              <Text>{`${servicio.nombre} - ${servicio.descripcion}`}</Text>
            </TouchableOpacity>
          ))}
          <Button title="Siguiente" onPress={handleServiciosSubmit} />
        </View>
      )}
      {paso === 3 && (
        <View>
          <Text style={styles.subtitle}>Selecciona la Fecha y Hora</Text>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: { selected: true, marked: true },
            }}
            minDate={moment().format("YYYY-MM-DD")}
          />
          <Text style={styles.subtitle}>Horas Disponibles</Text>
          <View style={styles.timesContainer}>
            {availableTimes.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => !occupiedTimes.includes(time) && setSelectedTime(time)}
                style={[
                  styles.timeButton,
                  occupiedTimes.includes(time) && styles.occupiedTime,
                  selectedTime === time && styles.selectedTime,
                ]}
                disabled={occupiedTimes.includes(time)}
              >
                <Text>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button title="Siguiente" onPress={handleFechaHoraSubmit} />
        </View>
      )}
      {paso === 4 && (
        <View>
          <Text style={styles.subtitle}>Confirmación de Reserva</Text>
          <Text>
            <Text style={styles.label}>Cliente:</Text> {cliente.nombre}
          </Text>
          <Text>
            <Text style={styles.label}>Email:</Text> {cliente.email}
          </Text>
          <Text>
            <Text style={styles.label}>Teléfono:</Text> {cliente.telefono}
          </Text>
          <Text>
            <Text style={styles.label}>Servicios Seleccionados:</Text>
          </Text>
          <View>
            {serviciosSeleccionados.map((servicioId) => {
              const servicio = servicios.find((servicio) => servicio.id === servicioId);
              return servicio ? <Text key={servicio.id}>- {servicio.nombre}</Text> : null;
            })}
          </View>
          <Text>
            <Text style={styles.label}>Fecha y Hora:</Text> {moment(fechaHora).format("LLLL")}
          </Text>
          <Button title="Confirmar Reserva" onPress={handleConfirmacionSubmit} />
        </View>
      )}
      {paso > 1 && (
        <Button title="Volver" onPress={() => setPaso(paso - 1)} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 16,
  },
  checkbox: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 8,
  },
  selectedCheckbox: {
    backgroundColor: "#d3d3d3",
  },
  timesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 8,
    width: "30%",
    alignItems: "center",
  },
  occupiedTime: {
    backgroundColor: "#ccc",
  },
  selectedTime: {
    backgroundColor: "#d3d3d3",
  },
  label: {
    fontWeight: "bold",
  },
});

export default ReservaPage;
