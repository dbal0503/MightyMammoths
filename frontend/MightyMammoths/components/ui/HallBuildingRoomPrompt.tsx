import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { isValidHallBuildingRoom, getRoomInfoByNumber, RoomInfo } from '../../utils/hallBuildingRooms';

interface HallBuildingRoomPromptProps {
  visible: boolean;
  onClose: () => void;
  onSelectRoom?: (roomId: string, floorId: string, roomNumber: string) => void;
}

const HallBuildingRoomPrompt: React.FC<HallBuildingRoomPromptProps> = ({ 
  visible, 
  onClose,
  onSelectRoom 
}) => {
  const [roomNumber, setRoomNumber] = useState('');
  const [isRoomValid, setIsRoomValid] = useState(false);
  const [selectedRoomInfo, setSelectedRoomInfo] = useState<RoomInfo | null>(null);

  useEffect(() => {
    // Reset room number when modal becomes visible
    if (visible) {
      setRoomNumber('');
      setIsRoomValid(false);
      setSelectedRoomInfo(null);
    }
  }, [visible]);

  useEffect(() => {
    if (roomNumber.trim() === '') {
      setIsRoomValid(false);
      setSelectedRoomInfo(null);
      return;
    }
    
    const roomInfo = getRoomInfoByNumber(roomNumber);
    const isValid = roomInfo !== undefined;
    
    setIsRoomValid(isValid);
    setSelectedRoomInfo(isValid ? roomInfo : null);
  }, [roomNumber]);

  useEffect(() => {
    if (visible) {
      console.log('==== HALL BUILDING ROOM PROMPT SHOWN ====');
      console.log('This prompt should NOT be shown when a room number is already known');
    }
  }, [visible]);

  const handleSubmit = () => {
    if (!isRoomValid || !selectedRoomInfo) {
      console.log('Invalid room entered in prompt:', roomNumber);
      Alert.alert('Invalid Room', 'Please enter a valid Hall Building room number.');
      return;
    }

    console.log('Room manually selected in HallBuildingRoomPrompt:', selectedRoomInfo);
    
    // Close this prompt
    onClose();
    
    // Call the onSelectRoom callback with all necessary info if provided
    if (onSelectRoom) {
      console.log('Calling onSelectRoom with:', 
        selectedRoomInfo.encodedId,
        selectedRoomInfo.floor,
        selectedRoomInfo.roomNumber
      );
      
      // Log the complete floor ID to ensure it's correctly captured
      console.log('🔍 IMPORTANT - Floor ID being passed:', selectedRoomInfo.floor);
      
      // Call onSelectRoom without a timeout - pass data directly
      onSelectRoom(
        selectedRoomInfo.encodedId,
        selectedRoomInfo.floor,
        selectedRoomInfo.roomNumber
      );
    }
  };

  const handleCancel = () => {
    setRoomNumber('');
    setSelectedRoomInfo(null);
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
            Enter your destination room number to view indoor directions.
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