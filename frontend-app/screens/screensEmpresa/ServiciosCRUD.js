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
import BotonVolver from "../components/BotonVolver"; 
import Config from '../Config';

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
        `${Config.url()}/servicios/empresa/${user.id}`
      );
      setServicios(response.data);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  const desactivarServicio = async (id) => {
    try {
      await axios.put(`${Config.url()}/servicios/${id}/desactivar`);
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
      await axios.put(`${Config.url()}/servicios/${id}/activar`);
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
      await axios.delete(`${Config.url()}/servicios/${id}`);
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
          `${Config.url()}/servicios`,
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
      const response = await axios.put(`${Config.url()}/servicios/${servicioActual.id}`, servicioActual);
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
                <ListItem key={servicio.id} bottomDivider style={styles.listItem}>
                  <ListItem.Content>
                    <View style={styles.servicioInfo}>
                      <ListItem.Title style={styles.servicioTexto}>{servicio.nombre}</ListItem.Title>
                      <ListItem.Subtitle style={styles.servicioTexto}>{servicio.descripcion}</ListItem.Subtitle>
                      <Text style={styles.servicioTexto}>Duración: {servicio.duracion} minutos</Text>
                    </View>
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
                  </ListItem.Content>
                  <Badge
                    value={servicio.estado}
                    status={servicio.estado === "activo" ? "success" : "error"}
                    containerStyle={styles.estadoBadge}
                  />
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
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 15,
  },
  innerContainer: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#343a40",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 22,
    marginBottom: 15,
    fontWeight: "bold",
    color: "#495057",
  },
  input: {
    height: 50,
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderColor: "#ced4da",
    borderWidth: 1,
    fontSize: 16,
    color: "#495057",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#28a745", // Verde
  },
  clearButton: {
    backgroundColor: "#6c757d", // Gris
  },
  reloadButton: {
    backgroundColor: "#007bff", // Azul
  },
  listItemTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
  },
  listItemSubtitle: {
    fontSize: 14,
    color: "#6c757d",
  },
  listItemText: {
    fontSize: 16,
    color: "#495057",
  },
  actionButtons: {
    flexDirection: "column", // Cambiado de 'row' a 'column' para alineación vertical
    marginTop: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5, // Aumentado de horizontal a vertical
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  deactivateButton: {
    backgroundColor: "#dc3545", // Rojo
  },
  activateButton: {
    backgroundColor: "#28a745", // Verde
  },
  editButton: {
    backgroundColor: "#ffc107", // Amarillo
  },
  deleteButton: {
    backgroundColor: "#dc3545", // Rojo
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  saveButton: {
    backgroundColor: "#28a745", // Verde
  },
  cancelButton: {
    backgroundColor: "#6c757d", // Gris
  },
  emptyText: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});


export default ServicioCrud;
