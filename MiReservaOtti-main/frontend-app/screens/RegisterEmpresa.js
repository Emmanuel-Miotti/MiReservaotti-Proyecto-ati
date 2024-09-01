import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
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
  const [address, setAddress] = useState("");
  const [categoria_id, setCategory] = useState("");
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState({});

  const { login } = useContext(UserContext);

  const handleRegister = async () => {
    setErrors({});
    if (password !== confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: [
          "Las contraseñas no coinciden. Por favor, inténtalo de nuevo.",
        ],
      }));
      return;
    }

    try {
      const data = {
        name,
        email,
        password,
        cellphone,
        address,
        categoria_id,
        url,
      };

      console.log("Enviando datos:", data);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/auth/register-empresa",
        data
      );

      Alert.alert(
        "Registro exitoso",
        "¡Bienvenido! Tu cuenta ha sido creada exitosamente."
      );

      try {
        const response2 = await axios.post(
          "http://127.0.0.1:8000/api/v1/auth/login",
          { email, password }
        );
        await login(response2.data);
        navigation.navigate("Home");
      } catch (error) {
        Alert.alert("Error", "Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
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

  const handleCellphoneChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    setCellphone(numericValue);
  };

  return (
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
        placeholder="Teléfono (opcional)"
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
      <TextInput
        style={styles.input}
        value={categoria_id}
        onChangeText={setCategory}
        placeholder="Categoría"
      />
      {errors.categoria_id && (
        <Text style={styles.errorText}>{errors.categoria_id[0]}</Text>
      )}
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="URL"
      />
      {errors.url && <Text style={styles.errorText}>{errors.url[0]}</Text>}
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
  },
  inner: {
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
  },
});

export default RegisterScreen;
