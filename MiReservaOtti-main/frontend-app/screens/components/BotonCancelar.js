import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const BotonCancelar = ({ onCancel }) => {
  return (
    <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
      <Icon name="close-circle-outline" size={20} color="#fff" />
      <Text style={styles.buttonText}>Cancelar</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
});

export default BotonCancelar;
