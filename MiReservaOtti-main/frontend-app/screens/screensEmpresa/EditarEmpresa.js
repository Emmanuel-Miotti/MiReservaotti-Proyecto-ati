import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import { UserContext } from "../../contexts/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BotonCancelar from "../components/BotonCancelar";

const EditClientScreen = ({ navigation }) => {
  const user = useContext(UserContext).user;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPassword_confirmation] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchClientData = async () => {
      const token = JSON.parse(await AsyncStorage.getItem("token"));
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/v1/cliente/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { name, email, cellphone } = response.data.data;
        setName(name);
        setEmail(email);
        setCellphone(cellphone);
      } catch (error) {
        console.error("Error al obtener los datos del cliente:", error);
        Alert.alert(
          "Error",
          "Hubo un problema al cargar los datos del cliente. Por favor, intenta de nuevo más tarde."
        );
      }
    };

    fetchClientData();
  }, [user.id]);

  const handleEditClient = async () => {
    setErrors({});

    if (password && password !== password_confirmation) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password_confirmation: ["Las contraseñas no coinciden."],
      }));
      return;
    }

    try {
      const token = JSON.parse(await AsyncStorage.getItem("token"));
      const response = await axios.put(
        `http://127.0.0.1:8000/api/v1/cliente/${user.id}`,
        {
          name,
          email,
          cellphone,
          ...(password && { password, password_confirmation }),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert(
        "Cliente actualizado",
        "Los datos del cliente han sido actualizados correctamente."
      );
      navigation.goBack();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error al editar el cliente:", error);
        Alert.alert(
          "Error",
          "Hubo un problema al actualizar los datos del cliente. Por favor, intenta de nuevo más tarde."
        );
      }
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Cliente</Text>
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
        value={password}
        onChangeText={setPassword}
        placeholder="Nueva contraseña"
        secureTextEntry
      />
      {errors.password && (
        <Text style={styles.errorText}>{errors.password[0]}</Text>
      )}
      <TextInput
        style={styles.input}
        value={password_confirmation}
        onChangeText={setPassword_confirmation}
        placeholder="Confirmar nueva contraseña"
        secureTextEntry
      />
      {errors.password_confirmation && (
        <Text style={styles.errorText}>{errors.password_confirmation[0]}</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={handleEditClient}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>
      <BotonCancelar onCancel={handleCancel} />

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
});

export default EditClientScreen;
