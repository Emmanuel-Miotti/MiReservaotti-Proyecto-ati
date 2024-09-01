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
  Pressable,
  Modal
} from "react-native";
import { ListItem, Badge } from "react-native-elements";
import axios from "axios";
import BotonCancelar from "../components/BotonCancelar";
import BotonVolver from "../components/BotonVolver";

const ProductoCrud = ({ navigation }) => {
  const user = useContext(UserContext).user;
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    empresa_id: user.id,
    nombre: "",
    descripcion: "",
    precio: "",
    estado: "activo",
    stock: "",
    foto: null,
  });
  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [productoActual, setProductoActual] = useState(null);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/v1/empresas/${user.id}/productos`
      );
      setProductos(response.data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  const desactivarProducto = async (id) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/v1/productos/${id}/desactivar`
      );
      setProductos(
        productos.map((producto) =>
          producto.id === id ? { ...producto, estado: "desactivado" } : producto
        )
      );
    } catch (error) {
      console.error("Error al desactivar el producto:", error);
    }
  };

  const activarProducto = async (id) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/v1/productos/${id}/activar`);
      setProductos(
        productos.map((producto) =>
          producto.id === id ? { ...producto, estado: "activo" } : producto
        )
      );
    } catch (error) {
      console.error("Error al activar el producto:", error);
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/productos/${id}`);
      setProductos(productos.filter((producto) => producto.id !== id));
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  };

  const handleInputChange = (name, value) => {
    setNuevoProducto((prevProducto) => ({
      ...prevProducto,
      [name]: value,
    }));
  };

  const handleEditInputChange = (name, value) => {
    setProductoActual((prevProducto) => ({
      ...prevProducto,
      [name]: value,
    }));
  };

  const handleFileChange = (name, file) => {
    setNuevoProducto((prevProducto) => ({
      ...prevProducto,
      [name]: file,
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!nuevoProducto.nombre) {
      nuevosErrores.nombre = "El campo nombre es obligatorio.";
    } else if (nuevoProducto.nombre.length > 255) {
      nuevosErrores.nombre = "El nombre no puede tener más de 255 caracteres.";
    }

    if (!nuevoProducto.descripcion) {
      nuevosErrores.descripcion = "El campo descripción es obligatorio.";
    }

    if (!nuevoProducto.precio) {
      nuevosErrores.precio = "El campo precio es obligatorio.";
    } else if (isNaN(nuevoProducto.precio) || nuevoProducto.precio < 0) {
      nuevosErrores.precio = "El precio debe ser un número mayor o igual a 0.";
    }

    if (!nuevoProducto.stock) {
      nuevosErrores.stock = "El campo stock es obligatorio.";
    } else if (isNaN(nuevoProducto.stock) || nuevoProducto.stock < 0) {
      nuevosErrores.stock = "El stock debe ser un número mayor o igual a 0.";
    }

    setErrors(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const agregarProducto = async () => {
    if (validarFormulario()) {
      try {
        const formData = new FormData();
        Object.keys(nuevoProducto).forEach((key) => {
          formData.append(key, nuevoProducto[key]);
        });
        await axios.post(
          `http://127.0.0.1:8000/api/v1/productos`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        obtenerProductos();
        limpiarFormulario();
      } catch (error) {
        console.error("Error al agregar producto:", error);
      }
    }
  };

  const editarProducto = async () => {
    try {
      const formData = new FormData();
      Object.keys(productoActual).forEach((key) => {
        formData.append(key, productoActual[key]);
      });
      const response = await axios.put(
        `http://127.0.0.1:8000/api/v1/productos/${productoActual.id}`,
        formData
      );
      if (response.status === 200) {
        obtenerProductos();
        cerrarModal();
      } else {
        setApiError("Error al guardar los cambios. Por favor, inténtelo de nuevo.");
      }
    } catch (error) {
      console.error("Error al editar el producto:", error);
      setApiError("Error al guardar los cambios. Por favor, inténtelo de nuevo.");
    }
  };

  const limpiarFormulario = () => {
    setNuevoProducto({
      empresa_id: user.id,
      nombre: "",
      descripcion: "",
      precio: "",
      estado: "activo",
      stock: "",
      foto: null,
    });
    setErrors({});
  };

  const abrirModal = (producto) => {
    setProductoActual(producto);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setProductoActual(null);
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
          <Text style={styles.title}>CRUD de Productos</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agregar Producto</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={nuevoProducto.nombre || ''}
              onChangeText={(text) => handleInputChange("nombre", text)}
            />
            {errors.nombre && (
              <Text style={styles.errorText}>{errors.nombre}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={nuevoProducto.descripcion || ''}
              onChangeText={(text) => handleInputChange("descripcion", text)}
            />
            {errors.descripcion && (
              <Text style={styles.errorText}>{errors.descripcion}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Precio"
              keyboardType="numeric"
              value={nuevoProducto.precio || ''}
              onChangeText={(text) => handleInputChange("precio", text)}
            />
            {errors.precio && (
              <Text style={styles.errorText}>{errors.precio}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Stock"
              keyboardType="numeric"
              value={nuevoProducto.stock || ''}
              onChangeText={(text) => handleInputChange("stock", text)}
            />
            {errors.stock && (
              <Text style={styles.errorText}>{errors.stock}</Text>
            )}
            <input
              type="file"
              onChange={(e) => handleFileChange("foto", e.target.files[0])}
            />

            <View style={styles.buttonContainer}>
              <Button title="Agregar Producto" onPress={agregarProducto} />
              <Button
                title="Limpiar"
                onPress={limpiarFormulario}
                color="gray"
              />
              <Button
                title="Recargar"
                onPress={obtenerProductos}
                color="gray"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lista de Productos</Text>
            {productos && productos.length === 0 ? (
              <Text>No hay productos disponibles.</Text>
            ) : (
              productos.map((producto) => (
                <ListItem key={producto.id} bottomDivider>
                  <ListItem.Content>
                    <ListItem.Title>{producto.nombre}</ListItem.Title>
                    <ListItem.Subtitle>
                      {producto.descripcion}
                    </ListItem.Subtitle>
                    <Text>Precio: ${producto.precio}</Text>
                    <Badge
                      value={producto.estado}
                      status={
                        producto.estado === "activo" ? "success" : "error"
                      }
                    />
                  </ListItem.Content>
                  <View style={styles.actionButtons}>
                    <Button
                      title={
                        producto.estado === "activo" ? "Desactivar" : "Activar"
                      }
                      onPress={() =>
                        producto.estado === "activo"
                          ? desactivarProducto(producto.id)
                          : activarProducto(producto.id)
                      }
                      color={producto.estado === "activo" ? "red" : "green"}
                    />
                    <Button
                      title="Editar"
                      onPress={() => abrirModal(producto)}
                      color="blue"
                    />
                    <Button
                      title="Eliminar"
                      onPress={() => eliminarProducto(producto.id)}
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
          <Text style={styles.title}>Editar Producto</Text>
          {productoActual && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={productoActual.nombre}
                onChangeText={(text) => handleEditInputChange("nombre", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Descripción"
                value={productoActual.descripcion}
                onChangeText={(text) => handleEditInputChange("descripcion", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Precio"
                keyboardType="numeric"
                value={productoActual.precio}
                onChangeText={(text) => handleEditInputChange("precio", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Stock"
                keyboardType="numeric"
                value={productoActual.stock}
                onChangeText={(text) => handleEditInputChange("stock", text)}
              />
              <input
                type="file"
                onChange={(e) => handleFileChange("foto", e.target.files[0])}
              />
              {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}
              <View style={styles.buttonContainer}>
                <Button title="Guardar Cambios" onPress={editarProducto} />
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

export default ProductoCrud;
