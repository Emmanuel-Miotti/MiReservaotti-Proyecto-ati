import React, { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Ionicons";
import { UserProvider, UserContext } from "./contexts/UserContext";
//Public
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
//Empresa
import PanelPerfil from "./screens/screensEmpresa/PanelPerfil";
import EditarEmpresa from "./screens/screensEmpresa/EditarEmpresa";
import VerEmpresa from "./screens/screensPublic/verEmpresa";
import Reserva from "./screens/screensPublic/PageReserva";
import RegisterEmpresa from "./screens/RegisterEmpresa";
import HomeEmpresa from "./screens/screensEmpresa/HomeEmpresa";
import ServiciosCRUD from "./screens/screensEmpresa/ServiciosCRUD";
import ReservasCRUD from "./screens/screensEmpresa/ReservasCRUD";
import PanelAgenda from "./screens/screensEmpresa/PanelAgenda";
import ProductoCrud from "./screens/screensEmpresa/ProductoCRUD";
import Estadisticas from "./screens/screensEmpresa/Estadisticas";
import MisVentas from "./screens/screensEmpresa/MisVentas";
import HorariosCrud from "./screens/screensEmpresa/HorariosCrud";
import GestionDeClientes from "./screens/screensEmpresa/GestionDeClientes";
// import RegistrarReservaConCliente from "./screens/screensEmpresa/RegistrarReservaConCliente";
// import EditarEmpresa from "./screens/screensEmpresa/EditarEmpresa";
// CLIENTE
import HomeCliente from "./screens/screensClient/HomeClient";
import EditarCliente from "./screens/screensClient/EditarCliente";
import MisReservas from "./screens/screensClient/MisReservas";
import PerfilCliente from "./screens/screensClient/PerfilCliente";
import MisFavoritos from "./screens/screensClient/MisFavoritos";
import comprarProducto from "./screens/screensClient/comprarProducto";
import ListaEspera from "./screens/screensClient/LIstaEspera";
import WebViewScreen from "./screens/components/WebView";
import MisCompras from "./screens/screensClient/MisCompras";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const PerfilStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PanelPerfil" component={PanelPerfil} />
      <Stack.Screen name="ServiciosCRUD" component={ServiciosCRUD} />
      <Stack.Screen name="EditarEmpresa" component={EditarEmpresa} />
      <Stack.Screen name="ProductoCrud" component={ProductoCrud} />
      <Stack.Screen name="HorariosCrud" component={HorariosCrud} />
      <Stack.Screen name="GestionDeClientes" component={GestionDeClientes} />
      <Stack.Screen name="Login" component={LoginScreen} />
      
    </Stack.Navigator>
  );
};

const PerfilStackCliente = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PerfilCliente" component={PerfilCliente} />
      <Stack.Screen name="EditarCliente" component={EditarCliente} />
      <Stack.Screen name="MisCompras" component={MisCompras} />
    </Stack.Navigator>
  );
};

const PanelAgendaStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PanelAgenda" component={PanelAgenda} />
      <Stack.Screen name="ReservasCRUD" component={ReservasCRUD} />
    </Stack.Navigator>
  );
}

const HomeClienteEmpresas = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeClienteScreen" component={HomeCliente} />
      <Stack.Screen name="VerEmpresa" component={VerEmpresa} />
      <Stack.Screen name="Reserva" component={Reserva} />
      <Stack.Screen name="ComprarProducto" component={comprarProducto} />
      <Stack.Screen name="ListaEspera" component={ListaEspera} />
      <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
    </Stack.Navigator>
  );
};
const EmpresaTabs = () => {
  return (
    <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        let iconName;

        if (route.name === "HomeEmpresa") {
          iconName = "home-outline";
        } else if (route.name === "MisVentas") {
          iconName = "cart-outline";
        } else if (route.name === "PanelAgenda") {
          iconName = "calendar-outline";
        } else if (route.name === "Estadisticas") {
          iconName = "bar-chart-outline";
        } else if (route.name === "Perfil") {
          iconName = "settings-outline";
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#007bff", // Color del icono cuando está activo
      tabBarInactiveTintColor: "#888", // Color del icono cuando no está activo
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
        backgroundColor: "#f8f9fa", // Fondo de la barra de pestañas
        borderTopWidth: 1,
        borderTopColor: "#ddd",
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "600",
      },
    })}
  >
    <Tab.Screen
      name="HomeEmpresa"
      component={HomeEmpresa}
      options={{ tabBarLabel: "Inicio" }}
    />
    <Tab.Screen
      name="MisVentas"
      component={MisVentas}
      options={{ tabBarLabel: "Ventas" }}
    />
    <Tab.Screen
      name="PanelAgenda"
      component={PanelAgendaStack}
      options={{ tabBarLabel: "Agenda" }}
    />
    <Tab.Screen
      name="Estadisticas"
      component={Estadisticas}
      options={{ tabBarLabel: "Estadísticas" }}
    />
    <Tab.Screen
      name="Perfil"
      component={PerfilStack}
      options={{ tabBarLabel: "Perfil" }}
    />
  </Tab.Navigator>
  );
};
// -------------------------------------------Cliente---------------------------
const ClienteTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "HomeClienteTabs") {
            iconName = "home-outline";
          } else if (route.name === "MisReservas") {
            iconName = "calendar-outline";
          } else if (route.name === "MisFavoritos") {
            iconName = "heart-outline";
          } else if (route.name === "Perfil") {
            iconName = "person-outline";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007bff", // Color del icono cuando está activo
        tabBarInactiveTintColor: "#888", // Color del icono cuando no está activo
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen name="HomeClienteTabs" component={HomeClienteEmpresas} options={{ tabBarLabel: "Inicio" }} />
      <Tab.Screen name="MisReservas" component={MisReservas} options={{ tabBarLabel: "Reservas" }} />
      <Tab.Screen name="MisFavoritos" component={MisFavoritos} options={{ tabBarLabel: "Favoritos" }} />
      <Tab.Screen name="Perfil" component={PerfilStackCliente} options={{ tabBarLabel: "Perfil" }} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
    };
    checkUser();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <Drawer.Navigator
      initialRouteName={user ? "AppTabs" : "Login"}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Login" component={LoginScreen} />
      <Drawer.Screen name="RegisterScreen" component={RegisterScreen} />
      <Drawer.Screen name="RegisterEmpresa" component={RegisterEmpresa} />
      {user && user.role === "empresa" ? (
        <Drawer.Screen
          name="AppTabs"
          component={EmpresaTabs}
          options={{ headerShown: false }}
        />
      ) : (
        <Drawer.Screen
          name="AppTabs"
          component={ClienteTabs}
          options={{ headerShown: false }}
        />
      )}
    </Drawer.Navigator>
    
  );
};

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </UserProvider>
  );
}
