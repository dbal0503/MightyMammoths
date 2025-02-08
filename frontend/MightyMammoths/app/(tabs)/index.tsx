import React, {
  useCallback,
  useRef,
  useMemo,
  useState,
  useEffect,
} from "react";
import { StyleSheet, View, Text, Button, Keyboard } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet from "@gorhom/bottom-sheet";
import ActionSheet from "react-native-actions-sheet"; //for some reason if I try to import it along ActionSheetRef it throws an error lol
import { ActionSheetRef } from "react-native-actions-sheet";

import ToggleSwitch from "@/components/ui/input/ToggleSwitch";
import GoogleCalendarButton from "@/components/ui/input/GoogleCalendarButton";
import RetroSwitch from "@/components/ui/input/RetroSwitch";
import BuildingDropdown from "@/components/ui/input/BuildingDropdown";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";

import RoundButton from "@/components/ui/buttons/RoundButton";
// Import your NavigationScreen component
import NavigationScreen from "./navigation";

export default function HomeScreen() {
  const sheetRef = useRef<BottomSheet>(null);
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const snapPoints = useMemo(() => ["17%", "70%"], []);
  const [selectedCampus, setSelectedCampus] = useState("SGW");
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((prev) => !prev);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [location, setLocation] = useState({
    latitude: 45.49465577566852,
    longitude: -73.57763385380554,
  });

  const [regionMap, setRegion] = useState({
    latitude: 45.49465577566852,
    longitude: -73.57763385380554,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const changeCampus = (campus: string) => {
    setSelectedCampus(campus);
    if (campus === "SGW") switchToSGW();
    else switchToLOY();
  };

  const switchToLOY = () => {
    setRegion({
      latitude: 45.458177049773354,
      longitude: -73.63924402074171,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const CenterOnLocation = () => {
    setRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const switchToSGW = () => {
    setRegion({
      latitude: 45.49465577566852,
      longitude: -73.57763385380554,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  async function getCurrentLocation() {
    let loc = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });
  }

  useEffect(() => {
    getCurrentLocation(); // set the current location

    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setIsKeyboardVisible(true);
        sheetRef.current?.close();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsKeyboardVisible(false);
        sheetRef.current?.snapToPosition("20%");
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  //TODO: fetch list of buildings from backend
  const buildingList = ["EV", "Hall", "JMSB", "CL Building", "Learning Square"];

  // Temporary state to toggle between Map view and NavigationScreen for testing
  const [showNavigation, setShowNavigation] = useState(false);

  return (
    <>
      <GestureHandlerRootView style={styles.container}>
        {/* Toggle button to switch views */}
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          customMapStyle={mapstyle}
          initialRegion={{
            latitude: 45.5017, // Default to Montreal (change as needed)
            longitude: -73.5673,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        />
        <View style={styles.toggleButtonContainer}>
          <Button
            title={showNavigation ? "Show Map View" : "Show Navigation Screen"}
            onPress={() => setShowNavigation((prev) => !prev)}
          />
        </View>

        {showNavigation ? (
          // Render NavigationScreen for testing
          <NavigationScreen />
        ) : (
          <>
            <MapView
              style={styles.map}
              initialRegion={regionMap}
              region={regionMap}
              customMapStyle={mapstyle}
            >
              <Marker
                image={require("../../assets/images/arrow.png")}
                coordinate={location}
                title={"MY LOCATION"}
                description={"MY LOCATION"}
              />
            </MapView>

            <View style={styles.topElements}>
              <RoundButton imageSrc={require("@/assets/images/gear.png")} />
              <View style={styles.dropdownWrapper}>
                <BuildingDropdown
                  options={buildingList}
                  onSelect={(selected) => console.log(selected)}
                />
              </View>
            </View>
            <View style={styles.bottomElements}>
              <RoundButton
                imageSrc={require("@/assets/images/recenter-map.png")}
                onPress={CenterOnLocation}
              />
            </View>

            <BottomSheet
              ref={sheetRef}
              snapPoints={snapPoints}
              enableDynamicSizing={false}
              backgroundStyle={{ backgroundColor: "#000A18" }}
              handleIndicatorStyle={{ backgroundColor: "white" }}
            >
              <View style={styles.centeredView}>
                <ToggleSwitch
                  options={["SGW", "LOY"]}
                  onToggle={(selected) => changeCampus(selected)}
                />
              </View>
              <Text style={styles.subTitleText}>Calendar</Text>
              <GoogleCalendarButton />
              <Text style={styles.subTitleText}>Accessibility</Text>
              <View style={styles.accessibilityContainer}>
                <Text style={styles.accessibilityLabel}>
                  Accessibility mode
                </Text>
                <RetroSwitch value={isEnabled} onValueChange={setIsEnabled} />
              </View>
            </BottomSheet>
            <ActionSheet ref={actionSheetRef}>
              <Text>Hi, I am here.</Text>
            </ActionSheet>
          </>
        )}
      </GestureHandlerRootView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    paddingTop: 70,
    backgroundColor: "white",
  },
  toggleButtonContainer: {
    position: "absolute",
    top: 30,
    left: 10,
    zIndex: 100,
  },
  dropdownWrapper: {
    top: "-29%",
    height: "10%",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomElements: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    position: "absolute",
    width: "100%",
    bottom: "22%",
    paddingRight: 20,
  },
  topElements: {
    gap: "6%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "10%",
  },
  centeredView: {
    marginTop: "10%",
    alignItems: "center",
    justifyContent: "center",
  },
  subTitleText: {
    color: "#b2b3b8",
    fontSize: 16,
    marginLeft: 40,
    marginTop: 30,
  },
  accessibilityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 40,
    marginRight: 40,
    marginTop: 20,
  },
  accessibilityLabel: {
    color: "white",
    fontSize: 22,
  },
});

// Styling the map https://mapstyle.withgoogle.com/
const mapstyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];