import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { IconSymbol } from '@/components/ui/IconSymbol'; // Assuming you have this for the arrow icons
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface StaticNavigationInformationProps {
  visible?: boolean;
}

export function StaticNavigationInformation({ visible = true }: StaticNavigationInformationProps) {
  if (!visible) return null;

  const steps = [
    { step: 'Start at the intersection of Main St and Rue Sainte-Catherine O.', distance: '100m' },
    { step: 'Turn right onto Rue Sainte-Catherine O.', distance: '50m' },
    { step: 'Walk towards the bus stop.', distance: '90m' }
  ];
  

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const translateX = useSharedValue(0);

  // Gesture for Swiping
  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX < -50 && currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prevIndex) => prevIndex + 1);
      } else if (event.translationX > 50 && currentStepIndex > 0) {
        setCurrentStepIndex((prevIndex) => prevIndex - 1);
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: 1 - Math.abs(translateX.value) / 200,
  }));

  // Handlers for buttons
  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prevIndex) => prevIndex + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prevIndex) => prevIndex - 1);
    }
  };

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.container}>
        <View style={styles.directionInformation}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={goToPreviousStep}
            disabled={currentStepIndex === 0}
          >
            <IconSymbol name="arrow-back" size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.distanceInformation}>
            <Animated.Text style={[styles.nextStep, animatedStyle]}>
              {steps[currentStepIndex].step}
            </Animated.Text>
            <Animated.Text style={[styles.distance, animatedStyle]}>
              {steps[currentStepIndex].distance}
            </Animated.Text>
          </View>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={goToNextStep}
            disabled={currentStepIndex === steps.length - 1}
          >
            <IconSymbol name="arrow-forward" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: 'black',
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 10,
  },
  directionInformation: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    
  },
  modeIcon: {
    marginRight: 15,
  },
  distanceInformation: {
    overflow: 'hidden',
    width: 300,
    alignItems: 'center',
  },
  nextStep: {
    fontSize: 20,
    color: 'white',
    marginBottom: 5,
  },
  distance: {
    fontSize: 20,
    color: 'white',
  },
  arrowButton: {
    padding: 10,
    borderRadius: 30,
    
  },
  previousButton: {
    left: 0, 
  },
  nextButton: {
     
  },
});

export default StaticNavigationInformation;
