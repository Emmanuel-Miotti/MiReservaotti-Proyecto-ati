import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import ButtonGradient from "./ButtonGradient";
// import { sendPasswordResetEmail } from "../api/api";

const ForgotPassword = () => {
  const [email, setEmail] = React.useState("");
  const [errorEmail, setErrorEmail] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleForgotPassword = async () => {
    console.log(email);
    if (email===null || !email.trim() || email.length === 0) {
      console.log("Ingresa tu correo electrónico");
      setErrorEmail("Ingresa tu correo electrónico");
      return;
    }

    try {
      // await sendPasswordResetEmail(email);
      Alert.alert(
        "Email enviado",
        "Revisa tu bandeja de entrada para restablecer tu contraseña"
      );
    } catch (error) {
      const errorMessage = error.message ? error.message : "An error occurred";
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <View style={styles.container}>



      <Text style={styles.title}>Restablecer contraseña</Text>

      <Text style={styles.subtitle}>
        Ingresa tu correo electrónico para restablecer tu contraseña
      </Text>

      <TextInput
        style={styles.textInput}
        // value={email}
        // onChangeText={setEmail}
        onChangeText={(e) => setEmail(e.nativeEvent.text)}
        defaultValue={email}
        errorMessage={errorEmail}
        placeholder="Ingresa tu correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.buttonContainer}>
        <ButtonGradient
          title="Restablecer contraseña"
          onPress={handleForgotPassword}
        />
      </View>

      <loading isVisible={loading} text="Recuperando Contraseña..." />

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.backToLogin}>Volver al login</Text>
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
  backToLogin: {
    marginTop: 20,
    color: "#11998e",
  },
});

export default ForgotPassword;
