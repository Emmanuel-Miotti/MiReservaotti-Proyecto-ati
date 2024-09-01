import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";
import ButtonGradient from "./components/ButtonGradient";

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [errors, setErrors] = useState({});

  const { login } = useContext(UserContext);

  const handleRegister = async () => {
    setErrors({}); // Reiniciar errores

    if (password && password !== confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: [
          "Las contraseñas no coinciden. Por favor, inténtalo de nuevo.",
        ],
      }));
      return;
    }
    // if (password && confirmPassword == null) {
    //   Alert.alert(
    //     "Error",
    //     "El campo confirmar contraseña debe ser una cadena de texto."
    //   );
    //   return;
    // }

    try {
      if (password !== confirmPassword) {
        Alert.alert("Error", "Las contraseñas no coinciden");
        return;
      }
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/auth/register-cliente",
        {
          name,
          email,
          password,
          cellphone,
        }
      );

      // Manejar la respuesta de la API
      Alert.alert(
        "Registro exitoso",
        "¡Bienvenido! Tu cuenta ha sido creada exitosamente."
      );

      try {
        const response2 = await axios.post(
          "http://127.0.0.1:8000/api/v1/auth/login",
          {
            email,
            password,
          }
        );
        await login(response2.data);
        navigation.navigate("Home");
      } catch (error) {
        Alert.alert("Error", "Usuario o contraseña incorrectos");
      }
    } catch (error) {
      // Manejar errores de la API
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        Alert.alert(
          "Error",
          "Hubo un problema al registrar tu cuenta. Por favor, intenta de nuevo más tarde."
        );
      }
    }
  };

  // Función para manejar el cambio de texto en el campo de teléfono
  const handleCellphoneChange = (text) => {
    // Solo permitir valores numéricos
    const numericValue = text.replace(/[^0-9]/g, "");
    setCellphone(numericValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Cliente</Text>
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
        // onChangeText={setCellphone}
        onChangeText={handleCellphoneChange}
        placeholder="Teléfono (opcional)"
        keyboardType="phone-pad"
      />
      {errors.cellphone && (
        <Text style={styles.errorText}>{errors.cellphone[0]}</Text>
      )}
      {/* <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity> */}

      <View style={styles.buttonContainer}>
        <ButtonGradient title="Registrarse" onPress={handleRegister} />
      </View>
      
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.register}>Ya tengo cuenta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    width: "100%",
    textAlign: "left",
    marginLeft: 20,
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

export default RegisterScreen;
