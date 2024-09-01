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
import RservasCRUD from "./screens/screensEmpresa/ReservasCRUD";
import PanelAgenda from "./screens/screensEmpresa/PanelAgenda";
import ProductoCrud from "./screens/screensEmpresa/ProductoCRUD";
// import RegistrarReservaConCliente from "./screens/screensEmpresa/RegistrarReservaConCliente";
// import EditarEmpresa from "./screens/screensEmpresa/EditarEmpresa";
// CLIENTE
import HomeCliente from "./screens/screensClient/HomeClient";
import EditarCliente from "./screens/screensClient/EditarCliente";
import MisReservas from "./screens/screensClient/MisReservas";
import PerfilCliente from "./screens/screensClient/PerfilCliente";

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
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};

const PerfilStackCliente = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PerfilCliente" component={PerfilCliente} />
      <Stack.Screen name="EditarCliente" component={EditarCliente} />
    </Stack.Navigator>
  );
}

const EmpresaTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
         headerShown: false ,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "HomeEmpresa") {
            iconName = "home-outline";
          } else if (route.name === "Reservas") {
            iconName = "calendar-outline";
          } else if (route.name === "PanelAgenda") {
            iconName = "calendar-outline";
          } else if (route.name === "Perfil") {
            iconName = "settings-outline";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeEmpresa" component={HomeEmpresa} />
      {/* <Tab.Screen name="Servicios" component={ServiciosCRUD} /> */}
      <Tab.Screen name="Reservas" component={RservasCRUD} />
      <Tab.Screen name="PanelAgenda" component={PanelAgenda} />
      <Tab.Screen name="Perfil" component={PerfilStack} />
    </Tab.Navigator>
  );
};

const ClienteTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false ,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "HomeCliente") {
            iconName = "home-outline";
          } 
          else if (route.name === "MisReservas") {
            iconName = "calendar-outline";
          } else if (route.name === "Perfil") {
            iconName = "settings-outline";
          } 

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeCliente" component={HomeCliente} />
      <Tab.Screen name="MisReservas" component={MisReservas} />
      <Tab.Screen name="Perfil" component={PerfilStackCliente} />
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
    <Drawer.Navigator initialRouteName={user ? "AppTabs" : "Login"} screenOptions={{ headerShown: false }}>
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
