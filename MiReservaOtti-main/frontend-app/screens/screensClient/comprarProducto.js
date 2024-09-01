import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet } from 'react-native';

const ProductosCompra = () => {
    const [productos, setProductos] = useState([]);
    const [cantidades, setCantidades] = useState({});
    const [carrito, setCarrito] = useState({});
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');

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
        const items = Object.values(carrito).map(item => ({
            title: item.nombre,
            quantity: item.cantidad,
            unit_price: item.precio,
        }));

        // Implementación de la llamada a la API para crear la preferencia de pago
        try {
            const response = await fetch('http://127.0.0.1:8000/api/mercadopago/create_preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items }),
            });
            const responseData = await response.json();
            if (response.ok) {
                // Usar el navegador o Webview para abrir la URL de MercadoPago
                // Ejemplo usando Linking para abrir una URL en el navegador
                Linking.openURL(responseData.init_point);
            } else {
                setError('Error al crear la preferencia de pago');
            }
        } catch (error) {
            setError('Error al conectar con el servidor');
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={productos}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.productContainer}>
                        <Text style={styles.productName}>{item.nombre}</Text>
                        <TextInput
                            style={styles.input}
                            value={cantidades[item.id].toString()}
                            onChangeText={(text) => handleCantidadChange(item.id, text)}
                            keyboardType='numeric'
                        />
                        <Button title="Agregar al carrito" onPress={() => agregarAlCarrito(item.id)} />
                    </View>
                )}
            />
            <Button title="Confirmar Compra" onPress={confirmarCompra} />
            {mensaje && <Text>{mensaje}</Text>}
            {error && <Text style={styles.errorText}>{error}</Text>}
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

export default ProductosCompra;
