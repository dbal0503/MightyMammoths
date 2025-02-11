// components/Destinations.tsx
import React, {useState, useEffect} from "react";
import { StyleSheet, View, Animated, Text, Pressable } from "react-native";
import BuildingDropdown from "@/components/ui/input/BuildingDropdown";
import { IconSymbol } from "@/components/ui/IconSymbol";

import { useNavigation } from "@/components/NavigationProvider";

interface DestinationChoicesProps {
  buildingList: string[];
  visible?: boolean;
  destination: string;
}

export function DestinationChoices({
  buildingList,
  visible,
  destination
}: DestinationChoicesProps) {
  const { functions } = useNavigation();
  const { 
    setOrigin,
    setDestination, 
    setSelectedBuilding, 
    setTwoBuildingsSelected,
    fetchRoutes 
  } = functions;

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

  useEffect(()=>{
    setSelectedStart("Your Location");
    checkSelection("Your Location", selectedDestination);
    setOrigin("Your Location");

    setDestination(destination);
    setSelectedBuilding(destination);
    setSelectedDestination(destination);
    checkSelection(selectedStart, destination);
  }, [destination])

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
        <BuildingDropdown defaultVal={"Your Location"} options={["Your Location", ...buildingList]} onSelect={(selected) => {
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
      {/* <Pressable onPress={async ()=>{
          await fetchRoutes();
          console.log('fetching routes')
        }}>
        <Text style={{color: 'white', backgroundColor: 'green', width: 30, height: 30}}>Temp</Text>
      </Pressable> */}
      <View style={styles.dropdownWrapper}>
        <BuildingDropdown
          defaultVal={destination}
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