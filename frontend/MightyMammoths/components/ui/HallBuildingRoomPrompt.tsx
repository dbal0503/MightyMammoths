import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { isValidHallBuildingRoom, getRoomInfoByNumber } from '../../utils/hallBuildingRooms';
import { useNavigation as useNavigationProvider } from '../NavigationProvider';

interface HallBuildingRoomPromptProps {
  visible: boolean;
  onClose: () => void;
  onSelectRoom?: (roomId: string) => void;
}

const HallBuildingRoomPrompt: React.FC<HallBuildingRoomPromptProps> = ({ 
  visible, 
  onClose,
  onSelectRoom 
}) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [isRoomValid, setIsRoomValid] = useState(false);
  const { state } = useNavigationProvider();
  const { setModalVisible } = state;

  useEffect(() => {
    if (roomNumber.trim() === '') {
      setIsRoomValid(false);
      return;
    }
    
    const isValid = isValidHallBuildingRoom(roomNumber);
    setIsRoomValid(isValid);
  }, [roomNumber]);

  const handleSubmit = () => {
    if (!isRoomValid) {
      Alert.alert('Invalid Room', 'Please enter a valid Hall Building room number.');
      return;
    }

    const roomInfo = getRoomInfoByNumber(roomNumber);
    if (!roomInfo) {
      Alert.alert('Error', 'Could not find room information.');
      return;
    }

    console.log('Room selected:', roomInfo);
    
    // Close this prompt
    onClose();
    
    // Call the onSelectRoom callback if provided
    if (onSelectRoom) {
      onSelectRoom(roomInfo.encodedId);
    }
    
    // Open the indoor map modal with the selected room
    setTimeout(() => {
      setModalVisible(true, roomInfo.encodedId);
    }, 300);
  };

  const handleCancel = () => {
    setRoomNumber('');
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Enter Room Number</Text>
          <Text style={styles.modalSubtitle}>
            You're near Hall Building. Enter your destination room number to continue.
          </Text>
          
          <TextInput
            style={styles.input}
            placeholder="e.g., H-820 or 820"
            value={roomNumber}
            onChangeText={setRoomNumber}
            autoCapitalize="characters"
          />
          
          {roomNumber.trim() !== '' && !isRoomValid && (
            <Text style={styles.errorText}>
              Room not found. Please enter a valid Hall Building room.
            </Text>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonCancel]} 
              onPress={handleCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.buttonConfirm,
                !isRoomValid && styles.buttonDisabled
              ]} 
              onPress={handleSubmit}
              disabled={!isRoomValid}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    minWidth: '45%',
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: '#DDDDDD',
  },
  buttonConfirm: {
    backgroundColor: '#147EFB',
  },
  buttonDisabled: {
    backgroundColor: '#AAA',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default HallBuildingRoomPrompt; 