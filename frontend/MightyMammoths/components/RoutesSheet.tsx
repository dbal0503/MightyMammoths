// components/RoutesSheet.tsx
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { RouteData } from "@/services/directionsService";

interface TransportChoiceProps {
  routeEstimates: { [mode: string]: RouteData[] };
  onSelectMode: (mode: string) => void;
  destinationBuilding: string | null;
  bothSelected: boolean;
  onBack: () => void;
}

export function TransportChoice({
  routeEstimates,
  onSelectMode,
  destinationBuilding,
  bothSelected,
  onBack
}: TransportChoiceProps) {
  const modeDisplayNames: { [key: string]: string } = {
    driving: "Drive",
    transit: "Public Transit",
    bicycling: "Bicycle",
    walking: "Walk",
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
      {Object.keys(modeDisplayNames).map((mode) => {
        const estimates = routeEstimates[mode];
        const bestEstimate =
          estimates && estimates.length > 0 ? estimates[0] : null;
        return (
          <TouchableOpacity
            key={mode}
            style={styles.modeItem}
            onPress={() => onSelectMode(mode)}
            disabled={!bothSelected}
          >
            {modeIcons[mode]}
            <View style={styles.textInformation}>
                <Text style={styles.transportMode}>{modeDisplayNames[mode]}</Text>
                <Text style={styles.subRouteHeadingDestination}>{destinationBuilding}</Text>
            </View>
            <View style={styles.travelInformation}>
                {bestEstimate && (
                    <>
                      <Text style={styles.time}>{bestEstimate.duration}</Text>
                      <Text style={styles.distance}>{bestEstimate.distance}</Text>
                    </>
                )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
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
    
    borderRadius: 20,
    marginBottom: 20,
    height:90,
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
  },
  routeHeadingDestination: {
    fontSize: 20,
    marginBottom: 20,
    color: 'white',
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
    marginLeft: 'auto',
    paddingRight:20
}, time:{
    fontSize:20,
    fontWeight: 'bold',
},
distance:{
    marginLeft:'auto',
    fontSize:18,
},

});