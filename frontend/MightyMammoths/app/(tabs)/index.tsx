import React, {useRef, useState, useEffect} from "react";
import {StyleSheet, View, Keyboard} from "react-native";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {ActionSheetRef} from "react-native-actions-sheet";
import {GeoJsonFeature} from "@/components/ui/BuildingMapping"
import BuildingDropdown from "@/components/ui/input/BuildingDropdown";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import BuildingMapping from "@/components/ui/BuildingMapping";
import RoundButton from "@/components/ui/buttons/RoundButton";
import campusBuildingCoords from "../../assets/buildings/coordinates/campusbuildingcoords.json";
import mapStyle from "../../assets/map/map.json";
import { DestinationChoices } from "@/components/Destinations";

//Context providers
import { NavigationProvider } from "@/components/NavigationProvider";

//sheets
import LoyolaSGWToggleSheet from "@/components/ui/sheets/LoyolaSGWToggleSheet";
import BuildingInfoSheet from "@/components/ui/sheets/BuildingInfoSheet";
import NavigationSheet from "@/components/ui/sheets/NavigationSheet";


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
  const navigationSheet = useRef<ActionSheetRef>(null);
  const [chooseDestVisible, setChooseDestVisible] = useState(false);

  const [selectedCampus, setSelectedCampus] = useState("SGW");
  const [selectedBuilding, setSelectedBuilding] = useState<GeoJsonFeature | null >(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [selectedBuildingName, setSelectedBuildingName] = useState<string | null>(null);
  const [regionMap, setRegion] = useState(sgwRegion);
  const [myLocation, setMyLocation] = useState({latitude: 45.49465577566852, longitude: -73.57763385380554, latitudeDelta: 0.01, longitudeDelta: 0.01});

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

  //will change to also have addresses
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

  const startNavigation = () => {
    buildingInfoSheet.current?.hide();
    navigationSheet.current?.show();
    setChooseDestVisible(true);
    //have destination be set to the selected building

  }

  useEffect(() => {
    async()=>{await Location.requestForegroundPermissionsAsync();}
    campusToggleSheet.current?.show()

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
            navigate={startNavigation}
            actionsheetref={buildingInfoSheet}
            building={selectedBuilding}
          />
        )}

        <NavigationProvider>
          <NavigationSheet
            actionsheetref={navigationSheet}
            closeChooseDest={setChooseDestVisible}
          />
          <DestinationChoices
            buildingList={buildingList}
            visible={chooseDestVisible}
            destination={selectedBuilding?.properties.Building || ""}
          />
        </NavigationProvider>

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
    //paddingTop: 70,
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
    bottom: "18%",
    paddingRight: 20,
  },
  topElements: {
    position: 'absolute',
    // position coordinates
    top: 0,
    left: 28,

    gap: "6%",
    marginTop: 70,
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