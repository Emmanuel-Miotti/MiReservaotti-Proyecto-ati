import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        console.log(userData);
        console.log(user)
        console.log("Hola desde /contexts/UserContext.js");
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const login = async (userData) => {
    try {
      console.log(userData);
      console.log("Estamos aca /contexts/UserContext.js");
      await AsyncStorage.setItem("user", JSON.stringify(userData.usuario));
      await AsyncStorage.setItem("token", JSON.stringify(userData.token));
      setUser(userData);
    } catch (error) {
      console.error("Failed to save user data:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      setUser(null);
    } catch (error) {
      console.error("Failed to remove user data:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
