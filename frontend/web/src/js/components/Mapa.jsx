import React, { useEffect, useState } from "react";

const Mapa = ({ address }) => {
  const [locationFound, setLocationFound] = useState(true);

  useEffect(() => {
    const initMap = () => {
      const geocoder = new window.google.maps.Geocoder();
      const map = new window.google.maps.Map(document.getElementById("map"), {
        zoom: 15,
      });

      geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK") {
          setLocationFound(true);
          map.setCenter(results[0].geometry.location);
          new window.google.maps.Marker({
            map: map,
            position: results[0].geometry.location,
          });
        } else {
          setLocationFound(false);
          console.error("Geocode was not successful for the following reason: " + status);
        }
      });
    };

    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD8_t8Yv2iMbexWa0LoYtNEdTTSUT_N0AY&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = initMap;
    } else {
      initMap();
    }
  }, [address]);

  if (!locationFound) {
    return <p>Ubicación no encontrada.</p>;
  }

  return <div id="map" style={{ height: "400px", width: "100%" }}></div>;
};

export default Mapa;
