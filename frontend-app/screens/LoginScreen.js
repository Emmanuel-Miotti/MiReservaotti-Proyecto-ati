import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import ButtonGradient from "./components/ButtonGradient";
import { UserContext } from "../contexts/UserContext";
import Config from "./Config";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { login } = useContext(UserContext);

  const handleLogin = async () => {
    setErrors({}); // Reiniciar errores

    try {    
      const response = await axios.post(`${Config.url()}/auth/login`, {
        email,
        password,
      });
      const userData = response.data;
      await login(userData);

    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
        console.log(error.response.data.errors); // Verifica la estructura de los errores
      } else {
        Alert.alert("Error", "Hubo un problema al intentar iniciar sesión.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>
        Ingrese sus credenciales para continuar
      </Text>
      <TextInput
        style={styles.textInput}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      <TextInput
        style={styles.textInput}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Contraseña"
      />
      {errors.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}
      {/* <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity> */}
      <View style={styles.buttonContainer}>
        <ButtonGradient title="Ingresar" onPress={handleLogin} />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
        <Text style={styles.register}>Regístrate como cliente</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("RegisterEmpresa")}>
        <Text style={styles.register}>Regístrate como Empresa</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 12,
    color: "#34434D",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 24,
    color: "gray",
    textAlign: "center",
  },
  textInput: {
    height: 50,
    width: "100%",
    marginVertical: 10,
    padding: 15,
    borderRadius: 25,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    width: "100%",
    textAlign: "left",
    marginLeft: 20,
  },
  forgotPassword: {
    marginTop: 10,
    color: "#11998e",
    textAlign: "right",
    width: "100%",
  },
  buttonContainer: {
    width: "100%",
    marginVertical: 20,
  },
  register: {
    marginTop: 20,
    color: "#11998e",
  },
});

export default LoginScreen;


// import React, { useState, useContext } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
// } from "react-native";
// import axios from "axios";
// import ButtonGradient from "./components/ButtonGradient";
// import { UserContext } from "../contexts/UserContext";
// import Config from "./Config";

// const LoginScreen = ({ navigation }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errors, setErrors] = useState({});
//   const { login } = useContext(UserContext);


//   const handleLogin = async () => {
//     setErrors({});

//     try {
//       const response = await axios.post(`${Config.url()}/auth/login`, {
//         email,
//         password,
//       });
//       const userData = response.data;
//       await login(userData);
//     } catch (error) {
//       if (error.response && error.response.data && error.response.data.errors) {
//         setErrors(error.response.data.errors);
//         console.log(error.response.data.errors)
//       } else {
//         console.error("Error en la solicitud:", error);
//         Alert.alert("Error", "Hubo un problema al intentar iniciar sesión.");
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Login</Text>
//       <Text style={styles.subtitle}>
//         Ingrese sus credenciales para continuar
//       </Text>
//       <TextInput
//         style={styles.textInput}
//         value={email}
//         onChangeText={setEmail}
//         placeholder="Email"
//         keyboardType="email-address"
//         autoCapitalize="none"
//       />
//       {errors.email && (
//         <Text style={styles.errorText}>{errors.email[0]}</Text>
//       )}
//       <TextInput
//         style={styles.textInput}
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//         placeholder="Contraseña"
//       />
//       {errors.password && (
//         <Text style={styles.errorText}>{errors.password[0]}</Text>
//       )}
//       {/* <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
//         <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
//       </TouchableOpacity> */}
//       <View style={styles.buttonContainer}>
//         <ButtonGradient title="Ingresar" onPress={handleLogin} />
//       </View>

