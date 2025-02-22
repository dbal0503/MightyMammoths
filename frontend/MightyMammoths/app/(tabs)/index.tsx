import React, {useRef, useState, useEffect} from "react";
import {StyleSheet, View, Keyboard} from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ActionSheet from "react-native-actions-sheet"; //for some reason if I try to import it along ActionSheetRef it throws an error lol
import { ActionSheetRef } from "react-native-actions-sheet";
import BuildingDropdown from "@/components/ui/input/BuildingDropdown";
import AutoCompleteDropdown from "@/components/ui/input/AutoCompleteDropdown";
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location'
import BuildingMapping from "@/components/ui/BuildingMapping"
import RoundButton from "@/components/ui/buttons/RoundButton";
import campusBuildingCoords from "../../assets/buildings/coordinates/campusbuildingcoords.json";
import mapStyle from "../../assets/map/map.json"; // Styling the map https://mapstyle.withgoogle.com/
import { DestinationChoices } from "@/components/Destinations";
import { autoCompleteSearch, suggestionResult, getPlaceDetails, placeDetails } from "@/services/searchService";
import { BuildingData } from "@/components/ui/input/AutoCompleteDropdown";

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
  const buildingList: BuildingData[] = campusBuildingCoords.features.map(({properties})=> ({buildingName: properties.Building, placeID: properties.PlaceID || ""}));
  //Search Marker state
  const [searchMarkerLocation, setSearchMarkerLocation] = useState<Region>({latitude: 1, longitude: 1, latitudeDelta: 0.01, longitudeDelta: 0.01});
  const [searchMarkerVisible, setSearchMarkerVisible] = useState<boolean>(false);


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
    const loc = await Location.getCurrentPositionAsync();
    setMyLocation({latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005})
    ChangeLocation("my Location");
  };

  const setBuilding = (buildingName: string) => {
    const buildingFeature = campusBuildingCoords.features.find(
      (feature: GeoJsonFeature) => feature.properties.BuildingName === buildingName
    );
    if (buildingFeature) {
      setDestination(buildingFeature.properties.Building)
      setSelectedBuilding(buildingFeature);
    }
  };

  const handleMarkerPress = (buildingName: string) => {
    setSelectedBuildingName(buildingName);
    setBuilding(buildingName);
    console.log(buildingName);
    console.log(buildingInfoSheet.current); 
    setTimeout(() => {
      if (buildingInfoSheet.current) {
        buildingInfoSheet.current.show();
      }
    }, 60); 
  };

  const handleSearch = async (data: suggestionResult | undefined) => {
    try {
      if(data === undefined){
        console.log('selected place is undefined')
        return
      }
      const details = await getPlaceDetails(data.placePrediction.placeId)
      if(details === undefined){
        console.log('failed to fetch place location')
        return
      }
      const placeRegion: Region = {
        latitude: details.location.latitude,
        longitude: details.location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      }
      setSearchMarkerLocation(placeRegion);
      setRegion(placeRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(placeRegion, 1000);
      }

      setCurrentPlace(details);
      setDestination(data.placePrediction.structuredFormat.mainText.text)
      console.log(data);


      if(placeInfoSheet.current){
        setSearchMarkerVisible(true);
        placeInfoSheet.current.show();
      }else{
        console.log('location info sheet ref is not defined');
      }


      //TODO:
      //Show building details after animation
      //Show building details when clicking on marker
      //Refactor transition from details to navigation
    } catch (error) {
      console.log(`Error selecting place: ${error}`)
    }
  }

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
            onMarkerPress={handleMarkerPress}
          />

        </MapView>

        <View style={styles.topElements}>
          <RoundButton imageSrc={require("@/assets/images/gear.png")} testID="gear-icon" onPress={() => console.log("Gear icon pressed!") }/>
          <View style={styles.dropdownWrapper}>
            <AutoCompleteDropdown
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
            setNavigationMode = {setNavigationMode}
            actionsheetref={navigationSheet}
            closeChooseDest={setChooseDestVisible}
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
    position: 'absolute',
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