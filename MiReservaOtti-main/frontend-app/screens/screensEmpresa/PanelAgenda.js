import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from "../../contexts/UserContext";
import { View, StyleSheet, Text, Button } from 'react-native';
import { Calendar, Agenda } from 'react-native-calendars';
import axios from "axios";


const AgendaScreen = () => {
  const user = useContext(UserContext).user;
  const [items, setItems] = useState({});

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    try {
      // Aquí deberías hacer la llamada real a tu API para obtener las reservas
      const response = await axios.get(`http://127.0.0.1:8000/api/v1/reservas/empresa/${user.id}`);
      const data = await response.data.data;

      // Formatear los datos de la API para que sean compatibles con el formato esperado por react-native-calendars
      const formattedItems = formatDataToItems(data);
      setItems(formattedItems);
    } catch (error) {
      console.error('Error al obtener las reservas:', error);
    }
  };


 

  const formatDataToItems = (data) => {
    // Ejemplo de cómo podrías formatear los datos recibidos
    const formattedItems = {};
    data.forEach(reserva => {
      const fecha = reserva.fecha; 
      if (!formattedItems[fecha]) {
        formattedItems[fecha] = [];
      }
      formattedItems[fecha].push({
        Cliente_Id : `Cliente: ${reserva.cliente_id}`,
        hora: `Hora: ${reserva.hora}`, 
        servicio: `Servicio: ${reserva.servicios}`, 
        Duracion: `Duracion: ${reserva.duracion} Minutos`, 

      });
    });
    return formattedItems;
  };

// const loadItemsForMonth = (month) => {
//   const start = new Date(month.timestamp);
//   const end = new Date(start);
//   end.setMonth(end.getMonth() + 1);

//   const newItems = {};
//   for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
//     const dateString = date.toISOString().split('T')[0];
//     if (!items[dateString]) {
//       newItems[dateString] = [];
//     }
//   }

//   setItems((prevItems) => ({ ...prevItems, ...newItems }));
// };
 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Reserva</Text>
      <Button title="Registrar Reserva" onPress={() => navigation.navigate('RegistrarReservaConCliente')} />
      <Text style={styles.title}>Agenda</Text>
      <Agenda
        items={items}
        //selected={'2024-06-19'} // Fecha inicial seleccionada
        // loadItemsForMonth={loadItemsForMonth}
        renderItem={(item) => (
          <View style={[styles.item]}>
            <Text>{item.Cliente_Id}</Text>
            <Text>{item.hora}</Text>
            <Text>{item.servicio}</Text>
            <Text>{item.Duracion}</Text>
          </View>
        )}
        renderEmptyDate={() => (
          <View style={styles.emptyDate}>
            <Text>¡No hay eventos en esta fecha!</Text>
          </View>
          
        )}
        rowHasChanged={(r1, r2) => r1.name !== r2.name}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  item: {
    backgroundColor: 'lightblue',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,

  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,

  },
});

export default AgendaScreen;
