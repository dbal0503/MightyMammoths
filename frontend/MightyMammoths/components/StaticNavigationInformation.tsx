import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol'; // Assuming you have this for the arrow icons
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { LatLng } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { haversineDistance } from '@/utils/haversineDistance';

interface Polyline {
  points: string;
}

interface Step {
  html_instructions: string;
  polyline: Polyline;
}

interface StaticNavigationInformationProps {
  visible?: boolean;
  routes: any;
  setLatitudeStepByStep: React.Dispatch<React.SetStateAction<number>>;
  setLongitudeStepByStep:  React.Dispatch<React.SetStateAction<number>>;
  userLocation: {latitude: number, longitude: number};
  isOriginYL: boolean;
}

export function StaticNavigationInformation(
  { 
    visible = true,
    routes,
    setLatitudeStepByStep,
    setLongitudeStepByStep,
    userLocation,
    isOriginYL

  }: StaticNavigationInformationProps) {
  
  const [stepsText, setStepsText] = useState<string[]>([]);
  const [stepsData, setStepsData] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (routes && routes.length > 0) {
      const bestEstimate = routes[0];
      const stepsData = bestEstimate?.steps || [];
      setStepsText(stepsData.map((step: Step) => step.html_instructions.replace(/<[^>]*>/g, '')));
      setStepsData(stepsData);
    }
  }, [routes]);
  
  useEffect(() => {
    if (currentStepIndex < stepsData.length) {
      const decodedPoly: LatLng[] = polyline.decode(stepsData[currentStepIndex].polyline.points).map(([latitude, longitude]) => ({
        latitude,
        longitude,
      }));
      // (pls check index.tsx)
      setLatitudeStepByStep(decodedPoly[0].latitude);
      setLongitudeStepByStep(decodedPoly[0].longitude);
    }
  }, [currentStepIndex]); 

  useEffect(() => {
    if (
      !isOriginYL ||
      currentStepIndex >= stepsData.length - 1 ||
      !userLocation
    ) {
      return;
    }
    const nextStep = stepsData[currentStepIndex + 1];
    const decodedNextStep = polyline.decode(nextStep.polyline.points);
    const nextStepCoord = {
      latitude: decodedNextStep[0][0],
      longitude: decodedNextStep[0][1],
    };

    const stepRadius = 15;
    if (haversineDistance(userLocation, nextStepCoord) <= stepRadius) {
      setCurrentStepIndex((prevIndex) => prevIndex + 1);
    }
  }, [userLocation, currentStepIndex, stepsData, isOriginYL]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: 1 - Math.abs(translateX.value) / 200,
  }));

  const goToPreviousStep = () => {
    setCurrentStepIndex((prevIndex) => prevIndex - 1);
  };

  const goToNextStep = () => {
    setCurrentStepIndex((prevIndex) => prevIndex + 1);
  };

  if (!visible) return null;

  return (
    <>
      {stepsText && (
        <View style={styles.container}>
          <View style={styles.directionInformation}>
            <View style={styles.arrowContainer}>
              {stepsText.length > 1 && !isOriginYL && currentStepIndex !== 0 ? (
                <TouchableOpacity style={styles.arrowButton} onPress={goToPreviousStep}>
                  <IconSymbol name="arrow-back" size={30} color="black" />
                </TouchableOpacity>
              ) : (
                <View style={styles.arrowButtonPlaceholder} />
              )}
            </View>

            <View style={styles.distanceInformation}>
              <Animated.Text style={[styles.nextStep, animatedStyle]}>
                {stepsText[currentStepIndex]}
              </Animated.Text>
            </View>

            <View style={styles.arrowContainer}>
              {stepsText.length > 1 && !isOriginYL && currentStepIndex !== stepsText.length - 1 ? (
                <TouchableOpacity style={styles.arrowButton} onPress={goToNextStep}>
                  <IconSymbol name="arrow-forward" size={30} color="black" />
                </TouchableOpacity>
              ) : (
                <View style={styles.arrowButtonPlaceholder} />
              )}
            </View>

          </View>
        </View>
      )}
    </>
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
    marginTop: 50,
    
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
    fontSize: 17,
    color: 'white',
    marginBottom: 5,
    padding: 10
  },
  distance: {
    fontSize: 20,
    color: 'white',
  },
  arrowButton: {
    padding: 7,
    borderRadius: 40,
    backgroundColor: 'white',
  },
  arrowContainer: {
    width: 50, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButtonPlaceholder: {
    width: 44, 
    height: 44,
  },
});

export default StaticNavigationInformation;