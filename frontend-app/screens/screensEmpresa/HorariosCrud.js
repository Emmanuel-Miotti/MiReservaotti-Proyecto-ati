import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, Button, Modal, TextInput, CheckBox, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import Config from '../Config';
import { UserContext } from '../../contexts/UserContext';
import BotonVolver from "../components/BotonVolver"; 

const HorariosCrud = ({navigation}) => {
  const { user } = useContext(UserContext);
  const [intervalos, setIntervalos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    dias_semanas: [],
    hora_inicio: '',
    hora_fin: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchIntervalos();
  }, []);

  const fetchIntervalos = async () => {
    try {
      const response = await axios.get(`${Config.url()}/intervalos/empresa/${user.id}`);
      setIntervalos(response.data.data);
    } catch (error) {
      console.error('Error al obtener los intervalos:', error);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (value, checked) => {
    let dias_semanas = [...formData.dias_semanas];
    if (checked) {
      dias_semanas.push(value);
    } else {
      dias_semanas = dias_semanas.filter(dia => dia !== value);
    }
    setFormData({ ...formData, dias_semanas });
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.dias_semanas.length === 0) {
      newErrors.dias_semanas = 'Debe seleccionar al menos un día de la semana.';
    }
    if (formData.hora_inicio >= formData.hora_fin) {
      newErrors.hora_fin = 'La hora de inicio no puede ser igual o superior a la hora de fin.';
    }
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const data = {
      agenda_id: user.id.toString(),
      dias_semanas: formData.dias_semanas,
      hora_inicio: formData.hora_inicio,
      hora_fin: formData.hora_fin,
    };

    try {
      if (editMode) {
        await axios.put(`${Config.url()}/intervalos/${formData.id}`, data);
      } else {
        await axios.post(`${Config.url()}/intervalo`, data);
      }
      fetchIntervalos();
      setShowModal(false);
      setEditMode(false);
      setFormData({
        id: '',
        dias_semanas: [],
        hora_inicio: '',
        hora_fin: '',
      });
      setErrors({});
    } catch (error) {
      if (error.response) {
        console.error('Error al guardar el intervalo:', error.response.data);
        setErrors({ server: error.response.data.message });
      } else {
        console.error('Error al guardar el intervalo:', error.message);
      }
    }
  };

  const handleEdit = (intervalo) => {
    setFormData({
      id: intervalo.id,
      dias_semanas: JSON.parse(intervalo.dias_semanas),
      hora_inicio: intervalo.hora_inicio.slice(0, 5),
      hora_fin: intervalo.hora_fin.slice(0, 5),
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${Config.url()}/intervalos/${id}`);
      fetchIntervalos();
    } catch (error) {
      console.error('Error al eliminar el intervalo:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text>ID: {item.id}</Text>
      <Text>Días: {JSON.parse(item.dias_semanas).join(', ')}</Text>
      <Text>Inicio: {item.hora_inicio.slice(0, 5)}</Text>
      <Text>Fin: {item.hora_fin.slice(0, 5)}</Text>
      <View style={styles.actionsContainer}>
        <Button title="Editar" onPress={() => handleEdit(item)} />
        <Button title="Eliminar" onPress={() => handleDelete(item.id)} />
      </View>
    </View>
  );

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
        <BotonVolver onBack={handleBack} />
      <Text style={styles.title}>Horarios</Text>
      <Button title="Agregar horario" onPress={() => {
        setShowModal(true);
        setEditMode(false);
        setFormData({
          id: '',
          dias_semanas: [],
          hora_inicio: '',
          hora_fin: '',
        });
        setErrors({});
      }} />
      <FlatList
        data={intervalos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
      {intervalos.length === 0 && (
        <Text style={styles.infoText}>Todavía no tienes ningún horario registrado. Utiliza el botón "Agregar horario" para crear tu primer horario.</Text>
      )}
      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editMode ? 'Editar Intervalo' : 'Agregar Intervalo'}</Text>
          <View style={styles.inputGroup}>
            <Text>Días de la Semana</Text>
            {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map(dia => (
              <View key={dia} style={styles.checkboxContainer}>
                <CheckBox
                  value={formData.dias_semanas.includes(dia)}
                  onValueChange={(checked) => handleCheckboxChange(dia, checked)}
                />
                <Text>{dia}</Text>
              </View>
            ))}
            {errors.dias_semanas && <Text style={styles.errorText}>{errors.dias_semanas}</Text>}
          </View>
          <View style={styles.inputGroup}>
            <Text>Hora Inicio</Text>
            <TextInput
              style={styles.input}
              placeholder="00:00"
              value={formData.hora_inicio}
              onChangeText={(value) => handleInputChange('hora_inicio', value)}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text>Hora Fin</Text>
            <TextInput
              style={styles.input}
              placeholder="00:00"
              value={formData.hora_fin}
              onChangeText={(value) => handleInputChange('hora_fin', value)}
            />
            {errors.hora_fin && <Text style={styles.errorText}>{errors.hora_fin}</Text>}
          </View>
          {errors.server && <Text style={styles.errorText}>{errors.server}</Text>}
          <Button title={editMode ? 'Guardar Cambios' : 'Guardar'} onPress={handleSubmit} />
          <Button title="Cancelar" onPress={() => setShowModal(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  itemContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#888',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
});

export default HorariosCrud;
