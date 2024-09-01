import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native-gesture-handler";


export default function ButtonGradient({ title, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
    <View style={styles.shadowContainer}>
      <LinearGradient
        colors={['#11998e', '#38ef7d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </View>
  </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  shadowContainer: {
    width: "100%",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  button: {
    padding: 10,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  text: {
    backgroundColor: "transparent",
    fontSize: 16,
    color: "#fff",
    // fontWeight: "bold",
  },
});
