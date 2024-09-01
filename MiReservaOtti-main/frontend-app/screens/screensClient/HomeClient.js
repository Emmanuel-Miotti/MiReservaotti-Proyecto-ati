import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  TextInput,
  Picker,
} from "react-native";
import { UserContext } from "../../contexts/UserContext";
import axios from "axios";

const Home = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [empresas, setEmpresas] = useState([]);
  const [categorias, setCategorias] = useState({});
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    obtenerEmpresas();
    obtenerCategorias();
  }, []);

  const obtenerEmpresas = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/v1/empresas");
      console.log("Empresas:", response.data); // Verifica los datos recibidos
      setEmpresas(response.data.data); // Accede al array de empresas correctamente
    } catch (error) {
      console.error("Error al cargar empresas:", error);
    }
  };

  const obtenerCategorias = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/v1/categorias");
      console.log("Categorías:", response.data); // Verifica los datos recibidos
      const categoriasMap = {};
      response.data.forEach((cat) => {
        categoriasMap[cat.id] = cat.name;
      });
      console.log("Mapeo de categorías:", categoriasMap); // Verifica el mapeo
      setCategorias(categoriasMap); // Accede al array de categorías correctamente
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const defaultImage = "https://via.placeholder.com/150";

  const filteredEmpresas = empresas.filter((empresa) => {
    const matchesSearchText = empresa.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === '' || empresa.categoria_id === parseInt(selectedCategory);
    return matchesSearchText && matchesCategory;
  });

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedCategory('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.bienvenido}>Bienvenido, {user.name}</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar empresa..."
        value={searchText}
        onChangeText={setSearchText}
      />
      <Picker
        selectedValue={selectedCategory}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
      >
        <Picker.Item label="Todas las categorías" value="" />
        {Object.keys(categorias).map((key) => (
          <Picker.Item key={key} label={categorias[key]} value={key} />
        ))}
      </Picker>
      <Pressable style={styles.clearButton} onPress={handleClearFilters}>
        <Text style={styles.clearButtonText}>Limpiar Filtros</Text>
      </Pressable>
      <Text style={styles.listTitle}>Listado de empresas:</Text>
      <ScrollView>
        {filteredEmpresas.length === 0 ? (
          <Text style={styles.noEmpresasText}>No hay empresas disponibles.</Text>
        ) : (
          filteredEmpresas.map((item) => (
            <Pressable
              key={item.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate("VerEmpresa", { empresaId: item.id })
              }
            >
              <Image
                source={{ uri: item.image || defaultImage }}
                style={styles.image}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardCategory}>
                  Categoría: {categorias[item.categoria_id] || "Desconocida"}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa", // Fondo claro para una mejor estética
  },
  bienvenido: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333", // Texto oscuro para contraste
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#555", // Texto ligeramente más claro
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  picker: {
    height: 50,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  clearButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: "row", // Colocar imagen y texto en una fila
    alignItems: "center", // Alinear contenido de la tarjeta verticalmente
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50, // Hacer la imagen redonda
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  cardCategory: {
    fontSize: 16,
    color: "#777",
  },
  noEmpresasText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
});

export default Home;
