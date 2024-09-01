import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Button, Picker } from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import axios from "axios";
import Config from "../Config"; 
import { UserContext } from "../../contexts/UserContext";
import moment from "moment";

const screenWidth = Dimensions.get("window").width;

const EstadisticasEmpresa = () => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [reservas, setReservas] = useState([]);
  const [filteredReservas, setFilteredReservas] = useState([]);
  const [reservasPorDia, setReservasPorDia] = useState([]);
  const [totalGenerado, setTotalGenerado] = useState(0);
  const [reservasRegistradas, setReservasRegistradas] = useState(0);
  const [reservasNoRegistradas, setReservasNoRegistradas] = useState(0);
  const [totalVentasServicios, setTotalVentasServicios] = useState(0);
  const [totalVentasProductos, setTotalVentasProductos] = useState(0);
  const [selectedPeriodo, setSelectedPeriodo] = useState('dia');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const responseReservas = await axios.get(`${Config.url()}/reservas/empresa/${user.id}`);
      const responseReservasUsuariosNoRegistrados = await axios.get(`${Config.url()}/reservas2/empresa/${user.id}`);
      const responseVentas = await axios.get(`${Config.url()}/empresas/${user.id}/productos`);
      
      const todasReservas = [...responseReservas.data.data, ...responseReservasUsuariosNoRegistrados.data.data];
      
      setReservas(todasReservas || []);
      setTotalVentasServicios(responseReservas.data.servicios || 0);
      setTotalVentasProductos(responseVentas.data.id || 0);

      // Filtrar por periodo inicial (día)
      filtrarPorPeriodo(todasReservas);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarPorPeriodo = (reservas) => {
    const now = moment().startOf('day');
    let inicioPeriodo;

    switch (selectedPeriodo) {
      case 'dia':
        inicioPeriodo = now;
        break;
      case 'semana':
        inicioPeriodo = now.startOf('week');
        break;
      case 'mes':
        inicioPeriodo = now.startOf('month');
        break;
      case 'año':
        inicioPeriodo = now.startOf('year');
        break;
      default:
        inicioPeriodo = now;
        break;
    }

    const reservasFiltradas = reservas.filter(reserva => {
      const fechaReserva = moment(reserva.fecha).startOf('day');
      return fechaReserva.isSameOrAfter(inicioPeriodo) && reserva.estado === "reservado";
    });

    setFilteredReservas(reservasFiltradas);
    calcularEstadisticas(reservasFiltradas);
    
    const total = reservasFiltradas.reduce((sum, reserva) => sum + (parseFloat(reserva.precio) || 0), 0);
    setTotalGenerado(total);

    const registeredCount = reservasFiltradas.filter(reserva => reserva.cliente_id).length;
    const unregisteredCount = reservasFiltradas.filter(reserva => !reserva.cliente_id).length;

    setReservasRegistradas(registeredCount);
    setReservasNoRegistradas(unregisteredCount);
  };

  const calcularEstadisticas = (reservas) => {
    const reservasPorDia = Array(7).fill(0);

    reservas.forEach((reserva) => {
      const diaSemana = moment(reserva.fecha).day();
      reservasPorDia[diaSemana] += 1;
    });

    setReservasPorDia(reservasPorDia);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Estadísticas de la Empresa</Text>

      <View style={styles.filterContainer}>
        <Text style={styles.chartTitle}>Filtrar por periodo:</Text>
        <Picker
          selectedValue={selectedPeriodo}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedPeriodo(itemValue)}
        >
          <Picker.Item label="Día" value="dia" />
          <Picker.Item label="Semana" value="semana" />
          <Picker.Item label="Mes" value="mes" />
          <Picker.Item label="Año" value="año" />
        </Picker>
        <Button title="Filtrar" onPress={() => filtrarPorPeriodo(reservas)} />
      </View>

      <View style={styles.statContainer}>
        <Text style={styles.chartTitle}>Total Generado</Text>
        <Text style={styles.statValue}>${totalGenerado ? totalGenerado.toFixed(2) : "0.00"}</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Fuentes de Reservas</Text>
        <PieChart
          data={[
            {
              name: "Usuarios registrados",
              population: reservasRegistradas,
              color: "rgba(75, 192, 192, 0.8)",
              legendFontColor: "#7F7F7F",
              legendFontSize: 15,
            },
            {
              name: "Usuarios no registrados",
              population: reservasNoRegistradas,
              color: "rgba(255, 159, 64, 0.8)",
              legendFontColor: "#7F7F7F",
              legendFontSize: 15,
            },
          ]}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Ventas Facturadas</Text>
        <BarChart
          data={{
            labels: ["Servicios", "Productos"],
            datasets: [
              {
                data: [totalVentasServicios, totalVentasProductos],
              },
            ],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Reservas por Día de la Semana</Text>
        <LineChart
          data={{
            labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
            datasets: [
              {
                data: reservasPorDia,
                color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#1E2923",
  backgroundGradientTo: "#08130D",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#ffa726",
  },
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 50,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 20,
    textAlign: "center",
  },
  filterContainer: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  picker: {
    height: 50,
    width: "100%",
    marginVertical: 10,
  },
  chartContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  statContainer: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default EstadisticasEmpresa;
