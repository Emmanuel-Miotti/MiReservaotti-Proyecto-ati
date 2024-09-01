// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Button,
//   Image,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
// } from "react-native";
// // import Config from "../Config";
// import axios from "axios";
// import { useNavigation, useRoute } from "@react-navigation/native";

// const VerEmpresa = () => {
//   const [empresa, setEmpresa] = useState(null);
//   const [servicios, setServicios] = useState([]);
//   const navigation = useNavigation();
//   const route = useRoute();

//   const empresaId = 1;

//   useEffect(() => {
//     obtenerEmpresa();
//     obtenerServicios();
//   }, []);

//   const obtenerEmpresa = async () => {
//     try {
//       //   const response = await Config.getEmpresaId(1);
//       const response = await axios.get(
//         `http://127.0.0.1:8000/api/v1/verempresa/1`
//       );
//       setEmpresa(response.data.data);
//     } catch (error) {
//       console.error("Error al cargar Empresa:", error);
//     }
//   };
//   const obtenerServicios = async () => {
//     try {
//       //   const response = await Config.getServicesByEmpresa(empresaId);
//       const response = await axios.get(
//         `http://127.0.0.1:8000/api/v1/servicios/empresa/1`
//       );
//       // setServicios(response.data);
//       //Guarda solo los servicios activos
//       const serviciosActivos = response.data.filter(servicio => servicio.estado === 'activo');
//       setServicios(serviciosActivos);
//     } catch (error) {
//       console.error("Error al cargar servicios:", error);
//     }
//   };

//   const hacerReserva = () => {
//     navigation.navigate("Reserva", { id: empresa.id });
//   };

//   if (!empresa) {
//     return (
//       <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerText}>Datos de la Empresa</Text>
//       </View>
//       <View style={styles.empresaContainer}>
//         <Image
//           source={{
//             uri: empresa.perfilUrl || "https://via.placeholder.com/150",
//           }}
//           style={styles.image}
//         />
//         <View style={styles.infoContainer}>
//           <Text style={styles.infoText}>
//             <Text style={styles.label}>Nombre:</Text> {empresa.name}
//           </Text>
//           <Text style={styles.infoText}>
//             <Text style={styles.label}>Dirección:</Text> {empresa.address}
//           </Text>
//           <Text style={styles.infoText}>
//             <Text style={styles.label}>Teléfono:</Text> {empresa.cellphone}
//           </Text>
//           <Text style={styles.infoText}>
//             <Text style={styles.label}>Email:</Text> {empresa.email}
//           </Text>
//         </View>
//       </View>
//       <View style={styles.buttonContainer}>
//         <Button title="Reservar" onPress={hacerReserva} />
//         <Button
//           title="Volver"
//           onPress={() => navigation.goBack()}
//           color="gray"
//         />
//       </View>
//       <View style={styles.section}>
//         <Text style={styles.sectionHeader}>Servicios</Text>
//         {servicios.length > 0 ? (
//           servicios.map((servicio) => (
//             <Text key={servicio.id} style={styles.sectionText}>
//               <Text style={styles.label}>{servicio.nombre}</Text>:{" "}
//               {servicio.description} - ${servicio.precio} - Duración:{" "}
//               {servicio.duracion} minutos
//             </Text>
//           ))
//         ) : (
//           <Text style={styles.sectionText}>No hay servicios disponibles.</Text>
//         )}
//       </View>
//       <View style={styles.section}>
//         <Text style={styles.sectionHeader}>Horarios</Text>
//         {empresa.horarios && empresa.horarios.length > 0 ? (
//           empresa.horarios.map((horario) => (
//             <Text key={horario.id} style={styles.sectionText}>
//               <Text style={styles.label}>{horario.dia}</Text>:{" "}
//               {horario.hora_inicio} - {horario.hora_fin}
//             </Text>
//           ))
//         ) : (
//           <Text style={styles.sectionText}>No hay horarios disponibles.</Text>
//         )}
//       </View>
//       <View style={styles.section}>
//         <Text style={styles.sectionHeader}>Ubicación</Text>
//         <Image
//           source={{ uri: "https://via.placeholder.com/600x400" }}
//           style={styles.mapImage}
//         />
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 16,
//     backgroundColor: "white",
//   },
//   header: {
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   headerText: {
//     fontSize: 24,
//     fontWeight: "bold",
//   },
//   empresaContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   image: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginRight: 20,
//   },
//   infoContainer: {
//     flex: 1,
//   },
//   infoText: {
//     marginBottom: 10,
//   },
//   label: {
//     fontWeight: "bold",
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 20,
//   },
//   section: {
//     marginBottom: 20,
//   },
//   sectionHeader: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   sectionText: {
//     marginBottom: 5,
//   },
//   mapImage: {
//     width: "100%",
//     height: 200,
//     borderRadius: 10,
//   },
//   loading: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

// export default VerEmpresa;


import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet,  Platform, Alert  } from 'react-native';
import { Linking } from 'react-native';
import { WebView } from 'react-native-webview';

