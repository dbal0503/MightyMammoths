// components/Destinations.tsx
import React, {useState, useEffect, useRef, useCallback} from "react";
import { StyleSheet, View, Animated, Alert, Linking, TouchableOpacity} from "react-native";
import AutoCompleteDropdown, { BuildingData, AutoCompleteDropdownRef } from "./ui/input/AutoCompleteDropdown";
import * as Location from "expo-location";
import { useNavigation } from "@/components/NavigationProvider";
import { IconSymbolName, IconSymbol } from "@/components/ui/IconSymbol";

interface DestinationChoicesProps {
  readonly buildingList: BuildingData[];
  readonly visible?: boolean;
  readonly origin: string;
  readonly destination: string;
  readonly locationServicesEnabled: boolean;
}

export function DestinationChoices({
  buildingList,
  visible,
  origin,
  destination,
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
  const bottomDropDownRef = useRef<AutoCompleteDropdownRef>(null);
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
      setSelectedStart(origin);
      topDropDownRef.current?.setValue(origin);
      bottomDropDownRef.current?.setValue(destination);
    }
  }, [visible]);

  useEffect(()=>{
    setSelectedBuilding(destination);
    setSelectedStart(origin);
    setSelectedDestination(destination);
    checkSelection(selectedStart, destination);
  }, [destination, origin]);


  const _openAppSetting = useCallback(async () => {
        await Linking.openSettings();
      }, []);

  const checkLocationPermission = async (onSuccess: () => void, onCancel: () => void) => {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Location Services Disabled",
        "Please enable location services to use 'Your Location'.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              // Call the cancel callback to revert the dropdown value
              onCancel();
            }
          },
          {
            text: "Enable",
            onPress: () => {
              _openAppSetting();
            }
          }
        ],
        { cancelable: false }
      );
    } else {
      onSuccess();
    }
  };

  const swapBuildings = () => {
    if (origin && destination) {
      console.log(`Swapping ${destination} and ${origin}`)
      const tempOrigin = origin
      const tempDestination = destination // from index.tsx

      setSelectedStart(tempDestination);
      setSelectedDestination(tempOrigin);
  
      setOrigin(tempDestination);
      setDestination(tempOrigin); // Navigation context
      setSelectedBuilding(tempOrigin);
  
      topDropDownRef.current?.setValue(tempDestination);
      bottomDropDownRef.current?.setValue(tempOrigin);
    }
  };
      

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
          testID="originNavigationDropdown"
          ref={topDropDownRef}
          locked={loadingRoutes}
          searchSuggestions={searchSuggestions}
          setSearchSuggestions={setSearchSuggestions}
          buildingData={buildingList} 
          currentVal={origin}
          onSelect={(selected) => {
            console.log("Selected", selected);
            if(!selected) return;
            if (selected === "Your Location") {
              checkLocationPermission(
                () => {
                  checkSelection(selected, selectedDestination);
                  setOrigin(selected);
                },
                () => {
                  topDropDownRef.current?.reset();
                  setOrigin("Select a building");
                }
              );
            } else {
              checkSelection(selected, selectedDestination);
              setOrigin(selected);
            }
        }} />
      </View>
      <View style={styles.buttonContainer}>
        <IconSymbol
          name= {"more-vert" as IconSymbolName}
          size={30}
          color="black"
          style={styles.modeIcon}
          testID="more-vert"
        />
        <TouchableOpacity onPress={swapBuildings} style={styles.swapButton}>
          <IconSymbol
            name={"swap-vert" as IconSymbolName}
            size={30}
            color="black"
            style={styles.swapIcon}
            testID="swap-vert"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.dropdownWrapper}>
      <AutoCompleteDropdown
        testID="destinationNavigationDropdown"
        ref={bottomDropDownRef} // add the ref here
        locked={loadingRoutes}
        searchSuggestions={searchSuggestions}
        setSearchSuggestions={setSearchSuggestions} 
        currentVal={destination}
        buildingData={buildingList}
        onSelect={(selected) => {
          if (!selected) return;
          if (selected === "Your Location") {
            checkLocationPermission(
              () => {
                setDestination(selected);
                setSelectedBuilding(selected);
                setSelectedDestination(selected);
                checkSelection(selectedStart, selected);
              },
              () => {
                bottomDropDownRef.current?.reset();
                setDestination("Select a building");
                setSelectedBuilding("Select a building");
                setSelectedDestination("Select a building");
                
              }
            );
          } else {
            setDestination(selected);
            setSelectedBuilding(selected);
            setSelectedDestination(selected);
            checkSelection(selectedStart, selected);
          }
        }}
      />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "24%",
    width: "100%",
    paddingTop:30,
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
  buttonContainer:{
    display:'flex',
    flexDirection: 'row',
    
    width: 220,
    marginLeft: 195,
  },
  swapIcon: {
    alignItems: "center",
    color: "white",
    padding: 5,
  },
  swapButton:{
    marginLeft: 'auto',
  }
});