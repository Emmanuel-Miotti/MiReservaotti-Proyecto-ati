import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geocoder from "react-native-geocoding";

Geocoder.init("AIzaSyD8_t8Yv2iMbexWa0LoYtNEdTTSUT_N0AY"); 

const Mapa = ({ address }) => {
  const [location, setLocation] = useState(null);
  const [locationFound, setLocationFound] = useState(true);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const response = await Geocoder.from(address);
        const { lat, lng } = response.results[0].geometry.location;
        setLocation({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        setLocationFound(false);
        console.error("Error al obtener coordenadas: ", error);
      }
    };

    fetchCoordinates();
  }, [address]);

  if (!locationFound) {
    return <Text>Ubicación no encontrada.</Text>;
  }

  if (!location) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <MapView
      style={styles.map}
      region={location}
      showsUserLocation={true}
    >
      <Marker coordinate={location} />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    height: 400,
    width: "100%",
  },
});

export default Mapa;
