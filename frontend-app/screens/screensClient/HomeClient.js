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
import Config from "../Config";

const Home = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [empresas, setEmpresas] = useState([]);
  const [categorias, setCategorias] = useState({});
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDepartamento, setSelectedDepartamento] = useState('');
  const [selectedCiudad, setSelectedCiudad] = useState('');

  useEffect(() => {
    obtenerEmpresas();
    obtenerCategorias();
    fetchDepartamentos();
  }, [user]);

  const obtenerEmpresas = async () => {
    try {
      const response = await axios.get(`${Config.url()}/empresas`);
      setEmpresas(response.data.data);
    } catch (error) {
      console.error("Error al cargar empresas:", error);
    }
  };

  const obtenerCategorias = async () => {
    try {
      const response = await axios.get(`${Config.url()}/categorias`);
      const categoriasMap = {};
      response.data.forEach((cat) => {
        categoriasMap[cat.id] = cat.name;
      });
      setCategorias(categoriasMap);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const response = await axios.get(`${Config.url()}/departamentos`);
      setDepartamentos(response.data);
    } catch (error) {
      console.error("Error al cargar los departamentos:", error);
    }
  };

  const handleDepartamentoChange = async (value) => {
    setSelectedDepartamento(value);
    setSelectedCiudad(''); 
    try {
      const response = await axios.get(`${Config.url()}/departamento/ciudades/${value}`);
      setCiudades(response.data);
    } catch (error) {
      console.error("Error al cargar las ciudades:", error);
    }
  };

  const defaultImage = "https://via.placeholder.com/150";

  const filteredEmpresas = empresas.filter((empresa) => {
    const matchesSearchText = empresa.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === '' || empresa.categoria_id === parseInt(selectedCategory);
    const matchesDepartamento = selectedDepartamento === '' || empresa.departamento_id === parseInt(selectedDepartamento);
    const matchesCiudad = selectedCiudad === '' || empresa.ciudad_id === parseInt(selectedCiudad);
    return matchesSearchText && matchesCategory && matchesDepartamento && matchesCiudad;
  });

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedCategory('');
    setSelectedDepartamento('');
    setSelectedCiudad('');
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
      <Picker
        selectedValue={selectedDepartamento}
        style={styles.picker}
        onValueChange={(itemValue) => handleDepartamentoChange(itemValue)}
      >
        <Picker.Item label="Todos los departamentos" value="" />
        {departamentos.map((dept) => (
          <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
        ))}
      </Picker>
      <Picker
        selectedValue={selectedCiudad}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedCiudad(itemValue)}
        enabled={ciudades.length > 0}
      >
        <Picker.Item label="Todas las ciudades" value="" />
        {ciudades.map((ciudad) => (
          <Picker.Item key={ciudad.id} label={ciudad.name} value={ciudad.id} />
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
                <Text style={styles.cardCategory}>
                  Dirección: {item.address}
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
    backgroundColor: "#f0f4f7",
  },
  bienvenido: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1a73e8",
  },
  listTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
    color: "#444",
  },
  searchInput: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  picker: {
    height: 50,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  clearButton: {
    backgroundColor: '#34a853',
    padding: 12,
    borderRadius: 25,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1a73e8",
  },
  cardCategory: {
    fontSize: 16,
    color: "#555",
  },
  noEmpresasText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 16,
  },
});

export default Home;


// import React, { useState, useEffect, useContext } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   ScrollView,
//   Image,
//   TextInput,
//   Picker,
// } from "react-native";
// import { UserContext } from "../../contexts/UserContext";
// import axios from "axios";
// import Config from "../Config";

// const Home = ({ navigation }) => {
//   const { user } = useContext(UserContext);
//   const [empresas, setEmpresas] = useState([]);
//   const [categorias, setCategorias] = useState({});
//   const [searchText, setSearchText] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');


//   useEffect(() => {
//     obtenerEmpresas();
//     obtenerCategorias();
//   }, [user]);

//   const obtenerEmpresas = async () => {
//     try {
//       const response = await axios.get(`${Config.url()}/empresas`);
//       console.log("Empresas:", response.data); // Verifica los datos recibidos
//       setEmpresas(response.data.data); // Accede al array de empresas correctamente
//     } catch (error) {
//       console.error("Error al cargar empresas:", error);
//     }
//   };

