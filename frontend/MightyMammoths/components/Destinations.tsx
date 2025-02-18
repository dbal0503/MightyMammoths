// components/Destinations.tsx
import React, {useState, useEffect} from "react";
import { StyleSheet, View, Animated, Text, Pressable } from "react-native";
import BuildingDropdown from "@/components/ui/input/BuildingDropdown";
import AutoCompleteDropdown, { BuildingData } from "./ui/input/AutoCompleteDropdown";
import { IconSymbol } from "@/components/ui/IconSymbol";

import { useNavigation } from "@/components/NavigationProvider";

interface DestinationChoicesProps {
  buildingList: BuildingData[];
  visible?: boolean;
  destination: string;
}

export function DestinationChoices({
  buildingList,
  visible,
  destination
}: DestinationChoicesProps) {
  const { state, functions } = useNavigation();
  const { 
    setOrigin,
    setDestination, 
    setSelectedBuilding, 
    setTwoBuildingsSelected,
    fetchRoutes 
  } = functions;

  const {
    searchSuggestions,
    setSearchSuggestions
  } = state;

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
        <AutoCompleteDropdown
          searchSuggestions={searchSuggestions}
          setSearchSuggestions={setSearchSuggestions} 
          defaultVal={"Your Location"} 
          buildingData={buildingList} 
          onSelect={(selected) => {
            if(!selected) return;
            setSelectedStart(selected.placePrediction.structuredFormat.mainText.text);
            checkSelection(selected.placePrediction.structuredFormat.mainText.text, selectedDestination);
            setOrigin(selected.placePrediction.structuredFormat.mainText.text);
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
        <AutoCompleteDropdown
          searchSuggestions={searchSuggestions}
          setSearchSuggestions={setSearchSuggestions} 
          defaultVal={destination}
          buildingData={buildingList}
          onSelect={(selected) => {
            if(!selected) return;
            setDestination(selected.placePrediction.structuredFormat.mainText.text);
            setSelectedBuilding(selected.placePrediction.structuredFormat.mainText.text);
            setSelectedDestination(selected.placePrediction.structuredFormat.mainText.text);
            checkSelection(selectedStart, selected.placePrediction.structuredFormat.mainText.text);
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