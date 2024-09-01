import React, { useState, useEffect, useContext } from "react";
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
import { UserContext } from "../contexts/UserContext";
import ButtonGradient from "./components/ButtonGradient";
import Config from "./Config";

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [address, setAddress] = useState("");
  const [categoria_id, setCategory] = useState("");
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [departamento_id, setDepartamentoId] = useState("");
  const [ciudad_id, setCiudadId] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [categorias, setCategorias] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useContext(UserContext);

  useEffect(() => {
    fetchDepartamentos();
    obtenerCategorias();
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

  const handleDepartamentoChange = async (value) => {
    setDepartamentoId(value);
    setCiudadId("");
    try {
      const response = await axios.get(`${Config.url()}/departamento/ciudades/${value}`);
      setCiudades(response.data);
    } catch (error) {
      console.error("Error al cargar las ciudades:", error);
    }
  };

  const handleRegister = async () => {
    setErrors({});
    setLoading(true);

    if (password !== confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: [
          "Las contraseñas no coinciden. Por favor, inténtalo de nuevo.",
        ],
      }));
      setLoading(false);
      return;
    }

    try {
      const data = {
        name,
        email,
        password,
        confirmPassword,
        cellphone,
        address,
        categoria_id,
        url,
        departamento_id,
        ciudad_id,
      };

      const response = await axios.post(
        `${Config.url()}/auth/register-empresa`,
        data
      );

      Alert.alert(
        "Registro exitoso",
        "¡Bienvenido! Tu cuenta ha sido creada exitosamente."
      );

      try {
        const loginResponse = await axios.post(`${Config.url()}/auth/login`, {
          email,
          password,
        });
        await login(loginResponse.data);
        setLoading(false);
        navigation.navigate("HomeEmpresa");
      } catch (loginError) {
        setLoading(false);
        Alert.alert("Error", "Usuario o contraseña incorrectos");
      }
    } catch (registerError) {
      setLoading(false);
      console.error("Error en el registro:", registerError);

      if (registerError.response && registerError.response.data) {
        setErrors(registerError.response.data.errors);
        Alert.alert(
          "Error",
          "Hubo un problema al registrar tu cuenta. Revisa los datos ingresados."
        );
      } else {
        Alert.alert(
          "Error",
          "Hubo un problema al registrar tu cuenta. Por favor, intenta de nuevo más tarde."
        );
      }
    }
  };

  const handleCellphoneChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setCellphone(numericValue);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.inner}>
        <Text style={styles.title}>Registro de Empresa</Text>
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
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          secureTextEntry
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password[0]}</Text>
        )}
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirmar contraseña"
          secureTextEntry
        />
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword[0]}</Text>
        )}
        <TextInput
          style={styles.input}
          value={cellphone}
          onChangeText={handleCellphoneChange}
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

        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="Nombre de URL (www.mireservaotti.online/URL)"
        />
        {errors.url && <Text style={styles.errorText}>{errors.url[0]}</Text>}

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

        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#11998e" />
          ) : (
            <ButtonGradient title="Registrarse" onPress={handleRegister} />
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.register}>Ya tengo cuenta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inner: {
    width: "100%",
    alignItems: "center",
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
  buttonContainer: {
    width: "100%",
    marginVertical: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 5,
  },
  register: {
    marginTop: 20,
    color: "#11998e",
    fontSize: 18,
    fontWeight: "bold",
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

export default RegisterScreen;

// import React, { useState, useEffect, useContext } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   Picker,
//   ScrollView,
// } from "react-native";
// import axios from "axios";
// import { UserContext } from "../contexts/UserContext";
// import ButtonGradient from "./components/ButtonGradient";
// import Config from "./Config";

// const RegisterScreen = ({ navigation }) => {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [cellphone, setCellphone] = useState("");
//   const [address, setAddress] = useState("");
//   const [categoria_id, setCategory] = useState("");
//   const [url, setUrl] = useState("");
//   const [errors, setErrors] = useState({});
//   const [departamento_id, setDepartamentoId] = useState("");
//   const [ciudad_id, setCiudadId] = useState("");
//   const [departamentos, setDepartamentos] = useState([]);
//   const [ciudades, setCiudades] = useState([]);
//   const [categorias, setCategorias] = useState({});

//   const { login } = useContext(UserContext);

//   useEffect(() => {
//     fetchDepartamentos();
//     obtenerCategorias();
//   }, []);

//   const fetchDepartamentos = async () => {
//     try {
//       const response = await axios.get(`${Config.url()}/departamentos`);
//       setDepartamentos(response.data);
//     } catch (error) {
//       console.error("Error al cargar los departamentos:", error);
//     }
//   };

//   const obtenerCategorias = async () => {
//     try {
//       const response = await axios.get(`${Config.url()}/categorias`);
//       const categoriasMap = {};
//       response.data.forEach((cat) => {
//         categoriasMap[cat.id] = cat.name;
//       });
//       setCategorias(categoriasMap);
//     } catch (error) {
//       console.error("Error al cargar categorías:", error);
//     }
//   };

//   const handleDepartamentoChange = async (value) => {
//     setDepartamentoId(value);
//     setCiudadId("");
//     try {
//       const response = await axios.get(`${Config.url()}/departamento/ciudades/${value}`);
//       setCiudades(response.data);
//     } catch (error) {
//       console.error("Error al cargar las ciudades:", error);
//     }
//   };

//   const handleRegister = async () => {
//     setErrors({});

//     if (password !== confirmPassword) {
//       setErrors((prevErrors) => ({
//         ...prevErrors,
//         confirmPassword: [
//           "Las contraseñas no coinciden. Por favor, inténtalo de nuevo.",
//         ],
//       }));
//       return;
//     }

//     try {
//       const data = {
//         name,
//         email,
//         password,
//         confirmPassword,
//         cellphone,
//         address,
//         categoria_id,
//         url,
//         departamento_id,
//         ciudad_id,
//       };

//       const response = await axios.post(
//         `${Config.url()}/auth/register-empresa`,
//         data
//       );

//       Alert.alert(
//         "Registro exitoso",
//         "¡Bienvenido! Tu cuenta ha sido creada exitosamente."
//       );

//       try {
//         const loginResponse = await axios.post(`${Config.url()}/auth/login`, {
//           email,
//           password,
//         });
//         await login(loginResponse.data);
//         navigation.navigate("HomeEmpresa");
//       } catch (loginError) {
//         Alert.alert("Error", "Usuario o contraseña incorrectos");
//       }
//     } catch (registerError) {
//       console.error("Error en el registro:", registerError);

//       if (registerError.response && registerError.response.data) {
//         setErrors(registerError.response.data.errors);
//         Alert.alert(
//           "Error",
//           "Hubo un problema al registrar tu cuenta. Revisa los datos ingresados."
//         );
//       } else {
//         Alert.alert(
//           "Error",
//           "Hubo un problema al registrar tu cuenta. Por favor, intenta de nuevo más tarde."
//         );
//       }
//     }
//   };

//   const handleCellphoneChange = (text) => {
//     const numericValue = text.replace(/[^0-9]/g, "");
//     setCellphone(numericValue);
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.scrollContainer}>
//       <View style={styles.inner}>
//         <Text style={styles.title}>Registro de Empresa</Text>
//         <TextInput
//           style={styles.input}
//           value={name}
//           onChangeText={setName}
//           placeholder="Nombre"
//         />
//         {errors.name && <Text style={styles.errorText}>{errors.name[0]}</Text>}
//         <TextInput
//           style={styles.input}
//           value={email}
//           onChangeText={setEmail}
//           placeholder="Correo electrónico"
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />
//         {errors.email && <Text style={styles.errorText}>{errors.email[0]}</Text>}
//         <TextInput
//           style={styles.input}
//           value={password}
//           onChangeText={setPassword}
//           placeholder="Contraseña"
//           secureTextEntry
//         />
//         {errors.password && (
//           <Text style={styles.errorText}>{errors.password[0]}</Text>
//         )}
//         <TextInput
//           style={styles.input}
//           value={confirmPassword}
//           onChangeText={setConfirmPassword}
//           placeholder="Confirmar contraseña"
//           secureTextEntry
//         />
//         {errors.confirmPassword && (
//           <Text style={styles.errorText}>{errors.confirmPassword[0]}</Text>
//         )}
//         <TextInput
//           style={styles.input}
//           value={cellphone}
//           onChangeText={handleCellphoneChange}
//           placeholder="Teléfono"
//           keyboardType="phone-pad"
//         />
//         {errors.cellphone && (
//           <Text style={styles.errorText}>{errors.cellphone[0]}</Text>
//         )}
//         <TextInput
//           style={styles.input}
//           value={address}
//           onChangeText={setAddress}
//           placeholder="Dirección"
//         />
//         {errors.address && (
//           <Text style={styles.errorText}>{errors.address[0]}</Text>
//         )}

//         <Picker
//           selectedValue={categoria_id}
//           style={styles.picker}
//           onValueChange={(itemValue) => setCategory(itemValue)}
//         >
//           <Picker.Item label="Selecciona tu categoría" value="" />
//           {Object.keys(categorias).map((key) => (
//             <Picker.Item key={key} label={categorias[key]} value={key} />
//           ))}
//         </Picker>
//         {errors.categoria_id && (
//           <Text style={styles.errorText}>{errors.categoria_id[0]}</Text>
//         )}

//         <TextInput
//           style={styles.input}
//           value={url}
//           onChangeText={setUrl}
//           placeholder="Nombre de URL (www.mireservaotti.online/URL)"
//         />
//         {errors.url && <Text style={styles.errorText}>{errors.url[0]}</Text>}

//         <Picker
//           selectedValue={departamento_id}
//           style={styles.picker}
//           onValueChange={(itemValue) => handleDepartamentoChange(itemValue)}
//         >
//           <Picker.Item label="Selecciona tu departamento" value="" />
//           {departamentos.map((departamento) => (
//             <Picker.Item
//               key={departamento.id}
//               label={departamento.name}
//               value={departamento.id}
//             />
//           ))}
//         </Picker>
//         {errors.departamento_id && (
//           <Text style={styles.errorText}>{errors.departamento_id[0]}</Text>
//         )}

//         <Picker
//           selectedValue={ciudad_id}
//           style={styles.picker}
//           onValueChange={(itemValue) => setCiudadId(itemValue)}
//         >
//           <Picker.Item label="Selecciona tu ciudad" value="" />
//           {ciudades.map((ciudad) => (
//             <Picker.Item key={ciudad.id} label={ciudad.name} value={ciudad.id} />
//           ))}
//         </Picker>
//         {errors.ciudad_id && (
//           <Text style={styles.errorText}>{errors.ciudad_id[0]}</Text>
//         )}

//         <View style={styles.buttonContainer}>
//           <ButtonGradient title="Registrarse" onPress={handleRegister} />
//         </View>
//         <TouchableOpacity onPress={() => navigation.navigate("Login")}>
//           <Text style={styles.register}>Ya tengo cuenta</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//   },
//   inner: {
//     width: "100%",
//     alignItems: "center",
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
//   buttonContainer: {
//     width: "100%",
//     marginVertical: 20,
//   },
//   errorText: {
//     color: "red",
//     marginBottom: 5,
//   },
//   register: {
//     marginTop: 20,
//     color: "#11998e",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   picker: {
//     height: 50,
//     width: "100%",
//     marginVertical: 10,
//     padding: 15,
//     backgroundColor: "#ffffff",
//     borderColor: "#ccc",
//     borderWidth: 1,
//     borderRadius: 25,
//   },
// });

// export default RegisterScreen;

