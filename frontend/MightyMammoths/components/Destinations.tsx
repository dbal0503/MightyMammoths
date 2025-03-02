import React, {useState, useEffect, useRef} from "react";
import { StyleSheet, View, Animated} from "react-native";
import AutoCompleteDropdown, { BuildingData, AutoCompleteDropdownRef } from "./ui/input/AutoCompleteDropdown";
import { IconSymbol, IconSymbolName } from "@/components/ui/IconSymbol";
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
  } = functions;

  const {
    searchSuggestions,
    setSearchSuggestions,
    loadingRoutes
  } = state;

  const topDropDownRef = useRef<AutoCompleteDropdownRef>(null);
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
      //cleanup
      topDropDownRef.current?.reset();
      setSelectedStart("");
      checkSelection("", selectedDestination);
      setOrigin("");
    }
  }, [visible]);

  useEffect(()=>{
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
          ref={topDropDownRef}
          locked={loadingRoutes}
          searchSuggestions={searchSuggestions}
          setSearchSuggestions={setSearchSuggestions}
          buildingData={buildingList} 
          onSelect={(selected) => {
            if(!selected) return;
            setSelectedStart(selected);
            checkSelection(selected, selectedDestination);
            setOrigin(selected);
        }} />
      </View>
      <IconSymbol
        name= {"more-vert" as IconSymbolName}
        size={30}
        color="black"
        style={styles.modeIcon}
      />
      <View style={styles.dropdownWrapper}>
        <AutoCompleteDropdown
          locked={loadingRoutes}
          searchSuggestions={searchSuggestions}
          setSearchSuggestions={setSearchSuggestions} 
          currentVal={destination}
          buildingData={buildingList}
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
    right: 30,
  },
  modeIcon: {
    alignItems: "center",
    color: "white",
    padding: 5,
  },
});