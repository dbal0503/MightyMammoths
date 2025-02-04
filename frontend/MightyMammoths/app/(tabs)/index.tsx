import React, { useCallback, useRef, useMemo, useState, useEffect } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Keyboard  } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import ToggleSwitch from "@/components/ui/input/ToggleSwitch";
import GoogleCalendarButton from "@/components/ui/input/GoogleCalendarButton";
import RetroSwitch from "@/components/ui/input/RetroSwitch";
import BuildingDropdown from "@/components/ui/input/BuildingDropdown";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location'
import { SafeAreaView } from "react-native-safe-area-context";

// Styling the map https://mapstyle.withgoogle.com/
const mapstyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#263c3f"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#6b9a76"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#38414e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#212a37"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9ca5b3"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#1f2835"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#f3d19c"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2f3948"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#515c6d"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  }
]


export default function HomeScreen() {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["20%", "70%"], []);
  const [selectedCampus, setSelectedCampus] = useState("SGW");
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [location, setLocation] = useState({latitude: 45.49465577566852,longitude: -73.57763385380554,});

  const [regionMap, setRegion] = useState({
    latitude: 45.49465577566852,
    longitude: -73.57763385380554,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const changeCampus = (campus: string) => {
    setSelectedCampus(campus);
    if (campus == "SGW")
      switchToSGW();
    else
      switchToLOY();
  }

  const switchToLOY = () => {
    setRegion({
      latitude: 45.458177049773354, 
      longitude: -73.63924402074171,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
      });
    }

    const switchToSGW = () => {
      setRegion({
        latitude: 45.49465577566852,
        longitude: -73.57763385380554,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }

  async function getCurrentLocation() {
    let location = await Location.getCurrentPositionAsync({});
    setLocation({latitude: location.coords.latitude, longitude: location.coords.longitude});
  }
 
  useEffect(() => {
    getCurrentLocation(); // set the current location

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

  //TODO: fetch list of buildings from backend
  const buildingList = ["EV","Hall", "JMSB", "CL Building", "Learning Square"];

  //TODO: This bottomsheet library is dogwater, replace with a better one

  console.log(location);
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
          title={"MY LOCATION"}
          description={"MY LOCATION"}
          />
        </MapView>
      
        

        <View style={styles.dropdownWrapper}>
          <BuildingDropdown options={buildingList} onSelect={(selected) => console.log(selected)} />
        </View>

        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          backgroundStyle={{backgroundColor: '#000A18'}}
          handleIndicatorStyle={{backgroundColor: 'white'}}
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
            <Text style={styles.accessibilityLabel}>Accessibility mode</Text>
            <RetroSwitch value={isEnabled} onValueChange={setIsEnabled} />
          </View>
        </BottomSheet>
      </GestureHandlerRootView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    paddingTop: 200,
    backgroundColor: 'white',
  },

  dropdownWrapper: {
    position: 'absolute',
    top: "8.5%",
    left: "15%",
    justifyContent: 'center'
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  centeredView: {
    marginTop: "10%",
    alignItems: "center",
    justifyContent: "center",
  },
  subTitleText : {
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