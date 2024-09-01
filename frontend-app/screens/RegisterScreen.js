import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Estado para manejar la carga

  const { login } = useContext(UserContext);

  const handleRegister = async () => {
    setErrors({}); // Reiniciar errores
    setLoading(true); // Iniciar el indicador de carga

    if (password && password !== confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: [
          "Las contraseñas no coinciden. Por favor, inténtalo de nuevo.",
        ],
      }));
      setLoading(false); // Detener el indicador de carga
      return;
    }

    try {
      const response = await axios.post(
        `${Config.url()}/auth/register-cliente`,
        {
          name,
          email,
          password,
          confirmPassword,
          cellphone,
        }
      );

      // Manejar la respuesta de la API
      Alert.alert(
        "Registro exitoso",
        "¡Bienvenido! Tu cuenta ha sido creada exitosamente."
      );

      try {
        const response2 = await axios.post(`${Config.url()}/auth/login`, {
          email,
          password,
        });
        const userData = response2.data;
        await login(userData);

        navigation.navigate("HomeClient");
      } catch (error) {
        Alert.alert("Error", "Usuario o contraseña incorrectos");
      }
    } catch (error) {
      // Manejar errores de la API
      console.log("Datos enviados:", {
        name,
        email,
        password,
        confirmPassword,
        cellphone,
      });
      console.error("Error en la solicitud:", error.response?.data);

      if (error.response && error.response.data) {
        setErrors(error.response.data.errors || {});
      } else {
        Alert.alert(
          "Error",
          "Hubo un problema al registrar tu cuenta. Por favor, intenta de nuevo más tarde."
        );
      }
    } finally {
      setLoading(false); // Detener el indicador de carga al finalizar
    }
  };

  // Función para manejar el cambio de texto en el campo de teléfono
  const handleCellphoneChange = (text) => {
    // Solo permitir valores numéricos
    const numericValue = text.replace(/[^0-9]/g, "");
    setCellphone(numericValue);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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
        {errors.email && (
          <Text style={styles.errorText}>{errors.email[0]}</Text>
        )}
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
          placeholder="Teléfono (opcional)"
          keyboardType="phone-pad"
        />
        {errors.cellphone && (
          <Text style={styles.errorText}>{errors.cellphone[0]}</Text>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40, // Margen superior e inferior
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28, // Tamaño de texto más grande
    marginBottom: 30,
    fontWeight: "bold",
    color: "#333",
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
    marginBottom: 10,
    width: "100%",
    textAlign: "left",
    marginLeft: 20,
  },
  register: {
    marginTop: 20,
    color: "#11998e",
    fontSize: 20, // Tamaño más grande
    fontWeight: "bold",
  },
});

export default RegisterScreen;
