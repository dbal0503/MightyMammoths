import { View, Text, Modal, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import React, { useState } from 'react';

interface TutorialHowToProps {
  onClose: () => void;
}

const TutorialHowTo: React.FC<TutorialHowToProps> = ({ 
  onClose }) => {

  const [modalIndex, setModalIndex] = useState(0);

  const modals = [
    {
      title: 'Using the Application',
      instructions: 'Click "Next" to follow the guide \n Click "Finish!" to skip',
      style: {
        backgroundColor: 'white',
        padding: 21,
        borderRadius: 30,
        width: '70%',
      } as StyleProp<ViewStyle>,
    },
    {
    title: 'Switch between campuses',
      instructions: 'Click on the campus toggle to recenter the map on the different campuses',
      style: {
        position: 'absolute',
        bottom: 70,
        left: 50,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 30,
        borderBottomRightRadius: 0,
        width: '60%',
      } as StyleProp<ViewStyle>,
    },{
    title: 'More features',
      instructions: 'Slide up the bottom sheet to see more features and settings',
      style: {
        position: 'absolute',
        bottom: 160,
        left: 20,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 30,
        borderBottomRightRadius: 0,
        width: '50%',
      } as StyleProp<ViewStyle>,
    },
    {
      title: 'Recenter',
      instructions: 'Click on the recenter button to recenter the map on your location',
      style: {
        position: 'absolute',
        backgroundColor: 'white',
        bottom: 230,
        padding: 20,
        borderRadius: 30,
        borderBottomRightRadius: 0,
        width: '50%',
        right: 40,
      } as StyleProp<ViewStyle>,
      },
    {
      title: 'Navigation',
      instructions: 'Click on the building marker to see building information and to begin outdoor or indoor navigation',
      style: {
        position: 'absolute',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 30,
        borderBottomRightRadius: 0,
        width: '50%',
        left: 40,
        bottom: 290
      } as StyleProp<ViewStyle>,
    },
  ];

  return (
    <>
      <Modal transparent={true}>
        <View style={styles.overlap}>
          <View style={modals[modalIndex].style}>
            <Text style={styles.title}> {modals[modalIndex].title} </Text>
            <Text> {modals[modalIndex].instructions} </Text>
            {modalIndex < modals.length -1 && (
              <Pressable onPress={() => setModalIndex(modalIndex+1)} style={styles.nextButton}>
                <Text style={{color: 'white'}}> Next </Text>
              </Pressable>
            )}
            <Pressable onPress={onClose} style={styles.finishButton}>
              <Text style={{color: 'white'}}> Finish! </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default TutorialHowTo;

const styles = StyleSheet.create({
  overlap: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nextButton:{
    marginTop: 10,
    padding: 10,
    backgroundColor: 'black',
    borderRadius: 30,
    alignItems: 'center',
  },
  finishButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'darkblue',
    borderRadius: 30,
    alignItems: 'center',
  },
});
