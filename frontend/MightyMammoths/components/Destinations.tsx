// components/Destinations.tsx
import React, {useState, useEffect} from "react";
import { StyleSheet, View, Animated } from "react-native";
import BuildingDropdown from "@/components/ui/input/BuildingDropdown";
import { IconSymbol } from "@/components/ui/IconSymbol";

import { useNavigation } from "@/components/NavigationProvider";

interface DestinationChoicesProps {
  visible?: boolean;
}

export function DestinationChoices({
  visible
}: DestinationChoicesProps) {
  const { functions } = useNavigation();
  const { 
    setOrigin,
    setDestination, 
    setSelectedBuilding, 
    setTwoBuildingsSelected 
  } = functions;

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
  const slideAnim = useState(new Animated.Value(-500))[0];
  const checkSelection = (start: string | null, destination: string | null) => {
    setTwoBuildingsSelected(start !== null && destination !== null);
  };

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 20,
        friction: 7
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: -500,
        useNativeDriver: true,
        tension: 20,
        friction: 7
      }).start();
    }
  }, [visible]);

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.dropdownWrapper}>
        <BuildingDropdown options={buildingList} onSelect={(selected) => {
                        setSelectedStart(selected);
                        checkSelection(selected, selectedDestination);
                        setOrigin(selected);
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
            setDestination(selected);
            setSelectedBuilding(selected);
            setSelectedDestination(selected);
            checkSelection(selectedStart, selected);
          }}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "30%",
    width: "100%",
    paddingTop:75,
    padding: 16,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: "black",
    alignItems: "center",
    zIndex: 9999,
    elevation: 9999
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