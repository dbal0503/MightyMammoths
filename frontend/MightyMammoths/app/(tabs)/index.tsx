import React, {useRef, useState, useEffect} from "react";
import {StyleSheet, View, Keyboard} from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ActionSheet from "react-native-actions-sheet"; //for some reason if I try to import it along ActionSheetRef it throws an error lol
import { ActionSheetRef } from "react-native-actions-sheet";
import AutoCompleteDropdown from "@/components/ui/input/AutoCompleteDropdown";
import MapView, { Marker, Polyline, LatLng, Polygon } from 'react-native-maps';
import * as Location from 'expo-location'
import BuildingMapping from "@/components/ui/BuildingMapping"
import RoundButton from "@/components/ui/buttons/RoundButton";
import campusBuildingCoords from "../../assets/buildings/coordinates/campusbuildingcoords.json";
import mapStyle from "../../assets/map/map.json"; // Styling the map https://mapstyle.withgoogle.com/
import { DestinationChoices } from "@/components/Destinations";
import { autoCompleteSearch, suggestionResult, getPlaceDetails, placeDetails } from "@/services/searchService";
import { BuildingData } from "@/components/ui/input/AutoCompleteDropdown";
import polyline from "@mapbox/polyline";
// Context providers
import { NavigationProvider } from "@/components/NavigationProvider";

// Sheets
import LoyolaSGWToggleSheet from "@/components/ui/sheets/LoyolaSGWToggleSheet";
import BuildingInfoSheet from "@/components/ui/sheets/BuildingInfoSheet";
import {GeoJsonFeature} from "@/components/ui/BuildingMapping"
import PlaceInfoSheet from "@/components/ui/sheets/PlaceInfoSheet";

// Styling the map https://mapstyle.withgoogle.com/
import NavigationSheet from "@/components/ui/sheets/NavigationSheet";