//       <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
//         <Text style={styles.register}>Regístrate como cliente</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => navigation.navigate("RegisterEmpresa")}>
//         <Text style={styles.register}>Regístrate como Empresa</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f1f1f1",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 32,
//     marginBottom: 12,
//     color: "#34434D",
//     fontWeight: "bold",
//   },
//   subtitle: {
//     fontSize: 18,
//     marginBottom: 24,
//     color: "gray",
//     textAlign: "center",
//   },
//   textInput: {
//     height: 50,
//     width: "100%",
//     marginVertical: 10,
//     padding: 15,
//     borderRadius: 25,
//     backgroundColor: "#fff",
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   errorText: {
//     color: "red",
//     marginBottom: 10,
//     width: "100%",
//     textAlign: "left",
//     marginLeft: 20,
//   },
//   forgotPassword: {
//     marginTop: 10,
//     color: "#11998e",
//     textAlign: "right",
//     width: "100%",
//   },
//   buttonContainer: {
//     width: "100%",
//     marginVertical: 20,
//   },
//   register: {
//     marginTop: 20,
//     color: "#11998e",
//   },
// });

// export default LoginScreen;



// // import React, { useState, useContext } from "react";
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   StyleSheet,
// //   Alert,
// //   TouchableOpacity,
// // } from "react-native";
// // import axios from "axios";
// // import ButtonGradient from "./components/ButtonGradient";
// // import { UserContext } from "../contexts/UserContext";
// // import Config from "./Config";

// // const LoginScreen = ({ navigation }) => {
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [errors, setErrors] = useState({});
// //   const { login } = useContext(UserContext);

// //   const handleLogin = async () => {
// //     setErrors({}); // Reiniciar errores

// //     try {    
// //       const response = await axios.post(`${Config.url()}/auth/login`, {
// //         email,
// //         password,
// //       });
// //       const userData = response.data;
// //       await login(userData);

// //     } catch (error) {
// //       // Manejar errores de autenticación
// //       if (error.response && error.response.status === 401) {
// //         Alert.alert("Error", "Usuario o contraseña incorrectos");
// //       } else {
// //         console.error("Error en la solicitud:", error);
// //         Alert.alert("Error", "Hubo un problema al intentar iniciar sesión.");
// //       }
// //       // if (error.response && error.response.data && error.response.data.errors) {
// //       //   setErrors(error.response.data.errors);
// //       // } else if (
// //       //   error.response &&
// //       //   error.response.data &&
// //       //   error.response.data.message
// //       // ) {
// //       //   Alert.alert("Error", error.response.data.errors);
// //       // } else {
// //       //   Alert.alert("Error", "Usuario o contraseña incorrectos");
// //       // }
// //     }
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.title}>Login</Text>
// //       <Text style={styles.subtitle}>
// //         Ingrese sus credenciales para continuar
// //       </Text>
// //       <TextInput
// //         style={styles.textInput}
// //         value={email}
// //         onChangeText={setEmail}
// //         placeholder="Email"
// //         keyboardType="email-address"
// //         autoCapitalize="none"
// //       />
// //       {errors.email && <Text style={styles.errorText}>{errors.email[0]}</Text>}
// //       <TextInput
// //         style={styles.textInput}
// //         value={password}
// //         onChangeText={setPassword}
// //         secureTextEntry
// //         placeholder="Contraseña"
// //       />
// //       {errors.password && (
// //         <Text style={styles.errorText}>{errors.password[0]}</Text>
// //       )}
// //       <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
// //         <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
// //       </TouchableOpacity>
// //       <View style={styles.buttonContainer}>
// //         <ButtonGradient title="Ingresar" onPress={handleLogin} />
// //       </View>

// //       <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
// //         <Text style={styles.register}>Regístrate como cliente</Text>
// //       </TouchableOpacity>

// //       <TouchableOpacity onPress={() => navigation.navigate("RegisterEmpresa")}>
// //         <Text style={styles.register}>Regístrate como Empresa</Text>
// //       </TouchableOpacity>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#f1f1f1",
// //     justifyContent: "center",
// //     alignItems: "center",
// //     paddingHorizontal: 20,
// //   },
// //   title: {
// //     fontSize: 32,
// //     marginBottom: 12,
// //     color: "#34434D",
// //     fontWeight: "bold",
// //   },
// //   subtitle: {
// //     fontSize: 18,
// //     marginBottom: 24,
// //     color: "gray",
// //     textAlign: "center",
// //   },
// //   textInput: {
// //     height: 50,
// //     width: "100%",
// //     marginVertical: 10,
// //     padding: 15,
// //     borderRadius: 25,
// //     backgroundColor: "#fff",
// //     shadowColor: "#000",
// //     shadowOffset: {
// //       width: 0,
// //       height: 2,
// //     },
// //     shadowOpacity: 0.25,
// //     shadowRadius: 3.84,
// //     elevation: 5,
// //   },
// //   errorText: {
// //     color: "red",
// //     marginBottom: 10,
// //     width: "100%",
// //     textAlign: "left",
// //     marginLeft: 20,
// //   },
// //   forgotPassword: {
// //     marginTop: 10,
// //     color: "#11998e",
// //     textAlign: "right",
// //     width: "100%",
// //   },
// //   buttonContainer: {
// //     width: "100%",
// //     marginVertical: 20,
// //   },
// //   register: {
// //     marginTop: 20,
// //     color: "#11998e",
// //   },
// // });

// // export default LoginScreen;

// // // import React, { useState, useContext } from "react";
// // // import {
// // //   View,
// // //   Text,
// // //   TextInput,
// // //   StyleSheet,
// // //   Alert,
// // //   TouchableOpacity,
// // // } from "react-native";
// // // import axios from "axios";
// // // import ButtonGradient from "./components/ButtonGradient";
// // // import { UserContext } from "../contexts/UserContext";
// // // import Config from "./Config";

