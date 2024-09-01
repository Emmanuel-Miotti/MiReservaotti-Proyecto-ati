import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { ListItem, Badge } from "react-native-elements";
import axios from "axios";
import BotonVolver from "../components/BotonVolver"; // Ajusta la ruta según corresponda

const ServicioCrud = ({ navigation }) => {
  const user = useContext(UserContext).user;
  const [servicios, setServicios] = useState([]);
  const [nuevoServicio, setNuevoServicio] = useState({
    empresa_id: user.id,
    nombre: "",
    descripcion: "",
    duracion: "",
    estado: "activo",
    precio: "",
  });
  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [servicioActual, setServicioActual] = useState(null);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    obtenerServicios();
  }, []);

  const obtenerServicios = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/v1/servicios/empresa/${user.id}`
      );
      setServicios(response.data);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  const desactivarServicio = async (id) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/v1/servicios/${id}/desactivar`);
      setServicios(
        servicios.map((servicio) =>
          servicio.id === id ? { ...servicio, estado: "desactivado" } : servicio
        )
      );
    } catch (error) {
      console.error("Error al desactivar el servicio:", error);
    }
  };

  const activarServicio = async (id) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/v1/servicios/${id}/activar`);
      setServicios(
        servicios.map((servicio) =>
          servicio.id === id ? { ...servicio, estado: "activo" } : servicio
        )
      );
    } catch (error) {
      console.error("Error al activar el servicio:", error);
    }
  };

  const eliminarServicio = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/servicios/${id}`);
      setServicios(servicios.filter((servicio) => servicio.id !== id));
    } catch (error) {
      console.error("Error al eliminar el servicio:", error);
    }
  };

  const handleInputChange = (name, value) => {
    setNuevoServicio((prevServicio) => ({
      ...prevServicio,
      [name]: value,
    }));
  };

  const handleEditInputChange = (name, value) => {
    setServicioActual((prevServicio) => ({
      ...prevServicio,
      [name]: value,
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!nuevoServicio.nombre) {
      nuevosErrores.nombre = "El campo nombre es obligatorio.";
    } else if (nuevoServicio.nombre.length > 255) {
      nuevosErrores.nombre = "El nombre no puede tener más de 255 caracteres.";
    }

    if (!nuevoServicio.descripcion) {
      nuevosErrores.descripcion = "El campo descripción es obligatorio.";
    }

    if (!nuevoServicio.duracion) {
      nuevosErrores.duracion = "El campo duración es obligatorio.";
    } else if (isNaN(nuevoServicio.duracion) || nuevoServicio.duracion < 1) {
      nuevosErrores.duracion =
        "La duración debe ser un número entero mayor a 0.";
    }

    if (!nuevoServicio.precio) {
      nuevosErrores.precio = "El campo precio es obligatorio.";
    } else if (isNaN(nuevoServicio.precio) || nuevoServicio.precio < 0) {
      nuevosErrores.precio = "El precio debe ser un número mayor o igual a 0.";
    }

    setErrors(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const agregarServicio = async () => {
    if (validarFormulario()) {
      try {
        await axios.post(
          "http://127.0.0.1:8000/api/v1/servicios",
          nuevoServicio
        );
        obtenerServicios();
        limpiarFormulario();
      } catch (error) {
        console.error("Error al agregar servicio:", error);
      }
    }
  };

  const editarServicio = async () => {
    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/v1/servicios/${servicioActual.id}`, servicioActual);
      if (response.status === 200) {
        obtenerServicios();
        cerrarModal();
      } else {
        setApiError("Error al guardar los cambios. Por favor, inténtelo de nuevo.");
      }
    } catch (error) {
      console.error("Error al editar el servicio:", error);
      setApiError("Error al guardar los cambios. Por favor, inténtelo de nuevo.");
    }
  };

  const limpiarFormulario = () => {
    setNuevoServicio({
      empresa_id: user.id,
      nombre: "",
      descripcion: "",
      duracion: "",
      estado: "activo",
      precio: "",
    });
    setErrors({});
  };

  const abrirModal = (servicio) => {
    setServicioActual(servicio);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setServicioActual(null);
    setModalVisible(false);
    setApiError("");
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <BotonVolver onBack={handleBack} />
        <View style={styles.innerContainer}>
          <Text style={styles.title}>CRUD de Servicios</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agregar Servicio</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={nuevoServicio.nombre}
              onChangeText={(text) => handleInputChange("nombre", text)}
            />
            {errors.nombre && (
              <Text style={styles.errorText}>{errors.nombre}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={nuevoServicio.descripcion}
              onChangeText={(text) => handleInputChange("descripcion", text)}
            />
            {errors.descripcion && (
              <Text style={styles.errorText}>{errors.descripcion}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Duración (minutos)"
              keyboardType="numeric"
              value={nuevoServicio.duracion}
              onChangeText={(text) => handleInputChange("duracion", text)}
            />
            {errors.duracion && (
              <Text style={styles.errorText}>{errors.duracion}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Precio"
              keyboardType="numeric"
              value={nuevoServicio.precio}
              onChangeText={(text) => handleInputChange("precio", text)}
            />
            {errors.precio && (
              <Text style={styles.errorText}>{errors.precio}</Text>
            )}
            <View style={styles.buttonContainer}>
              <Button title="Agregar Servicio" onPress={agregarServicio} />
              <Button title="Limpiar" onPress={limpiarFormulario} color="gray" />
              <Button title="Recargar" onPress={obtenerServicios} color="gray" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lista de Servicios</Text>
            {servicios && servicios.length === 0 ? (
              <Text>No hay servicios disponibles.</Text>
            ) : (
              servicios.map((servicio) => (
                <ListItem key={servicio.id} bottomDivider>
                  <ListItem.Content>
                    <ListItem.Title>{servicio.nombre}</ListItem.Title>
                    <ListItem.Subtitle>{servicio.descripcion}</ListItem.Subtitle>
                    <Text>Duración: {servicio.duracion} minutos</Text>
                    <Badge
                      value={servicio.estado}
                      status={servicio.estado === "activo" ? "success" : "error"}
                    />
                  </ListItem.Content>
                  <View style={styles.actionButtons}>
                    <Button
                      title={servicio.estado === "activo" ? "Desactivar" : "Activar"}
                      onPress={() =>
                        servicio.estado === "activo"
                          ? desactivarServicio(servicio.id)
                          : activarServicio(servicio.id)
                      }
                      color={servicio.estado === "activo" ? "red" : "green"}
                    />
                    <Button
                      title="Editar"
                      onPress={() => abrirModal(servicio)}
                      color="orange"
                    />
                    <Button
                      title="Eliminar"
                      onPress={() => eliminarServicio(servicio.id)}
                      color="red"
                    />
                  </View>
                </ListItem>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Editar Servicio</Text>
          {servicioActual && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={servicioActual.nombre}
                onChangeText={(text) => handleEditInputChange("nombre", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Descripción"
                value={servicioActual.descripcion}
                onChangeText={(text) => handleEditInputChange("descripcion", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Duración (minutos)"
                keyboardType="numeric"
                value={servicioActual.duracion}
                onChangeText={(text) => handleEditInputChange("duracion", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Precio"
                keyboardType="numeric"
                value={servicioActual.precio}
                onChangeText={(text) => handleEditInputChange("precio", text)}
              />
              {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}
              <View style={styles.buttonContainer}>
                <Button title="Guardar Cambios" onPress={editarServicio} />
                <Button title="Cancelar" onPress={cerrarModal} color="gray" />
              </View>
            </>
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 5,
  },
  innerContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 10,
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  errorText: {
    color: "red",
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});

export default ServicioCrud;