const VerEmpresa = () => {
    const [productos, setProductos] = useState([]);
    const [cantidades, setCantidades] = useState({});
    const [carrito, setCarrito] = useState({});
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [url, setUrl] = useState('');
    const [showWebView, setShowWebView] = useState(false);

    useEffect(() => {
        // Simula la carga de productos
        const cargarProductos = async () => {
            // Aquí iría el código para cargar productos desde tu backend
            const productosCargados = [
                { id: 1, nombre: 'Shampoo', precio: 150 },
                { id: 2, nombre: 'Acondicionador', precio: 200 },
            ];
            setProductos(productosCargados);
            const initialCantidades = productosCargados.reduce((acc, item) => {
                acc[item.id] = 1; // Cantidad inicial para cada producto
                return acc;
            }, {});
            setCantidades(initialCantidades);
        };
        cargarProductos();
    }, []);

    const handleCantidadChange = (productoId, cantidad) => {
        setCantidades(prev => ({
            ...prev,
            [productoId]: Number(cantidad)
        }));
    };

    const agregarAlCarrito = (productoId) => {
        const producto = productos.find(p => p.id === productoId);
        if (producto) {
            setCarrito(prev => ({
                ...prev,
                [productoId]: {
                    ...producto,
                    cantidad: cantidades[productoId],
                    subtotal: cantidades[productoId] * producto.precio,
                }
            }));
        }
    };

    const confirmarCompra = async () => {
        // const items = Object.values(carrito).map(item => ({
        //     title: item.nombre,
        //     quantity: item.cantidad,
        //     unit_price: item.precio,
        // }));

        const items = [{
          title: 'Shampoo Hidratante',
          quantity: 2,
          unit_price: 1, // Precio por unidad
      }];

      const data = {
        items: items,
        back_urls: {
            success: "http://localhost:3000/success",
            failure: "http://localhost:3000/failure",
            pending: "http://localhost:3000/pending"
        },
        auto_return: "approved",
    };
    console.log(data);


        // Implementación de la llamada a la API para crear la preferencia de pago
        try {
          
            const response = await fetch('http://127.0.0.1:8000/api/v1/mercadopago/create_preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items }),
            });

            
            const responseData = await response.json();
            console.log(responseData.init_point);

            setUrl(responseData.init_point);
                setShowWebView(true);


            // if (response.ok) {
                // Usar el navegador o Webview para abrir la URL de MercadoPago
                // Ejemplo usando Linking para abrir una URL en el navegador
                // Linking.openURL(responseData.init_point);
            // } else {
            //     setError('Error al crear la preferencia de pago');
            // }
        } catch (error) {
            setError('Error al conectar con el servidor');
        }
    };


    return (
      <View style={styles.container}>
          {Platform.OS === 'web' ? (
              showWebView && <iframe src={url} style={{ height: '100%', width: '100%' }} />
          ) : (
              showWebView && (
                  <WebView
                      source={{ uri: url }}
                      style={{ flex: 1 }}
                      onNavigationStateChange={navState => {
                          if (navState.url.includes('success')) {
                              Alert.alert('Éxito', 'Pago realizado correctamente');
                              setShowWebView(false);
                              setCarrito({});
                          } else if (navState.url.includes('failure')) {
                              Alert.alert('Pago Fallido', 'El pago no se pudo procesar');
                              setShowWebView(false);
                          }
                      }}
                  />
              )
          )}

          {!showWebView && (
              <View>
                  <FlatList
                      data={productos}
                      keyExtractor={item => item.id.toString()}
                      renderItem={({ item }) => (
                          <View style={styles.productContainer}>
                              <Text style={styles.productName}>{item.nombre}</Text>
                              <TextInput
                                  style={styles.input}
                                  value={cantidades[item.id].toString()}
                                  onChangeText={text => handleCantidadChange(item.id, text)}
                                  keyboardType='numeric'
                              />
                              <Button title="Agregar al carrito" onPress={() => agregarAlCarrito(item.id)} />
                          </View>
                      )}
                  />
                  <Button title="Confirmar Compra" onPress={confirmarCompra} />
              </View>
          )}
      </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    productContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    productName: {
        fontSize: 18,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        width: 50,
        marginRight: 10,
    },
    errorText: {
        color: 'red',
    },
});

export default VerEmpresa;