//   const obtenerCategorias = async () => {
//     try {
//       const response = await axios.get(`${Config.url()}/categorias`);
//       console.log("Categorías:", response.data); // Verifica los datos recibidos
//       const categoriasMap = {};
//       response.data.forEach((cat) => {
//         categoriasMap[cat.id] = cat.name;
//       });
//       console.log("Mapeo de categorías:", categoriasMap); // Verifica el mapeo
//       setCategorias(categoriasMap); // Accede al array de categorías correctamente
//     } catch (error) {
//       console.error("Error al cargar categorías:", error);
//     }
//   };

//   const defaultImage = "https://via.placeholder.com/150";

//   const filteredEmpresas = empresas.filter((empresa) => {
//     const matchesSearchText = empresa.name.toLowerCase().includes(searchText.toLowerCase());
//     const matchesCategory = selectedCategory === '' || empresa.categoria_id === parseInt(selectedCategory);
//     return matchesSearchText && matchesCategory;
//   });

//   const handleClearFilters = () => {
//     setSearchText('');
//     setSelectedCategory('');
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.bienvenido}>Bienvenido, {user.name}</Text>
//       <TextInput
//         style={styles.searchInput}
//         placeholder="Buscar empresa..."
//         value={searchText}
//         onChangeText={setSearchText}
//       />
//       <Picker
//         selectedValue={selectedCategory}
//         style={styles.picker}
//         onValueChange={(itemValue) => setSelectedCategory(itemValue)}
//       >
//         <Picker.Item label="Todas las categorías" value="" />
//         {Object.keys(categorias).map((key) => (
//           <Picker.Item key={key} label={categorias[key]} value={key} />
//         ))}
//       </Picker>
//       <Pressable style={styles.clearButton} onPress={handleClearFilters}>
//         <Text style={styles.clearButtonText}>Limpiar Filtros</Text>
//       </Pressable>
//       <Text style={styles.listTitle}>Listado de empresas:</Text>
//       <ScrollView>
//         {filteredEmpresas.length === 0 ? (
//           <Text style={styles.noEmpresasText}>No hay empresas disponibles.</Text>
//         ) : (
//           filteredEmpresas.map((item) => (
//             <Pressable
//               key={item.id}
//               style={styles.card}
//               onPress={() =>
//                 navigation.navigate("VerEmpresa", { empresaId: item.id })
//               }
//             >
//               <Image
//                 source={{ uri: item.image || defaultImage }}
//                 style={styles.image}
//               />
//               <View style={styles.cardContent}>
//                 <Text style={styles.cardTitle}>{item.name}</Text>
//                 <Text style={styles.cardCategory}>
//                   Categoría: {categorias[item.categoria_id] || "Desconocida"}
//                 </Text>
//               </View>
//             </Pressable>
//           ))
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#f8f9fa", // Fondo claro para una mejor estética
//   },
//   bienvenido: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     color: "#333", // Texto oscuro para contraste
//   },
//   listTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 10,
//     color: "#555", // Texto ligeramente más claro
//   },
//   searchInput: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 10,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//     backgroundColor: '#fff',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   picker: {
//     height: 50,
//     marginBottom: 10,
//     backgroundColor: '#fff',
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   clearButton: {
//     backgroundColor: '#007BFF',
//     padding: 10,
//     borderRadius: 5,
//     marginBottom: 20,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   clearButtonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   card: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 10,
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//     flexDirection: "row", // Colocar imagen y texto en una fila
//     alignItems: "center", // Alinear contenido de la tarjeta verticalmente
//   },
//   image: {
//     width: 100,
//     height: 100,
//     borderRadius: 50, // Hacer la imagen redonda
//     marginRight: 15,
//   },
//   cardContent: {
//     flex: 1,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 5,
//     color: "#333",
//   },
//   cardCategory: {
//     fontSize: 16,
//     color: "#777",
//   },
//   noEmpresasText: {
//     textAlign: 'center',
//     color: '#777',
//     marginTop: 20,
//   },
// });

// export default Home;
