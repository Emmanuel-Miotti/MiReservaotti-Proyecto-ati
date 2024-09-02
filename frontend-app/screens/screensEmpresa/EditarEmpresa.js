import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Picker,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { UserContext } from "../../contexts/UserContext"; // Importa el UserContext correctamente
import AsyncStorage from "@react-native-async-storage/async-storage";
import BotonCancelar from "../components/BotonCancelar";
import Config from "../Config";

const EditEmpresaScreen = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);  // Extrae correctamente user y setUser
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [cellphone, setCellphone] = useState(user.cellphone || "");
  const [address, setAddress] = useState(user.address || "");
  const [categoria_id, setCategory] = useState(user.categoria_id || "");
  const [departamento_id, setDepartamentoId] = useState(user.departamento_id || "");
  const [ciudad_id, setCiudadId] = useState(user.ciudad_id || "");
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [categorias, setCategorias] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartamentos();
    obtenerCategorias();
    if (departamento_id) {
      fetchCiudades(departamento_id); 
    }
  }, []);

  const fetchDepartamentos = async () => {
    try {
      const response = await axios.get(`${Config.url()}/departamentos`);
      setDepartamentos(response.data);
    } catch (error) {
      console.error("Error al cargar los departamentos:", error);
    }
  };

  const obtenerCategorias = async () => {
    try {
      const response = await axios.get(`${Config.url()}/categorias`);
      const categoriasMap = {};
      response.data.forEach((cat) => {
        categoriasMap[cat.id] = cat.name;
      });
      setCategorias(categoriasMap);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const fetchCiudades = async (departamentoId) => {
    try {
      const response = await axios.get(`${Config.url()}/departamento/ciudades/${departamentoId}`);
      setCiudades(response.data);
    } catch (error) {
      console.error("Error al cargar las ciudades:", error);
    }
  };

  const handleDepartamentoChange = (value) => {
    setDepartamentoId(value);
    setCiudadId("");
    fetchCiudades(value);
  };

  const handleEditEmpresa = async () => {
    setErrors({});
    setLoading(true);

    try {
      const token = JSON.parse(await AsyncStorage.getItem("token"));
      const response = await axios.put(
        `${Config.url()}/empresa/${user.id}`,
        {
          name,
          email,
          cellphone,
          address,
          categoria_id,
          departamento_id,
          ciudad_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      // Actualizar el estado del usuario en UserContext
      setUser(response.data.empresa); // Asegúrate de que setUser es una función y se llama correctamente

      Alert.alert(
        "Empresa actualizada",
        "Los datos de la empresa han sido actualizados correctamente."
      );

      navigation.goBack();

    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error al editar la empresa:", error);
        Alert.alert(
          "Error",
          "Hubo un problema al actualizar los datos de la empresa. Por favor, intenta de nuevo más tarde."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Empresa</Text>
      <Text>Modifique solo los datos que quiera editar</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nombre"
      />
      {errors.name && <Text style={styles.errorText}>{errors.name[0]}</Text>}
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email[0]}</Text>}
      <TextInput
        style={styles.input}
        value={cellphone}
        onChangeText={setCellphone}
        placeholder="Teléfono"
        keyboardType="phone-pad"
      />
      {errors.cellphone && (
        <Text style={styles.errorText}>{errors.cellphone[0]}</Text>
      )}
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Dirección"
      />
      {errors.address && (
        <Text style={styles.errorText}>{errors.address[0]}</Text>
      )}

      <Picker
        selectedValue={categoria_id}
        style={styles.picker}
        onValueChange={(itemValue) => setCategory(itemValue)}
      >
        <Picker.Item label="Selecciona tu categoría" value="" />
        {Object.keys(categorias).map((key) => (
          <Picker.Item key={key} label={categorias[key]} value={key} />
        ))}
      </Picker>
      {errors.categoria_id && (
        <Text style={styles.errorText}>{errors.categoria_id[0]}</Text>
      )}

      <Picker
        selectedValue={departamento_id}
        style={styles.picker}
        onValueChange={(itemValue) => handleDepartamentoChange(itemValue)}
      >
        <Picker.Item label="Selecciona tu departamento" value="" />
        {departamentos.map((departamento) => (
          <Picker.Item
            key={departamento.id}
            label={departamento.name}
            value={departamento.id}
          />
        ))}
      </Picker>
      {errors.departamento_id && (
        <Text style={styles.errorText}>{errors.departamento_id[0]}</Text>
      )}

      <Picker
        selectedValue={ciudad_id}
        style={styles.picker}
        onValueChange={(itemValue) => setCiudadId(itemValue)}
      >
        <Picker.Item label="Selecciona tu ciudad" value="" />
        {ciudades.map((ciudad) => (
          <Picker.Item key={ciudad.id} label={ciudad.name} value={ciudad.id} />
        ))}
      </Picker>
      {errors.ciudad_id && (
        <Text style={styles.errorText}>{errors.ciudad_id[0]}</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleEditEmpresa}>
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Guardar cambios</Text>
        )}
      </TouchableOpacity>
      <BotonCancelar onCancel={handleCancel} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    height: 50,
    width: "100%",
    marginVertical: 10,
    padding: 15,
    borderRadius: 25,
    backgroundColor: "#ffffff",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#007bff",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: "100%",
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#ffffff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 25,
  },
});

export default EditEmpresaScreen;




// import React, { useContext, useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import axios from "axios";
// import { UserContext } from "../../contexts/UserContext";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import BotonCancelar from "../components/BotonCancelar";

// const EditClientScreen = ({ navigation }) => {
//   const user = useContext(UserContext).user;
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [cellphone, setCellphone] = useState("");
//   const [password, setPassword] = useState("");
//   const [password_confirmation, setPassword_confirmation] = useState("");
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     const fetchClientData = async () => {
//       const token = JSON.parse(await AsyncStorage.getItem("token"));
//       try {
//         const response = await axios.get(
//           `http://127.0.0.1:8000/api/v1/cliente/${user.id}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         const { name, email, cellphone } = response.data.data;
//         setName(name);
//         setEmail(email);
//         setCellphone(cellphone);
//       } catch (error) {
//         console.error("Error al obtener los datos del cliente:", error);
//         Alert.alert(
//           "Error",
//           "Hubo un problema al cargar los datos del cliente. Por favor, intenta de nuevo más tarde."
//         );
//       }
//     };

//     fetchClientData();
//   }, [user.id]);

//   const handleEditClient = async () => {
//     setErrors({});

//     if (password && password !== password_confirmation) {
//       setErrors((prevErrors) => ({
//         ...prevErrors,
//         password_confirmation: ["Las contraseñas no coinciden."],
//       }));
//       return;
//     }

//     try {
//       const token = JSON.parse(await AsyncStorage.getItem("token"));
//       const response = await axios.put(
//         `http://127.0.0.1:8000/api/v1/cliente/${user.id}`,
//         {
//           name,
//           email,
//           cellphone,
//           ...(password && { password, password_confirmation }),
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       Alert.alert(
//         "Cliente actualizado",
//         "Los datos del cliente han sido actualizados correctamente."
//       );
//       navigation.goBack();
//     } catch (error) {
//       if (error.response && error.response.data && error.response.data.errors) {
//         setErrors(error.response.data.errors);
//       } else {
//         console.error("Error al editar el cliente:", error);
//         Alert.alert(
//           "Error",
//           "Hubo un problema al actualizar los datos del cliente. Por favor, intenta de nuevo más tarde."
//         );
//       }
//     }
//   };

//   const handleCancel = () => {
//     navigation.goBack();
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Editar Cliente</Text>
//       <Text>Modifique solo los datos que quiera editar</Text>
//       <TextInput
//         style={styles.input}
//         value={name}
//         onChangeText={setName}
//         placeholder="Nombre"
//       />
//       {errors.name && <Text style={styles.errorText}>{errors.name[0]}</Text>}
//       <TextInput
//         style={styles.input}
//         value={email}
//         onChangeText={setEmail}
//         placeholder="Correo electrónico"
//         keyboardType="email-address"
//         autoCapitalize="none"
//       />
//       {errors.email && <Text style={styles.errorText}>{errors.email[0]}</Text>}
//       <TextInput
//         style={styles.input}
//         value={cellphone}
//         onChangeText={setCellphone}
//         placeholder="Teléfono"
//         keyboardType="phone-pad"
//       />
//       {errors.cellphone && (
//         <Text style={styles.errorText}>{errors.cellphone[0]}</Text>
//       )}
//       <TextInput
//         style={styles.input}
//         value={password}
//         onChangeText={setPassword}
//         placeholder="Nueva contraseña"
//         secureTextEntry
//       />
//       {errors.password && (
//         <Text style={styles.errorText}>{errors.password[0]}</Text>
//       )}
//       <TextInput
//         style={styles.input}
//         value={password_confirmation}
//         onChangeText={setPassword_confirmation}
//         placeholder="Confirmar nueva contraseña"
//         secureTextEntry
//       />
//       {errors.password_confirmation && (
//         <Text style={styles.errorText}>{errors.password_confirmation[0]}</Text>
//       )}
//       <TouchableOpacity style={styles.button} onPress={handleEditClient}>
//         <Text style={styles.buttonText}>Guardar cambios</Text>
//       </TouchableOpacity>
//       <BotonCancelar onCancel={handleCancel} />

//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 24,
//     marginBottom: 20,
//     fontWeight: "bold",
//   },
//   input: {
//     height: 50,
//     width: "100%",
//     marginVertical: 10,
//     padding: 15,
//     borderRadius: 25,
//     backgroundColor: "#ffffff",
//     borderColor: "#ccc",
//     borderWidth: 1,
//   },
//   button: {
//     marginTop: 20,
//     backgroundColor: "#007bff",
//     borderRadius: 25,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//   },
//   buttonText: {
//     color: "#ffffff",
//     fontSize: 18,
//     textAlign: "center",
//   },
//   errorText: {
//     color: "red",
//     marginBottom: 10,
//   },
// });

// export default EditClientScreen;
