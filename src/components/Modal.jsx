import React, {useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import Snackbar from 'react-native-snackbar';
import colors from '../utils/colors';

const CompanyModal = ({modalVisible, setModalVisible, onRefresh}) => {
  const [companyName, setCompanyName] = useState('');
  const [panNumber, setPanNumber] = useState('');

  const handleSubmit = async () => {
    if (!companyName || !panNumber) {
      Snackbar.show({
        text: "Please don't leave the fields empty",
        backgroundColor: 'red',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    if (panNumber.length < 9) {
      Snackbar.show({
        text: 'PAN number must be valid',
        backgroundColor: 'red',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    const newCompany = {
      registeredName: companyName,
      panNumber,
    };

    try {
      const response = await fetch(
        `${process.env.PUBLIC_SERVER}/api/pan/addPan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCompany),
        },
      );

      if (response.ok) {
        Snackbar.show({
          text: 'Company added successfully!',
          backgroundColor: 'green',
          duration: Snackbar.LENGTH_SHORT,
        });

        Snackbar.show({
          text: 'Company Created Successfully',
          textColor: 'white',
          backgroundColor: 'green',
        });
        onRefresh();

        // Reset the modal and inputs
        setModalVisible(false);
        setCompanyName('');
        setPanNumber('');
      } else {
        Snackbar.show({
          text: 'Failed to add company. Please try again.',
          backgroundColor: 'red',
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    } catch (error) {
      console.error('Error adding company:', error);
      Snackbar.show({
        text: 'Error occurred. Please try again.',
        backgroundColor: 'red',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  return (
    <View style={styles.modalTriggerContainer}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Entypo name="cross" size={30} color="black" />
            </Pressable>

            <Text style={styles.modalTitle}>Enter Company Details</Text>

            <Text style={styles.label}>Your Registered Company Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Company Name"
              value={companyName}
              onChangeText={setCompanyName}
            />

            <Text style={styles.label}>PAN Number</Text>
            <TextInput
              style={styles.input}
              placeholder="PAN Number"
              value={panNumber}
              onChangeText={setPanNumber}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CompanyModal;

const styles = StyleSheet.create({
  modalTriggerContainer: {
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'relative',
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: colors.primary,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    width: '100%',
    color: colors.primary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },
});
