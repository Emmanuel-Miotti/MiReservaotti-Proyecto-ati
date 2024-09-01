import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import axios from "axios";
import Config from "../Config";
import moment from "moment";
import { UserContext } from "../../contexts/UserContext";

const ReservaPage = ({ route, navigation }) => {
  const { user } = useContext(UserContext);
  const { id } = route.params;
  const empresaId = id;

  const [paso, setPaso] = useState(1);
  const [cliente, setCliente] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });
  const [reserva, setReserva] = useState({
    observacion: "",
  });
  const [fechaHora, setFechaHora] = useState("");
  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [noAvailableTimes, setNoAvailableTimes] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      setCliente({
        nombre: user.name,
        email: user.email,
        telefono: user.cellphone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    obtenerServicios();
  }, []);

  const obtenerServicios = async () => {
    try {
      const response = await axios.get(
        `${Config.url()}/servicios/empresa/${empresaId}`
      );
      const serviciosActivos = response.data.filter(
        (servicio) => servicio.estado === "activo"
      );
      setServicios(serviciosActivos);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  const handleSeleccionarServicio = (servicioId) => {
    if (serviciosSeleccionados.includes(servicioId)) {
      setServiciosSeleccionados(
        serviciosSeleccionados.filter((id) => id !== servicioId)
      );
    } else {
      setServiciosSeleccionados([...serviciosSeleccionados, servicioId]);
    }
  };

  const handleClienteSubmit = () => {
    if (!cliente.nombre || !cliente.email || !cliente.telefono) {
      setErrorMessage("Por favor completa todos los campos");
      return;
    }
    setPaso(2);
  };

  const handleServiciosSubmit = () => {
    if (serviciosSeleccionados.length === 0) {
      setErrorMessage("Selecciona al menos un servicio");
      return;
    }
    setPaso(3);
  };

  const handleFechaHoraSubmit = () => {
    if (!selectedDate || !selectedTime) {
      setErrorMessage("Selecciona una fecha y hora");
      return;
    }
    setFechaHora(`${selectedDate} ${selectedTime}`);
    setPaso(4);
  };

  const handleConfirmacionSubmit = async () => {
    try {
      const reservaData = {
        cliente_id: user.id,
        agenda_id: empresaId,
        fecha: moment(selectedDate).format("YYYY-MM-DD"),
        hora: selectedTime,
        duracion: calcularDuracionTotal(serviciosSeleccionados),
        precio: parseFloat(calcularPrecioTotal(serviciosSeleccionados)),
        estado: "reservado",
        observaciones: reserva.observacion || "",
        servicios: serviciosSeleccionados,
      };

      const response = await axios.post(
        `${Config.url()}/reservas`,
        reservaData
      );
      if (response.status === 200 || response.status === 201) {
        Alert.alert("Reserva creada exitosamente");
        navigation.navigate("MisReservas");
      } else {
        throw new Error("Error en la creación de la reserva");
      }
    } catch (error) {
      console.error("Error al crear la reserva:", error);
      setErrorMessage(
        "Ocurrió un error al guardar la reserva. Por favor, inténtalo de nuevo."
      );
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setIsLoadingTimes(true);
    try {
      const response = await axios.post(
        `${Config.url()}/intervalos/empresa/horasdisponibles`,
        {
          agenda_id: empresaId,
          fecha: moment(date).format("YYYY-MM-DD"),
          duracion_servicios: calcularDuracionTotal(serviciosSeleccionados),
          intervalo_reserva: 15,
        }
      );
      setAvailableTimes(response.data.horas_disponibles);
      setNoAvailableTimes(response.data.horas_disponibles.length === 0);
      setIsLoadingTimes(false);
    } catch (error) {
      console.error("Error al obtener horas disponibles:", error);
      setIsLoadingTimes(false);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const calcularDuracionTotal = (serviciosSeleccionados) => {
    let duracionTotal = 30;
    return duracionTotal;
  };

  const calcularPrecioTotal = (serviciosSeleccionados) => {
    let precioTotal = 0;
    serviciosSeleccionados.forEach((servicioId) => {
      const servicio = servicios.find((serv) => serv.id === servicioId);
      if (servicio) {
        precioTotal += parseFloat(servicio.precio);
      }
    });
    return precioTotal.toFixed(2);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Reservación de Servicios</Text>
        {errorMessage !== "" && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}
        {paso === 1 && (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={cliente.nombre}
              onChangeText={(text) => setCliente({ ...cliente, nombre: text })}
              editable={true} // Editable to allow client to modify
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={cliente.email}
              onChangeText={(text) => setCliente({ ...cliente, email: text })}
              keyboardType="email-address"
              editable={true} // Editable to allow client to modify
            />
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              value={cliente.telefono}
              onChangeText={(text) =>
                setCliente({ ...cliente, telefono: text })
              }
              keyboardType="phone-pad"
              editable={true} // Editable to allow client to modify
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleClienteSubmit}
            >
              <Text style={styles.buttonText}>Siguiente</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
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
                  serviciosSeleccionados.includes(servicio.id) &&
                    styles.selectedCheckbox,
                ]}
              >
                <Text style={styles.checkboxText}>
                  {`${servicio.nombre} - ${servicio.descripcion}`}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.button}
              onPress={handleServiciosSubmit}
            >
              <Text style={styles.buttonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        )}
        {paso === 3 && (
          <View>
            <Text style={styles.subtitle}>Selecciona la Fecha y Hora</Text>
            <Calendar
              onDayPress={(day) => handleDateChange(day.dateString)}
              markedDates={{
                [selectedDate]: { selected: true, marked: true },
              }}
              minDate={moment().format("YYYY-MM-DD")}
              theme={{
                selectedDayBackgroundColor: "#43a047",
                todayTextColor: "#1a73e8",
                arrowColor: "#1a73e8",
              }}
            />
            <Text style={styles.subtitle}>Horas Disponibles</Text>
            {isLoadingTimes ? (
              <Text>Cargando horarios...</Text>
            ) : noAvailableTimes ? (
              <Text>No hay horarios disponibles para esta fecha</Text>
            ) : (
              <View style={styles.timesContainer}>
                {availableTimes.map((time) => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => handleTimeSelect(time)}
                    style={[
                      styles.timeButton,
                      selectedTime === time && styles.selectedTime,
                    ]}
                  >
                    <Text style={styles.timeButtonText}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={handleFechaHoraSubmit}
            >
              <Text style={styles.buttonText}>Siguiente</Text>
            </TouchableOpacity>
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
              <Text style={styles.label}>Fecha:</Text>{" "}
              {moment(selectedDate).format("dddd, DD [de] MMMM [de] YYYY")}
            </Text>
            <Text>
              <Text style={styles.label}>Hora:</Text> {selectedTime}
            </Text>
            <Text style={styles.label}>Servicios Seleccionados:</Text>
            <View>
              {serviciosSeleccionados.map((servicioId) => {
                const servicio = servicios.find(
                  (servicio) => servicio.id === servicioId
                );
                return servicio ? (
                  <Text key={servicio.id} style={styles.selectedService}>
                    - {servicio.nombre}
                  </Text>
                ) : null;
              })}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Observaciones"
              value={reserva.observacion}
              onChangeText={(text) =>
                setReserva({ ...reserva, observacion: text })
              }
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleConfirmacionSubmit}
            >
              <Text style={styles.buttonText}>Confirmar Reserva</Text>
            </TouchableOpacity>
          </View>
        )}
        {paso > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setPaso(paso - 1)}
          >
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1a73e8",
    textAlign: "center",
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  checkbox: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  selectedCheckbox: {
    backgroundColor: "#d1e7dd",
    borderColor: "#43a047",
  },
  checkboxText: {
    fontSize: 16,
    color: "#333",
  },
  timesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 8,
    width: "30%",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  selectedTime: {
    backgroundColor: "#d1e7dd",
    borderColor: "#43a047",
  },
  timeButtonText: {
    color: "#333",
    fontSize: 16,
  },
  label: {
    fontWeight: "bold",
    color: "#333",
  },
  selectedService: {
    fontSize: 16,
    color: "#555",
    marginBottom: 4,
  },
  button: {
    backgroundColor: "#1a73e8",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#e53935",
    marginTop: 10,
  },
  backButton: {
    marginTop: 20,
    backgroundColor: "#ccc",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    fontSize: 16,
    textAlign: "center",
  },
});

export default ReservaPage;


// import React, { useContext, useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import { Calendar } from "react-native-calendars";
// import axios from "axios";
// import Config from "../Config";
// import moment from "moment";
// import BotonCancelar from "../components/BotonCancelar";
// import { UserContext } from "../../contexts/UserContext";

// const ReservaPage = ({ route, navigation }) => {
//   const { user } = useContext(UserContext); // Usar el contexto para obtener los datos del usuario
//   const { id } = route.params;
//   const empresaId = id;

//   const [paso, setPaso] = useState(1);
//   const [cliente, setCliente] = useState({
//     nombre: "",
//     email: "",
//     telefono: "",
//   });
//   const [reserva, setReserva] = useState({
//     observacion: "",
//   });
//   const [fechaHora, setFechaHora] = useState("");
//   const [servicios, setServicios] = useState([]);
//   const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
//   const [selectedDate, setSelectedDate] = useState(
//     moment().format("YYYY-MM-DD")
//   );
//   const [selectedTime, setSelectedTime] = useState(null);
//   const [availableTimes, setAvailableTimes] = useState([]);
//   const [isLoadingTimes, setIsLoadingTimes] = useState(false);
//   const [noAvailableTimes, setNoAvailableTimes] = useState(false);
//   const [errorMessage, setErrorMessage] = useState(""); // Estado para manejar el mensaje de error

//   // Efecto para precargar los datos del cliente si el usuario está logeado
//   useEffect(() => {
//     if (user) {
//       setCliente({
//         nombre: user.name,
//         email: user.email,
//         telefono: user.cellphone || "",
//       });
//     }
//   }, [user]);

//   useEffect(() => {
//     obtenerServicios();
//   }, []);

//   const obtenerServicios = async () => {
//     try {
//       const response = await axios.get(
//         `${Config.url()}/servicios/empresa/${empresaId}`
//       );
//       const serviciosActivos = response.data.filter(
//         (servicio) => servicio.estado === "activo"
//       );
//       setServicios(serviciosActivos);
//     } catch (error) {
//       console.error("Error al cargar servicios:", error);
//     }
//   };

//   const handleSeleccionarServicio = (servicioId) => {
//     if (serviciosSeleccionados.includes(servicioId)) {
//       setServiciosSeleccionados(
//         serviciosSeleccionados.filter((id) => id !== servicioId)
//       );
//     } else {
//       setServiciosSeleccionados([...serviciosSeleccionados, servicioId]);
//     }
//   };

//   const handleClienteSubmit = () => {
//     if (!cliente.nombre || !cliente.email || !cliente.telefono) {
//       setErrorMessage("Por favor completa todos los campos");
//       return;
//     }
//     setPaso(2);
//   };

//   const handleServiciosSubmit = () => {
//     if (serviciosSeleccionados.length === 0) {
//       setErrorMessage("Selecciona al menos un servicio");
//       return;
//     }
//     setPaso(3);
//   };

//   const handleFechaHoraSubmit = () => {
//     if (!selectedDate || !selectedTime) {
//       setErrorMessage("Selecciona una fecha y hora");
//       return;
//     }
//     setFechaHora(`${selectedDate} ${selectedTime}`);
//     setPaso(4);
//   };

//   const handleConfirmacionSubmit = async () => {
//     try {
//       const reservaData = {
//         cliente_id: user.id,
//         agenda_id: empresaId,
//         fecha: moment(selectedDate).format("YYYY-MM-DD"),
//         hora: selectedTime,
//         duracion: calcularDuracionTotal(serviciosSeleccionados),
//         precio: parseFloat(calcularPrecioTotal(serviciosSeleccionados)),
//         estado: "reservado",
//         observaciones: reserva.observacion || "",
//         servicios: serviciosSeleccionados,
//       };

//       console.log("Datos de la reserva enviados:", reservaData);

//       const response = await axios.post(
//         `${Config.url()}/reservas`,
//         reservaData
//       );
//       navigation.navigate("ReservasPage");
//       if (response.status === 200 || response.status === 201) {
//         // Aquí puedes agregar un mensaje de éxito antes de la redirección
//         Alert.alert("Reserva creada exitosamente");
//         navigation.navigate("ReservasPage"); // Cambia "ReservasPage" al nombre correcto de la página de reservas
//       } else {
//         throw new Error("Error en la creación de la reserva");
//       }
//     } catch (error) {
//       console.error("Error al crear la reserva:", error);
//       setErrorMessage(
//         "Ocurrió un error al guardar la reserva. Por favor, inténtalo de nuevo."
//       );
//     }
//   };

//   const handleDateChange = async (date) => {
//     setSelectedDate(date);
//     setSelectedTime(null);
//     setIsLoadingTimes(true);
//     try {
//       const response = await axios.post(
//         `${Config.url()}/intervalos/empresa/horasdisponibles`,
//         {
//           agenda_id: empresaId,
//           fecha: moment(date).format("YYYY-MM-DD"),
//           duracion_servicios: calcularDuracionTotal(serviciosSeleccionados),
//           intervalo_reserva: 30,
//         }
//       );
//       setAvailableTimes(response.data.horas_disponibles);
//       setNoAvailableTimes(response.data.horas_disponibles.length === 0);
//       setIsLoadingTimes(false);
//     } catch (error) {
//       console.error("Error al obtener horas disponibles:", error);
//       setIsLoadingTimes(false);
//     }
//   };

//   const handleTimeSelect = (time) => {
//     setSelectedTime(time);
//   };

//   const calcularDuracionTotal = (serviciosSeleccionados) => {
//     let duracionTotal = 30;
//     return duracionTotal;
//   };

//   const calcularPrecioTotal = (serviciosSeleccionados) => {
//     let precioTotal = 0;
//     serviciosSeleccionados.forEach((servicioId) => {
//       const servicio = servicios.find((serv) => serv.id === servicioId);
//       if (servicio) {
//         precioTotal += parseFloat(servicio.precio); // Asegúrate de que sea un número
//       }
//     });
//     return precioTotal.toFixed(2); // Mantén dos decimales si es necesario
//   };

//   const handleCancel = () => {
//     navigation.goBack();
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <Text style={styles.title}>Reservación de Servicios</Text>
//         {errorMessage !== "" && (
//           <Text style={styles.errorText}>{errorMessage}</Text>
//         )}
//         {paso === 1 && (
//           <View>
//             <TextInput
//               style={styles.input}
//               placeholder="Nombre"
//               value={cliente.nombre}
//               onChangeText={(text) => setCliente({ ...cliente, nombre: text })}
//               editable={!user} // Evita editar el nombre si el usuario está logeado
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Email"
//               value={cliente.email}
//               onChangeText={(text) => setCliente({ ...cliente, email: text })}
//               keyboardType="email-address"
//               editable={!user} // Evita editar el email si el usuario está logeado
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Teléfono"
//               value={cliente.telefono}
//               onChangeText={(text) =>
//                 setCliente({ ...cliente, telefono: text })
//               }
//               keyboardType="phone-pad"
//               editable={!user} // Evita editar el teléfono si el usuario está logeado
//             />
//             <Button title="Siguiente" onPress={handleClienteSubmit} />
//             <Button
//               title="Cancelar"
//               onPress={handleCancel}
//               style={styles.button}
//             />
//           </View>
//         )}
//         {paso === 2 && (
//           <View>
//             <Text style={styles.subtitle}>Selecciona tus servicios</Text>
//             {servicios.map((servicio) => (
//               <TouchableOpacity
//                 key={servicio.id}
//                 onPress={() => handleSeleccionarServicio(servicio.id)}
//                 style={[
//                   styles.checkbox,
//                   serviciosSeleccionados.includes(servicio.id) &&
//                     styles.selectedCheckbox,
//                 ]}
//               >
//                 <Text>{`${servicio.nombre} - ${servicio.descripcion}`}</Text>
//               </TouchableOpacity>
//             ))}
//             <Button title="Siguiente" onPress={handleServiciosSubmit} />
//           </View>
//         )}
//         {paso === 3 && (
//           <View>
//             <Text style={styles.subtitle}>Selecciona la Fecha y Hora</Text>
//             <Calendar
//               onDayPress={(day) => handleDateChange(day.dateString)}
//               markedDates={{
//                 [selectedDate]: { selected: true, marked: true },
//               }}
//               minDate={moment().format("YYYY-MM-DD")}
//             />
//             <Text style={styles.subtitle}>Horas Disponibles</Text>
//             {isLoadingTimes ? (
//               <Text>Cargando horarios...</Text>
//             ) : noAvailableTimes ? (
//               <Text>No hay horarios disponibles para esta fecha</Text>
//             ) : (
//               <View style={styles.timesContainer}>
//                 {availableTimes.map((time) => (
//                   <TouchableOpacity
//                     key={time}
//                     onPress={() => handleTimeSelect(time)}
//                     style={[
//                       styles.timeButton,
//                       selectedTime === time && styles.selectedTime,
//                     ]}
//                   >
//                     <Text>{time}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             )}
//             <Button title="Siguiente" onPress={handleFechaHoraSubmit} />
//           </View>
//         )}
//         {paso === 4 && (
//           <View>
//             <Text style={styles.subtitle}>Confirmación de Reserva</Text>
//             <Text>
//               <Text style={styles.label}>Cliente:</Text> {cliente.nombre}
//             </Text>
//             <Text>
//               <Text style={styles.label}>Email:</Text> {cliente.email}
//             </Text>
//             <Text>
//               <Text style={styles.label}>Teléfono:</Text> {cliente.telefono}
//             </Text>
//             <Text>
//               <Text style={styles.label}>Fecha:</Text>{" "}
//               {moment(selectedDate).format("dddd, DD [de] MMMM [de] YYYY")}
//             </Text>
//             <Text>
//               <Text style={styles.label}>Hora:</Text> {selectedTime}
//             </Text>
//             <Text>
//               <Text style={styles.label}>Servicios Seleccionados:</Text>
//             </Text>
//             <View>
//               {serviciosSeleccionados.map((servicioId) => {
//                 const servicio = servicios.find(
//                   (servicio) => servicio.id === servicioId
//                 );
//                 return servicio ? (
//                   <Text key={servicio.id}>- {servicio.nombre}</Text>
//                 ) : null;
//               })}
//             </View>
//             <TextInput
//               style={styles.input}
//               placeholder="Observaciones"
//               value={reserva.observacion}
//               onChangeText={(text) =>
//                 setReserva({ ...reserva, observacion: text })
//               }
//             />
//             <Button
//               title="Confirmar Reserva"
//               onPress={handleConfirmacionSubmit}
//             />
//           </View>
//         )}
//         {paso > 1 && (
//           <Button title="Volver" onPress={() => setPaso(paso - 1)} />
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollContainer: {
//     padding: 16,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 16,
//   },
//   subtitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 8,
//     marginBottom: 16,
//   },
//   checkbox: {
//     padding: 8,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     marginBottom: 8,
//   },
//   selectedCheckbox: {
//     backgroundColor: "#d3d3d3",
//   },
//   timesContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "space-between",
//   },
//   timeButton: {
//     padding: 8,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     marginBottom: 8,
//     width: "30%",
//     alignItems: "center",
//   },
//   selectedTime: {
//     backgroundColor: "#d3d3d3",
//   },
//   label: {
//     fontWeight: "bold",
//   },
//   button: {
//     marginTop: 20,
//     backgroundColor: "#007bff",
//     borderRadius: 25,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//   },
//   errorText: {
//     color: "red",
//     marginBottom: 16,
//   },
// });

// export default ReservaPage;
