import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import axios from "axios";
import Config from "../Config";
import moment from "moment";
import { UserContext } from "../../contexts/UserContext";
import { Picker } from '@react-native-picker/picker';

const ListaEsperaPage = ({ route, navigation }) => {
  const { user } = useContext(UserContext);
  const { empresaId } = route.params;

  const [selectedDates, setSelectedDates] = useState({});
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleDateChange = (day) => {
    let newMarkedDates = { ...selectedDates };

    if (!startDate || endDate) {
      // Nueva selección o reiniciar la selección
      setStartDate(day.dateString);
      setEndDate(null);
      newMarkedDates = {
        [day.dateString]: {
          selected: true,
          startingDay: true,
          color: "#70d7c7",
          textColor: "white",
        },
      };
    } else {
      const newEndDate = day.dateString;
      const range = getDatesInRange(startDate, newEndDate);

      range.forEach((date, index) => {
        newMarkedDates[date] = {
          selected: true,
          color: "#70d7c7",
          textColor: "white",
          startingDay: index === 0,
          endingDay: index === range.length - 1,
        };
      });

      setEndDate(newEndDate);
    }

    setSelectedDates(newMarkedDates);
  };

  const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = moment(startDate);

    while (currentDate.isSameOrBefore(endDate)) {
      dates.push(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "days");
    }

    return dates;
  };

  const generateTimeSlots = () => {
    const times = [];
    let currentTime = moment().startOf('day');

    while (currentTime < moment().endOf('day')) {
      times.push(currentTime.format("HH:mm"));
      currentTime.add(15, 'minutes');
    }

    return times;
  };

  const handleSubmit = async () => {
    if (!horaInicio || !horaFin) {
      setErrorMessage("Debes seleccionar un rango de horas.");
      return;
    }

    try {
      const data = {
        cliente_id: user.id,
        agenda_id: empresaId,
        fecha_inicio: startDate,
        fecha_fin: endDate || startDate,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
      };

      const response = await axios.post(`${Config.url()}/lista-espera`, data);
      setSuccessMessage("Te has inscrito en la lista de espera con éxito, te notificaremos cuando se libere un lugar.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Error al inscribirse en la lista de espera."
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Lista de Espera</Text>
        {successMessage ? (
          <>
            <Text style={styles.successText}>{successMessage}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("HomeClienteScreen")}
            >
              <Text style={styles.buttonText}>Volver al Inicio</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            <Calendar
              onDayPress={handleDateChange}
              markingType={"period"}
              markedDates={selectedDates}
              minDate={moment().format("YYYY-MM-DD")}
            />

            <Text style={styles.label}>Hora Inicio</Text>
            <Picker
              selectedValue={horaInicio}
              style={styles.picker}
              onValueChange={(itemValue) => setHoraInicio(itemValue)}
            >
              <Picker.Item label="Selecciona una hora" value="" />
              {generateTimeSlots().map((time) => (
                <Picker.Item key={time} label={time} value={time} />
              ))}
            </Picker>

            <Text style={styles.label}>Hora Fin</Text>
            <Picker
              selectedValue={horaFin}
              style={styles.picker}
              onValueChange={(itemValue) => setHoraFin(itemValue)}
            >
              <Picker.Item label="Selecciona una hora" value="" />
              {generateTimeSlots().map((time) => (
                <Picker.Item key={time} label={time} value={time} />
              ))}
            </Picker>

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Unirse</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  picker: {
    height: 50,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#1a73e8",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  successText: {
    color: "green",
    marginBottom: 16,
    textAlign: "center",
  },
});

export default ListaEsperaPage;



// import React, { useState, useContext } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { Calendar } from "react-native-calendars";
// import axios from "axios";
// import Config from "../Config";
// import moment from "moment";
// import { UserContext } from "../../contexts/UserContext";

// const ListaEsperaPage = ({ route, navigation }) => {
//   const { user } = useContext(UserContext);
//   const { empresaId } = route.params;

//   const [selectedDates, setSelectedDates] = useState({});
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [horaInicio, setHoraInicio] = useState("");
//   const [horaFin, setHoraFin] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");

//   const handleDateChange = (day) => {
//     let newMarkedDates = { ...selectedDates };

//     if (!startDate || endDate) {
//       setStartDate(day.dateString);
//       setEndDate(null);
//       newMarkedDates = {
//         [day.dateString]: {
//           selected: true,
//           startingDay: true,
//           color: "#70d7c7",
//           textColor: "white",
//         },
//       };
//     } else {
//       const newEndDate = day.dateString;
//       const range = getDatesInRange(startDate, newEndDate);

//       range.forEach((date, index) => {
//         newMarkedDates[date] = {
//           selected: true,
//           color: "#70d7c7",
//           textColor: "white",
//           startingDay: index === 0,
//           endingDay: index === range.length - 1,
//         };
//       });

//       setEndDate(newEndDate);
//     }

//     setSelectedDates(newMarkedDates);
//   };

//   const getDatesInRange = (startDate, endDate) => {
//     const dates = [];
//     let currentDate = moment(startDate);

//     while (currentDate.isSameOrBefore(endDate)) {
//       dates.push(currentDate.format("YYYY-MM-DD"));
//       currentDate = currentDate.add(1, "days");
//     }

//     return dates;
//   };

//   const handleSubmit = async () => {
//     if (!horaInicio || !horaFin) {
//       setErrorMessage("Debes seleccionar un rango de horas.");
//       return;
//     }

//     try {
//       const data = {
//         cliente_id: user.id,
//         agenda_id: empresaId,
//         fecha_inicio: startDate,
//         fecha_fin: endDate || startDate,
//         hora_inicio: horaInicio,
//         hora_fin: horaFin,
//       };

//       const response = await axios.post(`${Config.url()}/lista-espera`, data);
//       setSuccessMessage("Te has inscrito en la lista de espera con éxito, te notificaremos cuando se libere un lugar.");
//       setErrorMessage("");
//     } catch (error) {
//       setErrorMessage(
//         error.response?.data?.message ||
//           "Error al inscribirse en la lista de espera."
//       );
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <Text style={styles.title}>Lista de Espera</Text>
//         {successMessage ? (
//           <>
//             <Text style={styles.successText}>{successMessage}</Text>
//             <TouchableOpacity
//               style={styles.button}
//               onPress={() => navigation.navigate("HomeClienteScreen")}
//             >
//               <Text style={styles.buttonText}>Volver al Inicio</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <>
//             {errorMessage ? (
//               <Text style={styles.errorText}>{errorMessage}</Text>
//             ) : null}
//             <Calendar
//               onDayPress={handleDateChange}
//               markingType={"period"}
//               markedDates={selectedDates}
//               minDate={moment().format("YYYY-MM-DD")}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Hora Inicio (HH:MM)"
//               value={horaInicio}
//               onChangeText={setHoraInicio}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Hora Fin (HH:MM)"
//               value={horaFin}
//               onChangeText={setHoraFin}
//             />
//             <TouchableOpacity style={styles.button} onPress={handleSubmit}>
//               <Text style={styles.buttonText}>Unirse</Text>
//             </TouchableOpacity>
//           </>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: "#f5f5f5",
//   },
//   scrollContainer: {
//     padding: 16,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: "bold",
//     color: "#1a73e8",
//     textAlign: "center",
//     marginBottom: 24,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 16,
//     backgroundColor: "#fff",
//   },
//   button: {
//     backgroundColor: "#1a73e8",
//     borderRadius: 25,
//     paddingVertical: 15,
//     alignItems: "center",
//     marginTop: 20,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   errorText: {
//     color: "red",
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   successText: {
//     color: "green",
//     marginBottom: 16,
//     textAlign: "center",
//   },
// });

// export default ListaEsperaPage;




// // import React, { useState, useContext } from "react";
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   TouchableOpacity,
// //   StyleSheet,
// //   ScrollView,
// // } from "react-native";
// // import { Calendar } from "react-native-calendars";
// // import axios from "axios";
// // import Config from "../Config";
// // import moment from "moment";
// // import { UserContext } from "../../contexts/UserContext";

// // const ListaEsperaPage = ({ route, navigation }) => {
// //   const { user } = useContext(UserContext);
// //   const { empresaId } = route.params;

// //   const [selectedDates, setSelectedDates] = useState({});
// //   const [startDate, setStartDate] = useState(null);
// //   const [endDate, setEndDate] = useState(null);
// //   const [horaInicio, setHoraInicio] = useState("");
// //   const [horaFin, setHoraFin] = useState("");
// //   const [errorMessage, setErrorMessage] = useState("");
// //   const [successMessage, setSuccessMessage] = useState("");

// //   const handleDateChange = (day) => {
// //     let newMarkedDates = { ...selectedDates };

// //     if (!startDate || endDate) {
// //       // Nueva selección o reiniciar la selección
// //       setStartDate(day.dateString);
// //       setEndDate(null);
// //       newMarkedDates = {
// //         [day.dateString]: {
// //           selected: true,
// //           startingDay: true,
// //           color: "#70d7c7",
// //           textColor: "white",
// //         },
// //       };
// //     } else {
// //       // Continuar seleccionando el rango
// //       const newEndDate = day.dateString;

// //       const range = getDatesInRange(startDate, newEndDate);

// //       range.forEach((date, index) => {
// //         newMarkedDates[date] = {
// //           selected: true,
// //           color: "#70d7c7",
// //           textColor: "white",
// //           startingDay: index === 0,
// //           endingDay: index === range.length - 1,
// //         };
// //       });

// //       setEndDate(newEndDate);
// //     }

// //     setSelectedDates(newMarkedDates);
// //   };

// //   const getDatesInRange = (startDate, endDate) => {
// //     const dates = [];
// //     let currentDate = moment(startDate);

// //     while (currentDate.isSameOrBefore(endDate)) {
// //       dates.push(currentDate.format("YYYY-MM-DD"));
// //       currentDate = currentDate.add(1, "days");
// //     }

// //     return dates;
// //   };

// //   const handleSubmit = async () => {
// //     if (!horaInicio || !horaFin) {
// //       setErrorMessage("Debes seleccionar un rango de horas.");
// //       return;
// //     }

// //     try {
// //       const data = {
// //         cliente_id: user.id,
// //         agenda_id: empresaId,
// //         fecha_inicio: startDate,
// //         fecha_fin: endDate || startDate,
// //         hora_inicio: horaInicio,
// //         hora_fin: horaFin,
// //       };

// //       const response = await axios.post(`${Config.url()}/lista-espera`, data);
// //       setSuccessMessage(response.data.message);
// //       setErrorMessage("");
// //     } catch (error) {
// //       setErrorMessage(
// //         error.response?.data?.message ||
// //           "Error al inscribirse en la lista de espera."
// //       );
// //     }
// //   };

// //   return (
// //     <View style={styles.container}>
// //     <ScrollView contentContainerStyle={styles.scrollContainer}>
// //       <Text style={styles.title}>Únete a la Lista de Espera</Text>
// //       {successMessage ? (
// //         <Text style={styles.successText}>{successMessage}</Text>
// //       ) : errorMessage ? (
// //         <Text style={styles.errorText}>{errorMessage}</Text>
// //       ) : null}
// //       <Calendar
// //         onDayPress={handleDateChange}
// //         markingType={"period"}
// //         markedDates={selectedDates}
// //         minDate={moment().format("YYYY-MM-DD")}
// //       />
// //       <TextInput
// //         style={styles.input}
// //         placeholder="Hora Inicio (HH:MM)"
// //         value={horaInicio}
// //         onChangeText={setHoraInicio}
// //       />
// //       <TextInput
// //         style={styles.input}
// //         placeholder="Hora Fin (HH:MM)"
// //         value={horaFin}
// //         onChangeText={setHoraFin}
// //       />
// //       <TouchableOpacity style={styles.button} onPress={handleSubmit}>
// //         <Text style={styles.buttonText}>Unirse</Text>
// //       </TouchableOpacity>
// //       </ScrollView>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     padding: 16,
// //     backgroundColor: "#f5f5f5",
// //   },
// //   title: {
// //     fontSize: 26,
// //     fontWeight: "bold",
// //     color: "#1a73e8",
// //     textAlign: "center",
// //     marginBottom: 24,
// //   },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //     padding: 12,
// //     borderRadius: 10,
// //     marginBottom: 16,
// //     backgroundColor: "#fff",
// //   },
// //   button: {
// //     backgroundColor: "#1a73e8",
// //     borderRadius: 25,
// //     paddingVertical: 15,
// //     alignItems: "center",
// //     marginTop: 20,
// //   },
// //   buttonText: {
// //     color: "#fff",
// //     fontSize: 16,
// //     fontWeight: "bold",
// //   },
// //   errorText: {
// //     color: "red",
// //     marginBottom: 16,
// //     textAlign: "center",
// //   },
// //   successText: {
// //     color: "green",
// //     marginBottom: 16,
// //     textAlign: "center",
// //   },
// // });

// // export default ListaEsperaPage;



// // // import React, { useState, useContext } from "react";
// // // import {
// // //   View,
// // //   Text,
// // //   TextInput,
// // //   TouchableOpacity,
// // //   StyleSheet,
// // //   ScrollView,
// // // } from "react-native";
// // // import { Calendar } from "react-native-calendars";
// // // import axios from "axios";
// // // import Config from "../Config";
// // // import moment from "moment";
// // // import { UserContext } from "../../contexts/UserContext";

// // // const ListaEsperaPage = ({ route, navigation }) => {
// // //   const { user } = useContext(UserContext);
// // //   const { empresaId } = route.params;

// // //   const [selectedDates, setSelectedDates] = useState({});
// // //   const [horaInicio, setHoraInicio] = useState("");
// // //   const [horaFin, setHoraFin] = useState("");
// // //   const [errorMessage, setErrorMessage] = useState("");
// // //   const [successMessage, setSuccessMessage] = useState("");

// // //   const handleDateChange = (day) => {
// // //     let markedDates = { ...selectedDates };

// // //     if (!markedDates[day.dateString]) {
// // //       markedDates[day.dateString] = {
// // //         selected: true,
// // //         color: "#70d7c7",
// // //         textColor: "white",
// // //       };
// // //     } else {
// // //       delete markedDates[day.dateString];
// // //     }

// // //     const datesArray = Object.keys(markedDates).sort((a, b) =>
// // //       moment(a).diff(moment(b))
// // //     );

// // //     if (datesArray.length === 2) {
// // //       let startDate = datesArray[0];
// // //       let endDate = datesArray[1];

// // //       let tempDate = moment(startDate);

// // //       while (tempDate.isBefore(endDate)) {
// // //         markedDates[tempDate.format("YYYY-MM-DD")] = {
// // //           color: "#70d7c7",
// // //           textColor: "white",
// // //         };
// // //         tempDate.add(1, "day");
// // //       }

// // //       markedDates[startDate] = {
// // //         startingDay: true,
// // //         color: "#70d7c7",
// // //         textColor: "white",
// // //       };

// // //       markedDates[endDate] = {
// // //         endingDay: true,
// // //         color: "#70d7c7",
// // //         textColor: "white",
// // //       };
// // //     }

// // //     setSelectedDates(markedDates);
// // //   };

// // //   const handleSubmit = async () => {
// // //     if (!horaInicio || !horaFin) {
// // //       setErrorMessage("Debes seleccionar un rango de horas.");
// // //       return;
// // //     }

// // //     try {
// // //       const datesArray = Object.keys(selectedDates).sort((a, b) =>
// // //         moment(a).diff(moment(b))
// // //       );

// // //       const data = {
// // //         cliente_id: user.id,
// // //         agenda_id: empresaId,
// // //         fecha_inicio: datesArray[0],
// // //         fecha_fin: datesArray[datesArray.length - 1],
// // //         hora_inicio: horaInicio,
// // //         hora_fin: horaFin,
// // //       };

// // //       const response = await axios.post(`${Config.url()}/lista-espera`, data);
// // //       setSuccessMessage(response.data.message);
// // //       setErrorMessage("");
// // //     } catch (error) {
// // //       setErrorMessage(
// // //         error.response?.data?.message || "Error al inscribirse en la lista de espera."
// // //       );
// // //     }
// // //   };

// // //   return (
// // //     <View style={styles.container}>
// // //     <ScrollView contentContainerStyle={styles.scrollContainer}>
// // //       <Text style={styles.title}>Únete a la Lista de Espera</Text>
// // //       {successMessage ? (
// // //         <Text style={styles.successText}>{successMessage}</Text>
// // //       ) : errorMessage ? (
// // //         <Text style={styles.errorText}>{errorMessage}</Text>
// // //       ) : null}
// // //       <Calendar
// // //         onDayPress={handleDateChange}
// // //         markingType={"period"}
// // //         markedDates={selectedDates}
// // //         minDate={moment().format("YYYY-MM-DD")}
// // //       />
// // //       <TextInput
// // //         style={styles.input}
// // //         placeholder="Hora Inicio (HH:MM)"
// // //         value={horaInicio}
// // //         onChangeText={setHoraInicio}
// // //       />
// // //       <TextInput
// // //         style={styles.input}
// // //         placeholder="Hora Fin (HH:MM)"
// // //         value={horaFin}
// // //         onChangeText={setHoraFin}
// // //       />
// // //       <TouchableOpacity style={styles.button} onPress={handleSubmit}>
// // //         <Text style={styles.buttonText}>Unirse</Text>
// // //       </TouchableOpacity>
// // //       </ScrollView>
// // //     </View>
// // //   );
// // // };

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     padding: 16,
// // //     backgroundColor: "#f5f5f5",
// // //   },
// // //   title: {
// // //     fontSize: 26,
// // //     fontWeight: "bold",
// // //     color: "#1a73e8",
// // //     textAlign: "center",
// // //     marginBottom: 24,
// // //   },
// // //   input: {
// // //     borderWidth: 1,
// // //     borderColor: "#ccc",
// // //     padding: 12,
// // //     borderRadius: 10,
// // //     marginBottom: 16,
// // //     backgroundColor: "#fff",
// // //   },
// // //   button: {
// // //     backgroundColor: "#1a73e8",
// // //     borderRadius: 25,
// // //     paddingVertical: 15,
// // //     alignItems: "center",
// // //     marginTop: 20,
// // //   },
// // //   buttonText: {
// // //     color: "#fff",
// // //     fontSize: 16,
// // //     fontWeight: "bold",
// // //   },
// // //   errorText: {
// // //     color: "red",
// // //     marginBottom: 16,
// // //     textAlign: "center",
// // //   },
// // //   successText: {
// // //     color: "green",
// // //     marginBottom: 16,
// // //     textAlign: "center",
// // //   },
// // // });

// // // export default ListaEsperaPage;



// // // // import React, { useState, useContext } from "react";
// // // // import {
// // // //   View,
// // // //   Text,
// // // //   TextInput,
// // // //   TouchableOpacity,
// // // //   StyleSheet,
// // // //   Alert,
// // // // } from "react-native";
// // // // import { Calendar } from "react-native-calendars";
// // // // import axios from "axios";
// // // // import Config from "../Config";
// // // // import moment from "moment";
// // // // import { UserContext } from "../../contexts/UserContext";

// // // // const ListaEsperaPage = ({ route, navigation }) => {
// // // //   const { user } = useContext(UserContext);
// // // //   const { empresaId } = route.params;

// // // //   const [selectedDates, setSelectedDates] = useState({
// // // //     start: moment().format("YYYY-MM-DD"),
// // // //     end: moment().format("YYYY-MM-DD"),
// // // //   });
// // // //   const [horaInicio, setHoraInicio] = useState("");
// // // //   const [horaFin, setHoraFin] = useState("");
// // // //   const [errorMessage, setErrorMessage] = useState("");
// // // //   const [successMessage, setSuccessMessage] = useState("");

// // // //   const handleDateChange = (day) => {
// // // //     if (!selectedDates.start || selectedDates.end) {
// // // //       setSelectedDates({ start: day.dateString, end: day.dateString });
// // // //     } else if (day.dateString < selectedDates.start) {
// // // //       setSelectedDates({ ...selectedDates, start: day.dateString });
// // // //     } else {
// // // //       setSelectedDates({ ...selectedDates, end: day.dateString });
// // // //     }
// // // //   };

// // // //   const handleSubmit = async () => {
// // // //     if (!horaInicio || !horaFin) {
// // // //       setErrorMessage("Debes seleccionar un rango de horas.");
// // // //       return;
// // // //     }

// // // //     try {
// // // //       const data = {
// // // //         cliente_id: user.id,
// // // //         agenda_id: empresaId,
// // // //         fecha_inicio: selectedDates.start,
// // // //         fecha_fin: selectedDates.end,
// // // //         hora_inicio: horaInicio,
// // // //         hora_fin: horaFin,
// // // //       };

// // // //       const response = await axios.post(`${Config.url()}/lista-espera`, data);
// // // //       setSuccessMessage(response.data.message);
// // // //       setErrorMessage("");
// // // //     } catch (error) {
// // // //       setErrorMessage(
// // // //         error.response?.data?.message || "Error al inscribirse en la lista de espera."
// // // //       );
// // // //     }
// // // //   };

// // // //   return (
// // // //     <View style={styles.container}>
// // // //       <Text style={styles.title}>Únete a la Lista de Espera</Text>
// // // //       {successMessage ? (
// // // //         <Text style={styles.successText}>{successMessage}</Text>
// // // //       ) : errorMessage ? (
// // // //         <Text style={styles.errorText}>{errorMessage}</Text>
// // // //       ) : null}
// // // //       <Calendar
// // // //         onDayPress={handleDateChange}
// // // //         markingType={"period"}
// // // //         markedDates={{
// // // //           [selectedDates.start]: { startingDay: true, color: "#70d7c7" },
// // // //           [selectedDates.end]: { endingDay: true, color: "#70d7c7" },
// // // //         }}
// // // //         minDate={moment().format("YYYY-MM-DD")}
// // // //       />
// // // //       <TextInput
// // // //         style={styles.input}
// // // //         placeholder="Hora Inicio (HH:MM)"
// // // //         value={horaInicio}
// // // //         onChangeText={setHoraInicio}
// // // //       />
// // // //       <TextInput
// // // //         style={styles.input}
// // // //         placeholder="Hora Fin (HH:MM)"
// // // //         value={horaFin}
// // // //         onChangeText={setHoraFin}
// // // //       />
// // // //       <TouchableOpacity style={styles.button} onPress={handleSubmit}>
// // // //         <Text style={styles.buttonText}>Unirse</Text>
// // // //       </TouchableOpacity>
// // // //     </View>
// // // //   );
// // // // };

// // // // const styles = StyleSheet.create({
// // // //   container: {
// // // //     flex: 1,
// // // //     padding: 16,
// // // //     backgroundColor: "#f5f5f5",
// // // //   },
// // // //   title: {
// // // //     fontSize: 26,
// // // //     fontWeight: "bold",
// // // //     color: "#1a73e8",
// // // //     textAlign: "center",
// // // //     marginBottom: 24,
// // // //   },
// // // //   input: {
// // // //     borderWidth: 1,
// // // //     borderColor: "#ccc",
// // // //     padding: 12,
// // // //     borderRadius: 10,
// // // //     marginBottom: 16,
// // // //     backgroundColor: "#fff",
// // // //   },
// // // //   button: {
// // // //     backgroundColor: "#1a73e8",
// // // //     borderRadius: 25,
// // // //     paddingVertical: 15,
// // // //     alignItems: "center",
// // // //     marginTop: 20,
// // // //   },
// // // //   buttonText: {
// // // //     color: "#fff",
// // // //     fontSize: 16,
// // // //     fontWeight: "bold",
// // // //   },
// // // //   errorText: {
// // // //     color: "red",
// // // //     marginBottom: 16,
// // // //     textAlign: "center",
// // // //   },
// // // //   successText: {
// // // //     color: "green",
// // // //     marginBottom: 16,
// // // //     textAlign: "center",
// // // //   },
// // // // });

// // // // export default ListaEsperaPage;