export default function HomeScreen() {
  interface Region {
    latitude: number,
    longitude: number,
    latitudeDelta: number,
    longitudeDelta: number,
  }
  
  const sgwRegion: Region = {
    latitude: 45.49465577566852,
    longitude: -73.57763385380554,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const loyolaRegion: Region = {
    latitude: 45.458177049773354,
    longitude: -73.63924402074171,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };
  
  const mapRef = useRef<MapView>(null);

  const campusToggleSheet = useRef<ActionSheetRef>(null);
  const buildingInfoSheet = useRef<ActionSheetRef>(null);
  const navigationSheet = useRef<ActionSheetRef>(null);

  //This is for globally storing data for place search so that all location choice dropdown
  //have the same options
  //probably should be refactored to be defined in a context if time allows
  const [searchSuggestions, setSearchSuggestions] = useState<suggestionResult[]>([]);

  const placeInfoSheet = useRef<ActionSheetRef>(null);
  const [currentPlace, setCurrentPlace] = useState<placeDetails| undefined>(undefined)
  const [destination, setDestination] = useState<string>("")
  const [navigationMode, setNavigationMode] = useState<boolean>(false);

  const [chooseDestVisible, setChooseDestVisible] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState("SGW");
  const [selectedBuilding, setSelectedBuilding] = useState<GeoJsonFeature | null >(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [selectedBuildingName, setSelectedBuildingName] = useState<string | null>(null);
  const [regionMap, setRegion] = useState(sgwRegion);
  const [myLocation, setMyLocation] = useState({latitude: 45.49465577566852, longitude: -73.57763385380554, latitudeDelta: 0.005, longitudeDelta: 0.005,});
  const [showNavigation, setShowNavigation] = useState(false);
  const buildingList: BuildingData[] = campusBuildingCoords.features.map(({properties})=> ({buildingName: properties.BuildingName, placeID: properties.PlaceID || ""}));
  //Search Marker state
  const [searchMarkerLocation, setSearchMarkerLocation] = useState<Region>({latitude: 1, longitude: 1, latitudeDelta: 0.01, longitudeDelta: 0.01});
  const [searchMarkerVisible, setSearchMarkerVisible] = useState<boolean>(false);
  const [polyline, setPolyline] = useState<LatLng[]>([]);

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

const centerAndShowBuilding = (buildingName: string) => {
  // 1. Find the building in your GeoJSON
  const buildingFeature = campusBuildingCoords.features.find(
    (feature: GeoJsonFeature) => 
      feature.properties.BuildingName === buildingName
  );
  if (!buildingFeature) {
    console.log("Cannot find building in campusBuildingCoords");
    return;
  }

  // 2. Update the state to store the selected building
  setDestination(buildingFeature.properties.BuildingName);
  setSelectedBuilding(buildingFeature);

  // 3. Get building coordinates (assuming a "Point" in geometry.coordinates)
  // If it’s a polygon, you might need to compute or store a centroid
  const [longitude, latitude] = buildingFeature.geometry.coordinates;

  // 4. Animate to the building location
  if (mapRef.current) {
    mapRef.current.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      1000 // animation duration ms
    );
  }

  // 5. Show the building info sheet after a brief delay
  setTimeout(() => {
    // If you also have a campusToggleSheet open, hide it:
    campusToggleSheet.current?.hide();

    // Then show the building sheet:
    if (buildingInfoSheet.current) {
      buildingInfoSheet.current.show();
    }
  }, 200);
};


  const CenterOnCampus = (campus:string) => {
    setSelectedCampus(campus);
    ChangeLocation(campus);
  }

  const CenterOnLocation = async () => {
    const loc = await Location.getCurrentPositionAsync();
    setMyLocation({latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005})
    ChangeLocation("my Location");
  };


  

  
  useEffect(() => {
    const buildingResults: suggestionResult[] = buildingList.map((building) => ({
      placePrediction: {
        place: building.buildingName,
        placeId: building.placeID,
        text: {
          text: building.buildingName,
          matches: [{ startOffset: 0, endOffset: building.buildingName.length }]
        },
        structuredFormat: {
          mainText: {
            text: building.buildingName,
            matches: [{ startOffset: 0, endOffset: building.buildingName.length }]
          },
          secondaryText: {
            text: ""
          }
        },
        types: ["building"]
      }
    }));
    setSearchSuggestions(buildingResults);
  }, []);

  const handleSearch = async (placeName: string) => {
    try {
      const data = searchSuggestions.find(
        (place) =>
          place.placePrediction.structuredFormat.mainText.text === placeName
      );
      if (data === undefined) {
        console.log('Index.tsx: selected place is undefined');
        return;
      }
  
      if (data.placePrediction.types.includes("building")) {
        // Update the building state so that BuildingInfoSheet gets the correct info
        
          centerAndShowBuilding(data.placePrediction.structuredFormat.mainText.text);
          return;
        
      }
  
      // For non-building suggestions, fetch details and create a waypoint as before
      const details = await getPlaceDetails(data.placePrediction.placeId);
      if (details === undefined) {
        console.log('Index.tsx: failed to fetch place location');
        return;
      }
      const placeRegion: Region = {
        latitude: details.location.latitude,
        longitude: details.location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      };
      setSearchMarkerLocation(placeRegion);
      setRegion(placeRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(placeRegion, 1000);
      }
  
      setCurrentPlace(details);
      setDestination(data.placePrediction.structuredFormat.mainText.text);
      if (placeInfoSheet.current) {
        setSearchMarkerVisible(true);
        placeInfoSheet.current.show();
      } else {
        console.log('Index.tsx: location info sheet ref is not defined');
      }
    } catch (error) {
      console.log(`Index.tsx: Error selecting place: ${error}`);
    }
  };
  

  // TODO: have destination be set to the selected building
  const startNavigation = () => {
    setChooseDestVisible(true);
    setNavigationMode(true);
    placeInfoSheet.current?.hide();
    buildingInfoSheet.current?.hide();
    navigationSheet.current?.show();

    //have destination be set to the selected building
  }
  

  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
      const loc = await Location.getCurrentPositionAsync();
      setMyLocation({latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005})
    })();

    campusToggleSheet.current?.show();

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
  }, [isKeyboardVisible]);

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
            title="My Location"
          />
          {searchMarkerVisible && 
            <Marker
              coordinate={searchMarkerLocation}
            />
          }
          <BuildingMapping
            geoJsonData={campusBuildingCoords}
            onMarkerPress={centerAndShowBuilding}
          />


          {polyline && 
            <Polyline
              strokeWidth={10}
              strokeColor="turquoise"
              coordinates={polyline}
              /> 
          }

        </MapView>

        <View style={styles.topElements}>
          <View style={styles.dropdownWrapper}>
            <AutoCompleteDropdown
              locked={false}
              searchSuggestions={searchSuggestions}
              setSearchSuggestions={setSearchSuggestions}
              buildingData={buildingList}
              onSelect={(selected) => handleSearch(selected)}
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
        {(isKeyboardVisible &&
        <LoyolaSGWToggleSheet
          actionsheetref = {campusToggleSheet}
          setSelectedCampus={CenterOnCampus}
        />
        )}
        
        {/* BUILDING INFO */}
        {selectedBuilding && (
          <BuildingInfoSheet
            navigate={startNavigation}
            actionsheetref={buildingInfoSheet}
            building={selectedBuilding}
            onClose={() => {
              campusToggleSheet.current?.show();
              setSelectedBuilding(null);
            }}
          />
        )}

        <PlaceInfoSheet
          navigate={startNavigation}
          actionsheetref={placeInfoSheet}
          placeDetails={currentPlace}
        />

        <NavigationProvider
          searchSuggestions={searchSuggestions}
          setSearchSuggestions={setSearchSuggestions}
          navigationMode={navigationMode}
        >
          <NavigationSheet
            setNavigationMode={setNavigationMode}
            actionsheetref={navigationSheet}
            closeChooseDest={setChooseDestVisible}
            onPolylineUpdate={(poly) => setPolyline(poly)}
          />
          <DestinationChoices
            buildingList={buildingList}
            visible={chooseDestVisible}
            destination={destination}
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
    top: 0,
    position: 'absolute',
    left: 30,
    gap: "6%",
    marginTop: 45,
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