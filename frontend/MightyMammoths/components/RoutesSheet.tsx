// components/RoutesSheet.tsx
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { RouteData } from "@/services/directionsService";

interface TransportChoiceProps {
  routeEstimates: { [mode: string]: RouteData[] };
  onSelectMode: (mode: string) => void;
}

export function TransportChoice({
  routeEstimates,
  onSelectMode,
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
      <Text style={styles.heading}>Select Transportation Mode</Text>
      {Object.keys(modeDisplayNames).map((mode) => {
        const estimates = routeEstimates[mode];
        const bestEstimate =
          estimates && estimates.length > 0 ? estimates[0] : null;
        return (
          <TouchableOpacity
            key={mode}
            style={styles.modeItem}
            onPress={() => onSelectMode(mode)}
          >
            {modeIcons[mode]}
            <View style={styles.textContainer}>
              <Text style={styles.modeText}>{modeDisplayNames[mode]}</Text>
              {bestEstimate && (
                <Text style={styles.estimateText}>
                  {bestEstimate.duration} – {bestEstimate.distance}
                </Text>
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
    flex: 1,
    padding: 16,
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
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  modeIcon: {
    marginRight: 10,
  },
  textContainer: {},
  modeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  estimateText: {
    fontSize: 14,
    color: "gray",
  },
});
