import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol'; // Assuming you have this for the arrow icons
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { LatLng } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import { haversineDistance } from '@/utils/haversineDistance';
import campusBuildingCoords from '../assets/buildings/coordinates/campusbuildingcoords.json';

interface Polyline {
  points: string;
}

interface Step {
  html_instructions: string;
  polyline: Polyline;
  instructions?: string;
}

interface StaticNavigationInformationProps {
  visible?: boolean;
  routes: any;
  setLatitudeStepByStep: React.Dispatch<React.SetStateAction<number>>;
  setLongitudeStepByStep:  React.Dispatch<React.SetStateAction<number>>;
  userLocation: {latitude: number, longitude: number};
  isOriginYL: boolean;
  selectedMode?: string;
  walk1Polyline: string;
  walk2Polyline: string;
  shuttlePolyline: string;
  destination: string;
}

export function StaticNavigationInformation(
  { 
    visible = true,
    routes,
    setLatitudeStepByStep,
    setLongitudeStepByStep,
    userLocation,
    isOriginYL,
    selectedMode,
    walk1Polyline,
    walk2Polyline,
    shuttlePolyline,
    destination,

  }: StaticNavigationInformationProps) {
  
  const [stepsText, setStepsText] = useState<string[]>([]);
  const [stepsData, setStepsData] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const translateX = useSharedValue(0);

  const getBuildingName = (placeId: string): string => {
    const matchingBuildings = campusBuildingCoords.features.filter(
      (feature: any) => feature.properties.PlaceID === placeId
    );
    if (matchingBuildings.length === 0) return 'Unknown Building';
    const destinationMatch = matchingBuildings.find(
      (feature: any) => feature.properties.BuildingName === destination
    );
    if (destinationMatch) return destinationMatch.properties.BuildingName;
    return matchingBuildings[0].properties.BuildingName;
  };

  useEffect(() => {
    if (routes && routes.length > 0) {
      const bestEstimate = routes[0];
      const stepsData = bestEstimate?.steps || [];
      let adjustedStepsData = stepsData;
      if (selectedMode === 'shuttle') {
        adjustedStepsData = [
          { ...stepsData[0], polyline: { points: walk1Polyline } },
          { ...stepsData[0], polyline: { points: shuttlePolyline } },
          { ...stepsData[2], polyline: { points: shuttlePolyline } }, 
          { ...stepsData[3], polyline: { points: walk2Polyline } },
        ];
      }
      const updatedStepsText = stepsData.map((step: Step) => {
        let stepText = step?.html_instructions
          ? step.html_instructions
              .replace(/<\/div>/g, ". ")
              .replace(/<[^>]*>/g, "")
          : step?.instructions || '';
        stepText = stepText.replace(/(\w)(Destination)/g, '$1. $2');

        return stepText.replace(/place_id:([\w-]+)/g, (match, placeId) => 
          getBuildingName(placeId)
        );
      });
      setStepsText(updatedStepsText);
      setStepsData(adjustedStepsData);
    }
  }, [routes]);
  
  useEffect(() => {
    if (currentStepIndex < stepsData.length) {
      const currentStep = stepsData[currentStepIndex];
      

      if (!currentStep.polyline || !currentStep.polyline.points) {
        console.warn(`Step ${currentStepIndex} has no valid polyline data.`);
        return;
      }

      const decodedPoly: LatLng[] = polyline.decode(currentStep.polyline.points).map(([latitude, longitude]) => ({
        latitude,
        longitude,
      }));

      if (decodedPoly.length > 0) {
        setLatitudeStepByStep(decodedPoly[0].latitude);
        setLongitudeStepByStep(decodedPoly[0].longitude);
      }
    }
  }, [currentStepIndex, stepsData]); 

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
                  <IconSymbol name= {"arrow-back" as IconSymbolName} size={30} color="black" />
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
                  <IconSymbol name = {"arrow-forward" as IconSymbolName} size={30} color="black" />
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