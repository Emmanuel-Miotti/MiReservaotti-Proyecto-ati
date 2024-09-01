import React, { useState, useEffect, useContext } from "react";
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
  Modal,
} from "react-native";
import { ListItem, Badge } from "react-native-elements";
import axios from "axios";
import { UserContext } from "../../contexts/UserContext";
import BotonVolver from "../components/BotonVolver";
import Config from '../Config';

const ProductoCrud = ({ navigation }) => {
  // Obtener el usuario actual del contexto
  const user = useContext(UserContext).user;

  // Estados para manejar los productos y formularios
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    empresa_id: user.id,
    nombre: "",
    descripcion: "",
    precio: "",
    estado: "activo",
    stock: "",
    foto: null, // Se mantiene en null ya que no manejamos fotos
  });
  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [productoActual, setProductoActual] = useState(null);
  const [apiError, setApiError] = useState("");

  // Obtener la lista de productos al montar el componente
  useEffect(() => {
    obtenerProductos();
  }, []);

  // Función para obtener los productos desde el backend
  const obtenerProductos = async () => {
    try {
      const response = await axios.get(
        `${Config.url()}/empresas/${user.id}/productos`
      );
      setProductos(response.data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  // Función para actualizar el estado (activo/inactivo) de un producto
  const actualizarEstadoProducto = async (id, estadoActual) => {
    // Determinar el nuevo estado
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";

    // Encontrar el producto actual en la lista
    const producto = productos.find((prod) => prod.id === id);

    if (!producto) {
      console.error("Producto no encontrado");
      return;
    }

    // Construir el objeto con todos los campos requeridos
    const productoActualizado = {
      empresa_id: producto.empresa_id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      estado: nuevoEstado,
      foto: null, // Mantener en null
    };

    try {
      await axios.put(`${Config.url()}/productos/${id}`, productoActualizado);
      // Actualizar el estado local con el nuevo estado del producto
      setProductos(
        productos.map((prod) =>
          prod.id === id ? { ...prod, estado: nuevoEstado } : prod
        )
      );
    } catch (error) {
      console.error("Error al actualizar el estado del producto:", error);
    }
  };

  // Función para eliminar un producto
  const eliminarProducto = async (id) => {
    try {
      await axios.delete(`${Config.url()}/productos/${id}`);
      setProductos(productos.filter((producto) => producto.id !== id));
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  };

  // Manejar cambios en los campos del formulario de nuevo producto
  const handleInputChange = (name, value) => {
    setNuevoProducto((prevProducto) => ({
      ...prevProducto,
      [name]: value,
    }));
  };

  // Manejar cambios en los campos del formulario de edición
  const handleEditInputChange = (name, value) => {
    setProductoActual((prevProducto) => ({
      ...prevProducto,
      [name]: value,
    }));
  };

  // Validar el formulario de nuevo producto
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

  // Función para agregar un nuevo producto
  const agregarProducto = async () => {
    if (validarFormulario()) {
      try {
        const nuevoProductoSinFoto = { ...nuevoProducto, foto: null };
        await axios.post(
          `${Config.url()}/productos`,
          nuevoProductoSinFoto
        );
        obtenerProductos();
        limpiarFormulario();
      } catch (error) {
        console.error("Error al agregar producto:", error);
      }
    }
  };

  // Función para editar un producto existente
  const editarProducto = async () => {
    try {
      const productoEditadoSinFoto = { ...productoActual, foto: null };
      const response = await axios.put(
        `${Config.url()}/productos/${productoActual.id}`,
        productoEditadoSinFoto
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

  // Función para limpiar el formulario de nuevo producto
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

  // Funciones para abrir y cerrar el modal de edición
  const abrirModal = (producto) => {
    setProductoActual(producto);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setProductoActual(null);
    setModalVisible(false);
    setApiError("");
  };

  // Función para manejar el botón de volver
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
          <Text style={styles.title}>Gestión de Productos</Text>
          
          {/* Sección para agregar nuevo producto */}
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

            <View style={styles.buttonContainer}>
              <Pressable style={[styles.button, styles.addButton]} onPress={agregarProducto}>
                <Text style={styles.buttonText}>Agregar Producto</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.clearButton]} onPress={limpiarFormulario}>
                <Text style={styles.buttonText}>Limpiar</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.reloadButton]} onPress={obtenerProductos}>
                <Text style={styles.buttonText}>Recargar</Text>
              </Pressable>
            </View>
          </View>

          {/* Sección para listar productos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lista de Productos</Text>
            {productos && productos.length === 0 ? (
              <Text style={styles.emptyText}>No hay productos disponibles.</Text>
            ) : (
              productos.map((producto) => (
                <ListItem key={producto.id} bottomDivider>
                  <ListItem.Content>
                    <ListItem.Title style={styles.listItemTitle}>{producto.nombre}</ListItem.Title>
                    <ListItem.Subtitle style={styles.listItemSubtitle}>
                      {producto.descripcion}
                    </ListItem.Subtitle>
                    <Text style={styles.listItemText}>Precio: ${producto.precio}</Text>
                    <Text style={styles.listItemText}>Stock: {producto.stock}</Text> {/* Mostrar el stock */}
                    <Badge
                      value={producto.estado === "activo" ? "Activo" : "Inactivo"}
                      status={producto.estado === "activo" ? "success" : "error"}
                    />
                  </ListItem.Content>
                  <View style={styles.actionButtons}>
                    <Pressable
                      style={[styles.actionButton, producto.estado === "activo" ? styles.deactivateButton : styles.activateButton]}
                      onPress={() =>
                        actualizarEstadoProducto(producto.id, producto.estado)
                      }
                    >
                      <Text style={styles.actionButtonText}>
                        {producto.estado === "activo" ? "Desactivar" : "Activar"}
                      </Text>
                    </Pressable>
                    <Pressable style={[styles.actionButton, styles.editButton]} onPress={() => abrirModal(producto)}>
                      <Text style={styles.actionButtonText}>Editar</Text>
                    </Pressable>
                    <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={() => eliminarProducto(producto.id)}>
                      <Text style={styles.actionButtonText}>Eliminar</Text>
                    </Pressable>
                  </View>
                </ListItem>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal para editar producto */}
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
                value={productoActual.precio.toString()}
                onChangeText={(text) => handleEditInputChange("precio", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Stock"
                keyboardType="numeric"
                value={productoActual.stock.toString()}
                onChangeText={(text) => handleEditInputChange("stock", text)}
              />
              {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}
              <View style={styles.buttonContainer}>
                <Pressable style={[styles.button, styles.saveButton]} onPress={editarProducto}>
                  <Text style={styles.buttonText}>Guardar Cambios</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.cancelButton]} onPress={cerrarModal}>
                  <Text style={styles.buttonText}>Cancelar</Text>
                </Pressable>
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
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: "column",
    marginTop: 10,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5,
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

export default ProductoCrud;