// // // const LoginScreen = ({ navigation }) => {
// // //   const [email, setEmail] = useState("");
// // //   const [password, setPassword] = useState("");
// // //   const [errors, setErrors] = useState({});
// // //   const { login } = useContext(UserContext);

// // //   const handleLogin = async () => {
// // //     setErrors({}); // Reset errors

// // //     try {
// // //       const response = await axios.post(`${Config.url()}/auth/login`, {
// // //         email,
// // //         password,
// // //       });
// // //       await login(response.data);
// // //       console.log(response.data.data.role);

// // //       navigation.navigate("Home");
// // //     } catch (error) {
// // //       // Check if the error response exists and contains data
// // //       if (error.response && error.response.data && error.response.data.errors) {
// // //         setErrors(error.response.data.errors);
// // //       } else if (
// // //         error.response &&
// // //         error.response.data &&
// // //         error.response.data.message
// // //       ) {
// // //         Alert.alert("Error", error.response.data.errors);
// // //       } else {
// // //         Alert.alert("Error", "Usuario o contraseña incorrectos");
// // //       }
// // //     }
// // //   };

// // //   return (
// // //     <View style={styles.container}>
// // //       <Text style={styles.title}>Login</Text>
// // //       <Text style={styles.subtitle}>
// // //         Ingrese sus credenciales para continuar
// // //       </Text>
// // //       <TextInput
// // //         style={styles.textInput}
// // //         value={email}
// // //         onChangeText={setEmail}
// // //         placeholder="Email"
// // //         keyboardType="email-address"
// // //         autoCapitalize="none"
// // //       />
// // //       {errors.email && <Text style={styles.errorText}>{errors.email[0]}</Text>}
// // //       <TextInput
// // //         style={styles.textInput}
// // //         value={password}
// // //         onChangeText={setPassword}
// // //         secureTextEntry
// // //         placeholder="Contraseña"
// // //       />
// // //       {errors.password && (
// // //         <Text style={styles.errorText}>{errors.password[0]}</Text>
// // //       )}
// // //       <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
// // //         <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
// // //       </TouchableOpacity>
// // //       <View style={styles.buttonContainer}>
// // //         <ButtonGradient title="Ingresar" onPress={handleLogin} />
// // //       </View>

// // //       <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
// // //         <Text style={styles.register}>Regístrate como cliente</Text>
// // //       </TouchableOpacity>

// // //       <TouchableOpacity onPress={() => navigation.navigate("RegisterEmpresa")}>
// // //         <Text style={styles.register}>Regístrate como Empresa</Text>
// // //       </TouchableOpacity>
// // //     </View>
// // //   );
// // // };

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     backgroundColor: "#f1f1f1",
// // //     justifyContent: "center",
// // //     alignItems: "center",
// // //     paddingHorizontal: 20,
// // //   },
// // //   title: {
// // //     fontSize: 32,
// // //     marginBottom: 12,
// // //     color: "#34434D",
// // //     fontWeight: "bold",
// // //   },
// // //   subtitle: {
// // //     fontSize: 18,
// // //     marginBottom: 24,
// // //     color: "gray",
// // //     textAlign: "center",
// // //   },
// // //   textInput: {
// // //     height: 50,
// // //     width: "100%",
// // //     marginVertical: 10,
// // //     padding: 15,
// // //     borderRadius: 25,
// // //     backgroundColor: "#fff",
// // //     shadowColor: "#000",
// // //     shadowOffset: {
// // //       width: 0,
// // //       height: 2,
// // //     },
// // //     shadowOpacity: 0.25,
// // //     shadowRadius: 3.84,
// // //     elevation: 5,
// // //   },
// // //   errorText: {
// // //     color: "red",
// // //     marginBottom: 10,
// // //     width: "100%",
// // //     textAlign: "left",
// // //     marginLeft: 20,
// // //   },
// // //   forgotPassword: {
// // //     marginTop: 10,
// // //     color: "#11998e",
// // //     textAlign: "right",
// // //     width: "100%",
// // //   },
// // //   buttonContainer: {
// // //     width: "100%",
// // //     marginVertical: 20,
// // //   },
// // //   register: {
// // //     marginTop: 20,
// // //     color: "#11998e",
// // //   },
// // //   buttonGoogle: {
// // //     height: 50,
// // //     width: "100%",
// // //     marginVertical: 10,
// // //     padding: 15,
// // //     borderRadius: 25,
// // //     shadowColor: "#000",
// // //     elevation: 5,
// // //     backgroundColor: "#4285F4",
// // //   },
// // // });

// // // export default LoginScreen;
