import React, { useCallback, useRef, useMemo, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Keyboard,
  Modal,
  TouchableOpacity,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet from "@gorhom/bottom-sheet";
import ActionSheet from "react-native-actions-sheet";
import { ActionSheetRef } from "react-native-actions-sheet";

import BuildingDropdown from "@/components/ui/input/BuildingDropdown";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import BuildingMapping from "@/components/ui/BuildingMapping";
import BuildingInfo from "@/components/BuildingInfoSheet";
import RoundButton from "@/components/ui/buttons/RoundButton";
import campusBuildingCoords from "../../assets/buildings/coordinates/campusbuildingcoords.json";
import LoyolaSGWToggleSheet from "@/components/ui/sheets/LoyolaSGWToggleSheet";
import BuildingInfoSheet from "@/components/ui/sheets/BuildingInfoSheet";



// Map styling from https://mapstyle.withgoogle.com/
const mapstyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
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
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
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

export default function HomeScreen() {
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["17%", "70%"], []);
  const [selectedCampus, setSelectedCampus] = useState("SGW");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [location, setLocation] = useState({
    latitude: 45.49465577566852,
    longitude: -73.57763385380554,
  });
  const [regionMap, setRegion] = useState({
    latitude: 45.49465577566852,
    longitude: -73.57763385380554,
    latitudeDelta: 0.0006,
    longitudeDelta: 0.0006,
  });

  // Modal state
  const [selectedBuildingName, setSelectedBuildingName] = useState<string | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);

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
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    });
  };

  async function getCurrentLocation() {
    let loc = await Location.getCurrentPositionAsync({});
    setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
  }

  useEffect(() => {
    getCurrentLocation();
    actionSheetRef.current?.show()

    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
      sheetRef.current?.close();
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
      sheetRef.current?.snapToPosition("20%");
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // TODO: fetch list of buildings from backend
  //for feature in features, feature.properties.Building
  //const buildingList = ["EV", "Hall", "JMSB", "CL Building", "Learning Square"];
  const buildingList = campusBuildingCoords.features.map((feature)=> feature.properties.Building);

  const handleMarkerPress = (buildingName: string) => {
    setSelectedBuildingName(buildingName);
    console.log(selectedBuildingName);
    setModalVisible(true);
  };

  return (
    <>
      <GestureHandlerRootView style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={regionMap}
          region={regionMap}
          customMapStyle={mapstyle}
        >
          <Marker
            image={require("../../assets/images/arrow.png")}
            coordinate={location}
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
        <View style={styles.bottomElements}>
          <RoundButton
            imageSrc={require("@/assets/images/recenter-map.png")}
            onPress={CenterOnLocation}
          />
        </View>
        <LoyolaSGWToggleSheet
          actionsheetref = {actionSheetRef}
          setSelectedCampus={setSelectedCampus}
        />
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
