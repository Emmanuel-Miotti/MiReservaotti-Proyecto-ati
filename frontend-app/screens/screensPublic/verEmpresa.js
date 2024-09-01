import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import Config from "../Config";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../../contexts/UserContext";
import Icon from "react-native-vector-icons/FontAwesome";

const VerEmpresa = () => {
  const { user } = useContext(UserContext);
  const [empresa, setEmpresa] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingReview, setEditingReview] = useState(null);
  const [hasReservation, setHasReservation] = useState(false);
  const [intervalos, setIntervalos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const empresaId = route.params.empresaId;

  useEffect(() => {
    obtenerEmpresa();
    obtenerServicios();
    obtenerFavoritos();
    verificarReserva();
    obtenerReviews();
    obtenerIntervalos();
    fetchProductos();  // Asegúrate de llamar correctamente a fetchProductos
  }, [empresaId]);

  const obtenerEmpresa = async () => {
    try {
      const response = await axios.get(
        `${Config.url()}/verempresa/${empresaId}`
      );
      setEmpresa(response.data.data);
    } catch (error) {
      console.error("Error al cargar Empresa:", error);
    }
  };

  const fetchProductos = async () => {
    try {
      setCargando(true);
      const response = await axios.get(
        `${Config.url()}/empresas/${empresaId}/productosActivos`
      );
      setProductos(response.data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setCargando(false);
    }
  };

  const obtenerServicios = async () => {
    try {
      const response = await axios.get(
        `${Config.url()}/servicios/empresa/${empresaId}`
      );
      const serviciosActivos = response.data.filter(
        (servicio) => servicio.estado === "activo"
      );
      setServicios(serviciosActivos);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  const verificarReserva = async () => {
    if (!user) return;
    try {
      const response = await axios.get(
        `${Config.url()}/reservas/${empresaId}/${user.id}`
      );
      if (response.data && response.data.data) {
        setHasReservation(response.data.data.length > 0);
      } else {
        setHasReservation(false);
      }
    } catch (error) {
      console.error(
        "Error al verificar la reserva:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const obtenerReviews = async () => {
    try {
      const response = await axios.get(
        `${Config.url()}/empresa/${empresaId}/reviews`
      );
      setReviews(response.data.data || []);
      if (user) {
        const userReview = response.data.data.find(
          (review) => review.cliente_id === user.id
        );
        if (userReview) {
          setEditingReview(userReview);
          setRating(userReview.rating);
          setComment(userReview.comment);
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error("No se encontraron comentarios para esta empresa.");
        setReviews([]);
      } else {
        console.error("Error al cargar los comentarios:", error.message);
      }
    }
  };

  const obtenerFavoritos = async () => {
    if (!user) return;
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No token available");
        return;
      }
      const response = await axios.get(`${Config.url()}/favoritos/${user.id}`);
      setFavoritos(response.data.data);
    } catch (error) {
      console.error("Error al cargar favoritos:", error.message);
    }
  };

  const agregarAFavoritos = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No token available");
        return;
      }
      await axios.post(
        `${Config.url()}/favoritos`,
        { cliente_id: user.id, empresa_id: empresa.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      obtenerFavoritos();
    } catch (error) {
      console.error(
        "Error al agregar a favoritos:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const eliminarDeFavoritos = async () => {
    try {
      const favorito = favoritos.find(
        (favorito) => favorito.empresa_id === empresa.id
      );
      await axios.delete(`${Config.url()}/favoritos/${favorito.id}`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
        },
      });
      obtenerFavoritos();
    } catch (error) {
      console.error("Error al eliminar de favoritos:", error);
    }
  };

  const esFavorito = () => {
    return favoritos.some((favorito) => favorito.empresa_id === empresa.id);
  };

  const toggleFavorito = () => {
    if (esFavorito()) {
      eliminarDeFavoritos();
    } else {
      agregarAFavoritos();
    }
  };

  const hacerReserva = () => {
    navigation.navigate("Reserva", { id: empresa.id });
  };

  const comprarProducto = () => {
    navigation.navigate("ComprarProducto", { id: empresa.id });
  };

  const enviarComentario = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert(
          "Error",
          "Necesitas estar logueado para enviar un comentario."
        );
        return;
      }

      const reviewData = {
        cliente_id: user.id,
        empresa_id: empresa.id,
        rating,
        comment,
      };

      if (editingReview) {
        await axios.put(
          `${Config.url()}/reviews/${editingReview.id}`,
          reviewData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Alert.alert(
          "Comentario actualizado",
          "Tu comentario ha sido actualizado."
        );
      } else {
        await axios.post(`${Config.url()}/reviews`, reviewData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        Alert.alert("Comentario enviado", "Tu comentario ha sido enviado.");
      }

      obtenerReviews();
    } catch (error) {
      console.error("Error al enviar comentario:", error);
      Alert.alert("Error", "Ocurrió un error al enviar tu comentario.");
    }
  };

  const obtenerIntervalos = async () => {
    try {
      const response = await axios.get(
        `${Config.url()}/intervalos/empresa/${empresaId}`
      );
      setIntervalos(response.data.data);
    } catch (error) {
      console.error("Error al cargar intervalos:", error.message);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => setRating(i)}>
          <Icon
            name="star"
            size={30}
            color={i <= rating ? "#ffcc00" : "#ccc"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  if (!empresa) {
    return (
      <ActivityIndicator size="large" color="#1a73e8" style={styles.loading} />
    );
  }

  const parseDiasSemanas = (dias) => {
    try {
      return JSON.parse(dias).join(", ");
    } catch (error) {
      console.error("Error parsing dias_semanas:", error);
      return dias;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Datos de la Empresa</Text>
      </View>

      <TouchableOpacity onPress={toggleFavorito} style={styles.starContainer}>
        <Icon
          name={esFavorito() ? "star" : "star-o"}
          size={30}
          color={esFavorito() ? "#ffd700" : "gray"}
        />
      </TouchableOpacity>

      <View style={styles.empresaContainer}>
        <Image
          source={{
            uri: empresa.perfilUrl || "https://via.placeholder.com/150",
          }}
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Nombre:</Text> {empresa.name}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Dirección:</Text> {empresa.address}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Teléfono:</Text> {empresa.cellphone}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Email:</Text> {empresa.email}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.reservaButton,
            intervalos.length === 0 && styles.disabledButton,
          ]}
          onPress={intervalos.length === 0 ? null : hacerReserva}
          disabled={intervalos.length === 0}
        >
          <Text style={styles.buttonText}>Reservar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.productoButton,
            productos.length === 0 && styles.disabledButton,
          ]}
          onPress={productos.length === 0 ? null : comprarProducto}
          disabled={productos.length === 0}
        >
          <Text style={styles.buttonText}>Productos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.volverButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Servicios</Text>
        {servicios.length > 0 ? (
          servicios.map((servicio) => (
            <View key={servicio.id} style={styles.serviceCard}>
              <Text style={styles.serviceText}>
                <Text style={styles.label}>{servicio.nombre}</Text> - Duración:{" "}
                {servicio.duracion} minutos
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.sectionText}>No hay servicios disponibles.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Horarios</Text>
        {intervalos.length > 0 ? (
          intervalos.map((intervalo, index) => (
            <Text key={index} style={styles.sectionText}>
              {parseDiasSemanas(intervalo.dias_semanas)} :{" "}
              {intervalo.hora_inicio} - {intervalo.hora_fin}
            </Text>
          ))
        ) : (
          <Text style={styles.sectionText}>No hay horarios disponibles.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Ubicación</Text>
        <Image
          source={{ uri: "https://via.placeholder.com/600x400" }}
          style={styles.mapImage}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Comentarios y Calificaciones</Text>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <View key={review.id} style={styles.commentBox}>
              <Image
                source={{ uri: "https://via.placeholder.com/50" }}
                style={styles.profileImage}
              />
              <View style={styles.commentContent}>
                <View style={styles.commentRating}>
                  <Text style={styles.commentAuthor}>
                    {review.cliente ? review.cliente.name : "Cliente"}
                  </Text>
                  <Icon name="star" size={20} color="#ffcc00" />
                  <Text>{review.rating}</Text>
                </View>
                <Text style={styles.commentText}>{review.comment}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text>No hay comentarios disponibles.</Text>
        )}

        {user && user.role === "cliente" ? (
          hasReservation ? (
            <View style={styles.reviewForm}>
              <Text style={styles.reviewTitle}>
                {editingReview ? "Editar Comentario" : "Añadir Comentario"}
              </Text>
              <View style={styles.formGroup}>
                <Text>Calificación</Text>
                <View style={styles.starsContainer}>{renderStars()}</View>
              </View>
              <View style={styles.formGroup}>
                <Text>Comentario</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  value={comment}
                  onChangeText={setComment}
                />
              </View>
              <TouchableOpacity
                style={[styles.button, styles.enviarButton]}
                onPress={enviarComentario}
              >
                <Text style={styles.buttonText}>
                  {editingReview ? "Actualizar" : "Enviar"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.noteText}>
              Debe tener una reserva con la empresa para poder dejar un
              comentario.
            </Text>
          )
        ) : (
          <Text style={styles.noteText}>
            Debe estar logueado para añadir un comentario.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a73e8",
  },
  empresaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  infoContainer: {
    flex: 1,
  },
  infoText: {
    marginBottom: 10,
    fontSize: 16,
    color: "#333",
  },
  label: {
    fontWeight: "bold",
    color: "#555",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  button: {
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    width: "30%",
  },
  productoButton: {
    backgroundColor: "#fbc02d", // Amarillo
  },
  volverButton: {
    backgroundColor: "#e53935", // Rojo
  },
  enviarButton: {
    backgroundColor: "#1a73e8", // Azul para el botón de enviar
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1a73e8",
  },
  sectionText: {
    marginBottom: 5,
    fontSize: 16,
    color: "#333",
  },
  serviceCard: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  mapImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  commentBox: {
    flexDirection: "row",
    marginBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentRating: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  commentAuthor: {
    fontWeight: "bold",
    marginRight: 5,
  },
  commentText: {
    color: "#555",
  },
  reviewForm: {
    marginTop: 20,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1a73e8",
  },
  formGroup: {
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  textInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  starContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  noteText: {
    color: "#777",
    marginTop: 10,
    fontSize: 14,
    textAlign: "center",
  },
  reservaButton: {
    backgroundColor: "#43a047", // Verde cuando está habilitado
  },
  disabledButton: {
    backgroundColor: "#cccccc", // Gris cuando está deshabilitado
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default VerEmpresa;

