import React, { useCallback, useRef, useMemo, useState, useEffect } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Keyboard  } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import ActionSheet from "react-native-actions-sheet"; //for some reason if I try to import it along ActionSheetRef it throws an error lol
import { ActionSheetRef } from "react-native-actions-sheet";

import ToggleSwitch from "@/components/ui/input/ToggleSwitch";
import GoogleCalendarButton from "@/components/ui/input/GoogleCalendarButton";
import RetroSwitch from "@/components/ui/input/RetroSwitch";
import BuildingDropdown from "@/components/ui/input/BuildingDropdown";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location'
import { SafeAreaView } from "react-native-safe-area-context";
import BuildingMapping from "@/components/ui/BuildingMapping"
import NavigationScreen from "./navigation";
import RoundButton from "@/components/ui/buttons/RoundButton";
import campusBuildingCoords from "../../assets/buildings/coordinates/campusbuildingcoords.json";
import mapStyle from "../../assets/map/map.json";
import LoyolaSGWToggleSheet from "@/components/ui/sheets/LoyolaSGWToggleSheet";
import BuildingInfoSheet from "@/components/ui/sheets/BuildingInfoSheet";
import {GeoJsonFeature} from "@/components/ui/BuildingMapping"




// Styling the map https://mapstyle.withgoogle.com/


export default function HomeScreen() {
  
  const sgwRegion = {
    latitude: 45.49465577566852,
    longitude: -73.57763385380554,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  };

  const loyolaRegion = {
    latitude: 45.458177049773354,
    longitude: -73.63924402074171,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  
  const mapRef = useRef<MapView>(null);
  const campusToggleSheet = useRef<ActionSheetRef>(null);
  const buildingInfoSheet = useRef<ActionSheetRef>(null);
  const [selectedCampus, setSelectedCampus] = useState("SGW");
  const [selectedBuilding, setSelectedBuilding] = useState<GeoJsonFeature | null >(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [selectedBuildingName, setSelectedBuildingName] = useState<string | null>(null);
  const [regionMap, setRegion] = useState(sgwRegion);
  const [myLocation, setMyLocation] = useState({latitude: 45.49465577566852, longitude: -73.57763385380554, latitudeDelta: 0.01, longitudeDelta: 0.01});
  const [showNavigation, setShowNavigation] = useState(false);


  const ChangeLocation = (area: string) => {
    let newRegion;
    if (area == "SGW") newRegion = sgwRegion;
    else if (area == "LOY") newRegion = loyolaRegion;
    else newRegion = myLocation;
    setRegion(newRegion);    
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  };

  const CenterOnCampus = (campus:string) => {
    setSelectedCampus(campus);
    ChangeLocation(campus);
  }

  const CenterOnLocation = async () => {
    const loc = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Low});
    setMyLocation({latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01})
    ChangeLocation("Own Location");
  };

  const setBuilding = (buildingName: string) => {
    const buildingFeature = campusBuildingCoords.features.find(
      (feature: GeoJsonFeature) => feature.properties.BuildingName === buildingName
    );
    if (buildingFeature) 
      setSelectedBuilding(buildingFeature);
  };

  const buildingList = campusBuildingCoords.features.map((feature)=> feature.properties.Building);

  const handleMarkerPress = (buildingName: string) => {
    setSelectedBuildingName(buildingName);
    setBuilding(buildingName);
    console.log(buildingName);
    console.log(buildingInfoSheet.current); 
    // TO FIX
    setTimeout(() => { // this is a temporary solution for the building sheet not appearing on first click
      if (buildingInfoSheet.current) {
        buildingInfoSheet.current.show();
      }
    }, 60); 
  };

  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
    })();
    campusToggleSheet.current?.show()

    console.log("all locked and loaded");
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);



  return (
    <>
      <GestureHandlerRootView style={styles.container}>
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
          customMapStyle={mapStyle}
          ref={mapRef}
        >
          <Marker
            image={require("../../assets/images/arrow.png")}
            coordinate={myLocation}
            title="MY LOCATION"
            description="MY LOCATION"
          />
          <BuildingMapping
            geoJsonData={campusBuildingCoords}
            onMarkerPress={handleMarkerPress}
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

        {/* LOCATION BUTTON */}
        <View style={styles.bottomElements}>
          <RoundButton
            imageSrc={require("@/assets/images/recenter-map.png")}
            onPress={CenterOnLocation}
          />
        </View>

        {/* SGW & LOY TOGGLE */}
        <LoyolaSGWToggleSheet
          actionsheetref = {campusToggleSheet}
          setSelectedCampus={CenterOnCampus}
        />
        
        {/* BUILDING INFO */}
        {selectedBuilding && (
          <BuildingInfoSheet
            actionsheetref={buildingInfoSheet}
            building={selectedBuilding}
          />
        )}
                 </>
        )}
      </GestureHandlerRootView>
    </>
  );
}

const styles = StyleSheet.create({
  root:{
    backgroundColor: '#010213',
    borderRadius: 10
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    paddingTop: 70,
    backgroundColor: "white",
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
  toggleButtonContainer: {
    position: "absolute",
    top: 30,
    left: 10,
    zIndex: 100,
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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
});
