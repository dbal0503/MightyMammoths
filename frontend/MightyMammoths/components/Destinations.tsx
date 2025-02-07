// components/Destinations.tsx
import React, {useState} from "react";
import { StyleSheet, View } from "react-native";
import BuildingDropdown from "@/components/ui/input/BuildingDropdown";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface DestinationChoicesProps {
  onSelectOrigin: (origin: string) => void;
  setSelectedBuilding: (building: string) => void;
  onSelectDestination: (destination: string) => void;
  setTwoBuildingsSelected: (selected: boolean) => void;
}

export function DestinationChoices({
  onSelectOrigin,
  onSelectDestination,
  setSelectedBuilding,
  setTwoBuildingsSelected
}: DestinationChoicesProps) {
  const buildingList = [
    "EV",
    "Hall",
    "JMSB",
    "CL Building",
    "Learning Square",
    "Smith Building",
    "Hingston Hall",
  ];
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const checkSelection = (start: string | null, destination: string | null) => {
    setTwoBuildingsSelected(start !== null && destination !== null);
};
  return (
    <View style={styles.container}>
      <View style={styles.dropdownWrapper}>
        <BuildingDropdown options={buildingList} onSelect={(selected) => {
                        setSelectedStart(selected);
                        checkSelection(selected, selectedDestination);
                        onSelectOrigin(selected);
        }} />
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
          onSelect={(selected) => {
            onSelectDestination(selected);
            setSelectedBuilding(selected);
            setSelectedDestination(selected);
            checkSelection(selectedStart, selected);
          }}
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