// components/RoutesSheet.tsx
import React, {useState, useEffect} from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { RouteData } from "@/services/directionsService";

interface TransportChoiceProps {
  routeEstimates: { [mode: string]: RouteData[] };
  onSelectMode: (mode: string) => void;
  destinationBuilding: string | null;
  bothSelected: boolean;
  onBack: () => void;
  onSetSteps: (steps: any[]) => void;
}

export function TransportChoice({
  routeEstimates,
  onSelectMode,
  destinationBuilding,
  bothSelected,
  onBack,
  onSetSteps,
}: TransportChoiceProps) {
  const [selectedMode, setSelectedMode] = useState<string>("driving");
  const [bestEstimate, setBestEstimate] = useState<RouteData | null>(null);

  useEffect(() => {
    if (routeEstimates["driving"] && routeEstimates["driving"].length > 0) {
      setBestEstimate(routeEstimates["driving"][0]);
      onSetSteps(routeEstimates["driving"][0].steps);
    }
  }, [routeEstimates, onSetSteps]);

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
        name="car.fill"
        size={30}
        color="black"
        style={styles.modeIcon}
      />
    ),
    transit: (
      <IconSymbol
        name="bus.fill"
        size={30}
        color="black"
        style={styles.modeIcon}
      />
    ),
    bicycling: (
      <IconSymbol
        name="bicycle"
        size={30}
        color="black"
        style={styles.modeIcon}
      />
    ),
    walking: (
      <IconSymbol
        name="figure.walk"
        size={30}
        color="black"
        style={styles.modeIcon}
      />
    ),
    shuttle: (
      <IconSymbol
        name="bus.fill"
        size={30}
        color="black"
        style={styles.modeIcon}
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
          <IconSymbol name="arrow-back" size={50} color="white" style={styles.modeIcon}/>
        </TouchableOpacity>
      </View>
      <View style={styles.transportContainer}>
        {Object.keys(modeDisplayNames).map((mode) => {
          const estimates = routeEstimates[mode];
          const bestEstimate = estimates && estimates.length > 0 ? estimates[0] : null;
          
          const steps = bestEstimate?.steps || [];
          const isSelected = selectedMode === mode;
          return (
            <TouchableOpacity
              key={mode}
              style={[styles.modeItem, isSelected && styles.selectedMode]}
              onPress={() => {
                console.log(steps); // Log the mode when pressed
                onSelectMode(mode); // Also call onSelectMode if you still want to select the mode
                onSetSteps(steps);
              }}
              disabled={!bothSelected}
            >
              {modeIcons[mode]}
            </TouchableOpacity>
          );
          
        })}
      </View>
      <View style={styles.informationContainer}>
        {bestEstimate && (
          <View style={styles.travelInformation}>
            <Text style={styles.time}>{bestEstimate.duration}</Text>
            <Text style={styles.distance}>{bestEstimate.distance}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.goButton}
        >
          <Text style={styles.goStyle}>Go</Text>
          </TouchableOpacity>          
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
}

});