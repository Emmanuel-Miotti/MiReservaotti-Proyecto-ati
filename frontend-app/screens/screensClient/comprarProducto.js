import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import Config from "../Config";
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductosCompra = () => {
    const [productos, setProductos] = useState([]);
    const [cantidades, setCantidades] = useState({});
    const [carrito, setCarrito] = useState({});
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [cargando, setCargando] = useState(false);

    const navigation = useNavigation();
    const route = useRoute();
    const empresaId = route.params.id;

    useEffect(() => {
        fetchProductos();
    }, [empresaId]);

    const fetchProductos = async () => {
        try {
            setCargando(true);
            const response = await axios.get(
                `${Config.url()}/empresas/${empresaId}/productosActivos`
            );
            setProductos(response.data);
            const initialCantidades = {};
            response.data.forEach(producto => {
                initialCantidades[producto.id] = 1;
            });
            setCantidades(initialCantidades);
        } catch (error) {
            setError("Error al cargar productos");
        } finally {
            setCargando(false);
        }
    };

    const handleCantidadChange = (productoId, value) => {
        const cantidad = Number(value);
        if (cantidad <= productos.find(p => p.id === productoId).stock) {
            setCantidades(prev => ({
                ...prev,
                [productoId]: cantidad > 0 ? cantidad : 1
            }));
        } else {
            setCantidades(prev => ({
                ...prev,
                [productoId]: productos.find(p => p.id === productoId).stock
            }));
            setError('No puedes agregar más del stock disponible.');
        }
    };

    const agregarAlCarrito = (productoId) => {
        const producto = productos.find(p => p.id === productoId);
        if (cantidades[productoId] <= producto.stock) {
            setCarrito(current => ({
                ...current,
                [productoId]: {
                    cantidad: cantidades[productoId],
                    nombre: producto.nombre,
                    precio: producto.precio,
                    subtotal: cantidades[productoId] * producto.precio
                }
            }));
            setError('');
        } else {
            setError('No puedes agregar más del stock disponible.');
        }
    };

    const calcularTotal = () => {
        return Object.values(carrito).reduce((total, item) => total + item.subtotal, 0).toFixed(2);
    };

    const confirmarCompra = () => {
        setMostrarModal(true);
    };

    const realizarCompra = async () => {
        setMostrarModal(false);
        setCargando(true);

        const url = `${Config.url()}/compras`; 
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const usuario = await AsyncStorage.getItem("usuario");
        const cliente = JSON.parse(usuario);
        const clienteId = cliente ? cliente.id : null;

        const body = JSON.stringify({
            cliente_id: clienteId,
            empresa_id: empresaId,
            productos: Object.entries(carrito).map(([id]) => ({
                id: id,
                cantidad: cantidades[id]
            }))
        });
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: body
            });
            const data = await response.json();
            if (response.ok) {
                setMensaje("Compra realizada con éxito!");
                setCarrito({});
            } else {
                throw new Error(data.message || "Error al realizar la compra");
            }
        } catch (error) {
            setError('Error al realizar la compra');
        } finally {
            setCargando(false);
        }
    };

    const iniciarPago = async () => {
        setCargando(true);

        const items = Object.entries(carrito).map(([id, data]) => ({
            title: data.nombre,
            quantity: data.cantidad,
            unit_price: data.precio,
        }));
    
        const data = {
            items: items,
            back_urls: {
                success: "http://localhost:3000/login", 
                failure: "http://localhost:3000/registerxs",
                pending: "http://localhost:3000/register111"
            },
            auto_return: "approved",
        };
    
        try {
            const response = await fetch(`${Config.url()}/mercadopago/create_preference`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const responseData = await response.json();
            if (response.ok) {
                // Usar Linking o WebView para abrir la URL de MercadoPago en React Native
            } else {
                setError('Error al crear la preferencia de pago');
            }
        } catch (error) {
            setError('Error al conectar con el servidor');
        } finally {
            setCargando(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {cargando ? (
                <ActivityIndicator size="large" color="#1a73e8" />
            ) : (
                <>
                    <FlatList
                        data={productos}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.productContainer}>
                                <View style={styles.productDetails}>
                                    <Text style={styles.productName}>{item.nombre}</Text>
                                    <Text style={styles.productPrice}>${item.precio}</Text>
                                    <Text style={styles.productStock}>Stock disponible: {item.stock}</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={cantidades[item.id].toString()}
                                    onChangeText={(text) => handleCantidadChange(item.id, text)}
                                    keyboardType='numeric'
                                />
                                <TouchableOpacity onPress={() => agregarAlCarrito(item.id)} style={styles.addButton}>
                                    <Text style={styles.buttonText}>Agregar al carrito</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />

                    {Object.keys(carrito).length > 0 && (
                        <View style={styles.cartContainer}>
                            <Text style={styles.cartTitle}>Carrito de Compras</Text>
                            {Object.values(carrito).map(item => (
                                <View key={item.nombre} style={styles.cartItem}>
                                    <Text style={styles.cartItemText}>{item.nombre} x {item.cantidad}</Text>
                                    <Text style={styles.cartItemText}>${item.subtotal.toFixed(2)}</Text>
                                </View>
                            ))}
                            <Text style={styles.totalText}>Total a Pagar: ${calcularTotal()}</Text>
                        </View>
                    )}

                    <TouchableOpacity onPress={confirmarCompra} style={styles.confirmButton}>
                        <Text style={styles.buttonText}>Pagar en persona</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={iniciarPago} style={styles.payButton}>
                        <Text style={styles.buttonText}>Pagar con MercadoPago</Text>
                    </TouchableOpacity>
                    {mensaje && <Text style={styles.successText}>{mensaje}</Text>}
                    {error && <Text style={styles.errorText}>{error}</Text>}
                </>
            )}

            <Modal
                visible={mostrarModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setMostrarModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirmar Compra</Text>
                        <Text>¿Estás seguro de que deseas realizar esta compra?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setMostrarModal(false)} style={styles.cancelButton}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={realizarCompra} style={styles.confirmButton}>
                                <Text style={styles.buttonText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: "#f9f9f9",
    },
    productContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        marginVertical: 10,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    productPrice: {
        fontSize: 16,
        color: "#888",
    },
    productStock: {
        fontSize: 14,
        color: "#555",
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        width: 50,
        borderRadius: 5,
        backgroundColor: "#fff",
    },
    addButton: {
        backgroundColor: '#1a73e8',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    cartContainer: {
        marginVertical: 20,
        padding: 15,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    cartTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: "#333",
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    cartItemText: {
        fontSize: 16,
        color: "#333",
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'right',
        marginTop: 10,
        color: "#1a73e8",
    },
    confirmButton: {
        backgroundColor: '#4caf50',
        paddingVertical: 15,
        borderRadius: 5,
        marginTop: 20,
        alignItems: 'center',
    },
    payButton: {
        backgroundColor: '#fbc02d',
        paddingVertical: 15,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    successText: {
        color: '#4caf50',
        textAlign: 'center',
        marginTop: 20,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        width: '100%',
    },
    cancelButton: {
        backgroundColor: '#f44336',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
    },
});

export default ProductosCompra;




// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, FlatList, TextInput, StyleSheet } from 'react-native';
// import Config from "../Config";

// const ProductosCompra = () => {
//     const [productos, setProductos] = useState([]);
//     const [cantidades, setCantidades] = useState({});
//     const [carrito, setCarrito] = useState({});
//     const [mensaje, setMensaje] = useState('');
//     const [error, setError] = useState('');

//     useEffect(() => {
//         // Simula la carga de productos
//         const cargarProductos = async () => {
//             // Aquí iría el código para cargar productos desde tu backend
//             const productosCargados = [
//                 { id: 1, nombre: 'Shampoo', precio: 150 },
//                 { id: 2, nombre: 'Acondicionador', precio: 200 },
//             ];
//             setProductos(productosCargados);
//             const initialCantidades = productosCargados.reduce((acc, item) => {
//                 acc[item.id] = 1; // Cantidad inicial para cada producto
//                 return acc;
//             }, {});
//             setCantidades(initialCantidades);
//         };
//         cargarProductos();
//     }, []);

//     const handleCantidadChange = (productoId, cantidad) => {
//         setCantidades(prev => ({
//             ...prev,
//             [productoId]: Number(cantidad)
//         }));
//     };

//     const agregarAlCarrito = (productoId) => {
//         const producto = productos.find(p => p.id === productoId);
//         if (producto) {
//             setCarrito(prev => ({
//                 ...prev,
//                 [productoId]: {
//                     ...producto,
//                     cantidad: cantidades[productoId],
//                     subtotal: cantidades[productoId] * producto.precio,
//                 }
//             }));
//         }
//     };

//     const confirmarCompra = async () => {
//         const items = Object.values(carrito).map(item => ({
//             title: item.nombre,
//             quantity: item.cantidad,
//             unit_price: item.precio,
//         }));

//         // Implementación de la llamada a la API para crear la preferencia de pago
//         try {
//             const response = await fetch(`${Config.url()}/mercadopago/create_preference`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ items }),
//             });
//             const responseData = await response.json();
//             if (response.ok) {
//                 // Usar el navegador o Webview para abrir la URL de MercadoPago
//                 // Ejemplo usando Linking para abrir una URL en el navegador
//                 Linking.openURL(responseData.init_point);
//             } else {
//                 setError('Error al crear la preferencia de pago');
//             }
//         } catch (error) {
//             setError('Error al conectar con el servidor');
//         }
//     };

//     return (
//         <View style={styles.container}>
//             <FlatList
//                 data={productos}
//                 keyExtractor={item => item.id.toString()}
//                 renderItem={({ item }) => (
//                     <View style={styles.productContainer}>
//                         <Text style={styles.productName}>{item.nombre}</Text>
//                         <TextInput
//                             style={styles.input}
//                             value={cantidades[item.id].toString()}
//                             onChangeText={(text) => handleCantidadChange(item.id, text)}
//                             keyboardType='numeric'
//                         />
//                         <Button title="Agregar al carrito" onPress={() => agregarAlCarrito(item.id)} />
//                     </View>
//                 )}
//             />
//             <Button title="Confirmar Compra" onPress={confirmarCompra} />
//             {mensaje && <Text>{mensaje}</Text>}
//             {error && <Text style={styles.errorText}>{error}</Text>}
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         paddingTop: 50,
//     },
//     productContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         padding: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: '#ccc',
//     },
//     productName: {
//         fontSize: 18,
//     },
//     input: {
//         borderWidth: 1,
//         borderColor: '#ccc',
//         padding: 10,
//         width: 50,
//         marginRight: 10,
//     },
//     errorText: {
//         color: 'red',
//     },
// });

// export default ProductosCompra;
