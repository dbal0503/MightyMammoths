// components/RoutesSheet.tsx
import React, {useState, useEffect} from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
import { RouteData } from "@/services/directionsService";

interface TransportChoiceProps {
  routeEstimates: { [mode: string]: RouteData[] };
  onSelectMode: (mode: string) => void;
  destinationBuilding: string | null;
  bothSelected: boolean;
  onBack: () => void;
  onSetSteps: (steps: any[]) => void;
  routesValid: boolean;
  defPoly:()=>void;
  starting: ()=> void;
  onZoomIn: (originCoordsPlaceID: string, originPlaceName: string) => void;
  showStepByStep: (value: boolean) => void;
  routes: any
  origin: string;
  originCoords: string;
  destination: string;
}

export function TransportChoice({
  routeEstimates,
  onSelectMode,
  destinationBuilding,
  bothSelected,
  onBack,
  onSetSteps,
  routesValid,
  defPoly,
  starting,
  onZoomIn,
  showStepByStep,
  routes,
  origin,
  originCoords,
  destination
}: TransportChoiceProps) {
  const [selectedMode, setSelectedMode] = useState<string>("driving");
  const [bestEstimate, setBestEstimate] = useState<RouteData | null>(null);
  
  // Log debug info to help troubleshoot
  useEffect(() => {
    console.log("TransportChoice - DEBUG INFO:");
    console.log("bothSelected:", bothSelected);
    console.log("routesValid:", routesValid);
    console.log("routeEstimates modes:", Object.keys(routeEstimates));
    console.log("origin:", origin);
    console.log("destination:", destination);
  }, [bothSelected, routesValid, routeEstimates, origin, destination]);
  
  const startNavigation = () => {starting(); defPoly(); if (onZoomIn) onZoomIn(originCoords, origin);}
  const setStepByStepVisible = () => {
    showStepByStep(true)
}

  useEffect(() => {
    if (routeEstimates["driving"] && routeEstimates["driving"].length > 0) {
      setSelectedMode("driving"); // Ensure "driving" is set
      onSelectMode("driving");
      setBestEstimate(routeEstimates["driving"][0]);
      onSetSteps(routeEstimates["driving"][0].steps);
    }
  }, [routesValid]); 

  useEffect(() => {
    if (selectedMode && routeEstimates[selectedMode]?.length > 0) {
      const updatedBestEstimate = routeEstimates[selectedMode][0];
      setBestEstimate(updatedBestEstimate);
      onSetSteps(updatedBestEstimate.steps);  // Update steps as well
    }
  }, [origin, destination, selectedMode, routeEstimates]);

  const modeDisplayNames: { [key: string]: string } = {
    driving: "Drive",
    transit: "Public Transit",
    bicycling: "Bicycle",
    walking: "Walk",
    shuttle: "Shuttle",
  };

  const modeIcons: { [key: string]: JSX.Element } = {
    driving: (
      <IconSymbol
        testID="drivingIcon"
        name="car.fill"
        size={30}
        color="black"
        style={styles.modeIcon}
      />
    ),
    transit: (
      <IconSymbol
        testID="transitIcon"
        name="bus.fill"
        size={30}
        color="black"
        style={styles.modeIcon}
      />
    ),
    bicycling: (
      <IconSymbol
        testID="bicyclingIcon"
        name="bicycle"
        size={30}
        color="black"
        style={styles.modeIcon}
      />
    ),
    walking: (
      <IconSymbol
        testID="walkingIcon"
        name="figure.walk"
        size={30}
        color="black"
        style={styles.modeIcon}
      />
    ),
    shuttle: (
      <Image
        testID="shuttleIcon"
        source={require("@/assets/images/ShuttleBusIcon.png")}
        style={styles.shuttleBusIconStyling}
      />
    ),
  };



  return (
    <View style={styles.container}>
      <View style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
      }}>
        <View>
          <Text style={styles.routeHeading}>Routes to</Text>
          <Text style={styles.routeHeadingDestination}>{destinationBuilding}</Text>
        </View>
        <TouchableOpacity onPress={onBack}>
          <IconSymbol name={"arrow-back" as IconSymbolName} size={50} color="white" style={styles.modeIcon} testID="routesSheetBackButton"/>
        </TouchableOpacity>
      </View>
      <View style={styles.transportContainer}>
        {Object.keys(modeDisplayNames).map((mode) => {
          const estimates = routeEstimates[mode];
          const bestEstimate = estimates && estimates.length > 0 ? estimates[0] : null;
          const steps = bestEstimate?.steps || [];
          const isSelected = selectedMode === mode;
          // Make buttons enabled if we have valid routes
          const isDisabled = !estimates || estimates.length === 0;
          
          // Log why a button might be disabled
          if (isDisabled) {
            console.log(`Mode ${mode} is disabled because:`, 
              !estimates ? "No estimates available" : "Empty estimates array");
          }
          
          return (
            <TouchableOpacity
              key={mode}
              style={[styles.modeItem, isSelected && styles.selectedMode,  isDisabled && styles.disabledMode]}
              onPress={() => {
                if (!isDisabled) {
                  console.log(`Selected transportation mode: ${mode}`);
                  setSelectedMode(mode);
                  onSelectMode(mode);
                  onSetSteps(steps);
                  setBestEstimate(routeEstimates[mode][0]);
                } else {
                  console.log(`Cannot select disabled mode: ${mode}`);
                }
              }}
              // Only disable if absolutely no estimates are available
              disabled={!bothSelected || isDisabled}
            >
              {modeIcons[mode]}
            </TouchableOpacity>
          );
          
        })}
      </View>
      <View style={styles.informationContainer}>
        {bestEstimate && (
          <View style={styles.travelInformation}>
            <Text style={styles.time} testID="timeInformation">{bestEstimate.duration}</Text>
            <Text style={styles.distance} testID="distanceInformation">{bestEstimate.distance}</Text>
          </View>
        )}
        {/* Show Go button if we have a valid route, regardless of bothSelected state */}
        {bestEstimate && (
          <TouchableOpacity
            testID="startButton"
            style={styles.goButton}
            onPress={() => {
              console.log("Go button pressed! Starting navigation...");
              startNavigation();
              setStepByStepVisible();
            }}
          >
            <Text style={styles.goStyle}>Go</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    padding: 16,
    backgroundColor: 'black'
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  modeItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    
    borderRadius: 10,
    marginBottom: 0,
    height:50,
    width: 68,
    justifyContent: 'center',
    marginRight: 10
  },
  modeIcon: {
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center',
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 16
  },
  shuttleBusIconStyling:{
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  textContainer: {},
  modeText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  estimateText: {
    fontSize: 14,
    color: "gray",
  },
  routeHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 0,
    color: 'white',
    paddingLeft: 10,
  },
  routeHeadingDestination: {
    fontSize: 20,
    marginBottom: 20,
    color: 'white',
    paddingLeft: 10,
  },
  textInformation:{
        
  },
  transportMode:{
    fontSize: 20,
    fontWeight: 'bold',
  },
  subRouteHeadingDestination:{
    fontSize:15,
  },
  travelInformation:{
    marginLeft: 10,
}, 
informationContainer:{
  marginTop: 25,
  flexDirection: 'row',
  alignItems: "center",
}, 
time:{
    fontSize:30,
    fontWeight: 'bold',
    color: 'white'
},
distance:{
    fontSize:25,
    color: 'white'
},
transportContainer: {
  display: 'flex',
  flexDirection: 'row',
},
goButton:{
  backgroundColor: 'green',
  width: 80,
  height: 80,
  borderRadius: 10,
  marginLeft: 'auto',
  marginRight: 20,
  alignItems: "center",
  justifyContent: 'center'
},
goStyle:{
  color: 'white',
  fontSize: 30,
  fontWeight: 'bold'
},
selectedMode:{
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "blue",
    
  borderRadius: 10,
  marginBottom: 0,
  height:50,
  width: 68,
  justifyContent: 'center',
  marginRight: 10
},
disabledMode: {
  opacity: 0.5,
  backgroundColor: "#ccc"
}

});