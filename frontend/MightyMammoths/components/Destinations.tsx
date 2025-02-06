// components/Destinations.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import BuildingDropdown from "@/components/ui/input/BuildingDropdown";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface DestinationChoicesProps {
  onSelectOrigin: (origin: string) => void;
  onSelectDestination: (destination: string) => void;
}

export function DestinationChoices({
  onSelectOrigin,
  onSelectDestination,
}: DestinationChoicesProps) {
  const buildingList = ["EV", "Hall", "JMSB", "CL Building", "Learning Square"];
  return (
    <View style={styles.container}>
      <View style={styles.dropdownWrapper}>
        <BuildingDropdown options={buildingList} onSelect={onSelectOrigin} />
      </View>
      <IconSymbol
        name="more-vert"
        size={30}
        color="black"
        style={styles.modeIcon}
      />
      <View style={styles.dropdownWrapper}>
        <BuildingDropdown
          options={buildingList}
          onSelect={onSelectDestination}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "23%",
    width: "100%",
    padding: 16,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: "black",
    alignItems: "center",
  },
  dropdownWrapper: {
    alignItems: "center",
  },
  modeIcon: {
    alignItems: "center",
    color: "white",
    padding: 5,
  },
});
