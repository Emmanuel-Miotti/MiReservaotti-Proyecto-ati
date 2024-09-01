import axios from "axios";

const api = axios.create({
  baseURL: "", // Reemplaza con la URL de tu API
});

export const register = async (data) => {
  try {
    console.log("Sending request to register with data:", data);
    const response = await api.post("/register", data);
    console.log("Register response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      throw error.response.data;
    } else if (error.request) {
      // La solicitud fue hecha pero no hubo respuesta
      throw new Error("No response received from server");
    } else {
      // Ocurrió un error al configurar la solicitud
      throw new Error("Error in setting up request: " + error.message);
    }
  }
};

export const login = async (data) => {
  console.log("entre");
  try {
    console.log("Sending request to login with data:", data);
    const response = await axios.post("127.0.0.1:8000/api/v1/auth/login", data);
    console.log("Login response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      throw error.response.data;
    } else if (error.request) {
      // La solicitud fue hecha pero no hubo respuesta
      throw new Error("No response received from server");
    } else {
      // Ocurrió un error al configurar la solicitud
      throw new Error("Error in setting up request: " + error.message);
    }
  }
};
