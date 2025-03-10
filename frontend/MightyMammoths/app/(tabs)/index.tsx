import React, {useRef, useState, useEffect, useCallback} from "react";
import {StyleSheet, View, Keyboard} from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActionSheetRef } from "react-native-actions-sheet";
import AutoCompleteDropdown from "@/components/ui/input/AutoCompleteDropdown";
import MapView, { Marker, Polyline, LatLng} from 'react-native-maps';
import * as Location from 'expo-location'
import BuildingMapping from "@/components/ui/BuildingMapping"
import RoundButton from "@/components/ui/buttons/RoundButton";
import campusBuildingCoords from "../../assets/buildings/coordinates/campusbuildingcoords.json";
import mapStyle from "../../assets/map/map.json"; // Styling the map https://mapstyle.withgoogle.com/
import { DestinationChoices } from "@/components/Destinations";
import { suggestionResult, getPlaceDetails, placeDetails } from "@/services/searchService";
import { BuildingData } from "@/components/ui/input/AutoCompleteDropdown";
import { Image } from "react-native";
// Context providers
import { Alert, Linking } from 'react-native';
import { NavigationProvider } from "@/components/NavigationProvider";
import { AppState } from 'react-native';
import { computeBearing } from "@/utils/computeBearing";
import { haversineDistance } from "@/utils/haversineDistance";
import { getPlaceIdCoordinates } from "@/services/getPlaceIdCoordinates";

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
  const [selectedBuilding, setSelectedBuilding] = useState<GeoJsonFeature | null >(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [regionMap, setRegion] = useState(sgwRegion);
  const [myLocation, setMyLocation] = useState({latitude: 45.49465577566852, longitude: -73.57763385380554, latitudeDelta: 0.005, longitudeDelta: 0.005,});
  const buildingList: BuildingData[] = campusBuildingCoords.features.map(({properties})=> ({buildingName: properties.BuildingName, placeID: properties.PlaceID || ""}));

  //Search Marker state
  const [searchMarkerLocation, setSearchMarkerLocation] = useState<Region>({latitude: 1, longitude: 1, latitudeDelta: 0.01, longitudeDelta: 0.01});
  const [searchMarkerVisible, setSearchMarkerVisible] = useState<boolean>(false);
  const [routePolyline, setRoutePolyline] = useState<LatLng[]>([]);
  const routePolylineRef = useRef<LatLng[]>([]);
  const [latitudeStepByStep, setLatitudeStepByStep] = useState(0);
  const [longitudeStepByStep, setLongitudeStepByStep] = useState(0);

  const ChangeLocation = (area: string) => {
    let newRegion;
    if (area === "SGW") newRegion = sgwRegion;
    else if (area === "LOY") newRegion = loyolaRegion;
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
    ChangeLocation(campus);
  }

  const CenterOnLocation = async () => {
    const loc = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Highest});
    const newRegion: Region = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: isZoomedIn ? 0.001 : 0.005,
      longitudeDelta: isZoomedIn ? 0.001 : 0.005,
    };

    setMyLocation(newRegion);

    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 500);
    }
  };
  

  useEffect(() => {
    if(latitudeStepByStep!==0 && longitudeStepByStep!==0){
      recenterToPolyline(latitudeStepByStep, longitudeStepByStep) 
    }
  }, [latitudeStepByStep, longitudeStepByStep]);
 
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

  const _openAppSetting = useCallback(async () => {
      await Linking.openSettings();
    }, []);
  const [locationServicesEnabled, setLocationServicesEnabled] = useState(false);
  const handleSearch = async (placeName: string) => {

    if (placeName === "Your Location") {
      const { status } = await Location.getForegroundPermissionsAsync();
      if(status !== 'granted'){
        setLocationServicesEnabled(false);
        Alert.alert(
          "Location Services Disabled",
          "Please enable location services to use this feature.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Enable",
              onPress: () => {
                _openAppSetting();
              }
            }
          ]
        );
        return;
      } else {
        setLocationServicesEnabled(true);
        CenterOnLocation();
        return;
      }
    }
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

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active") {
        // When the app becomes active, check the current location permissions
        const { status } = await Location.getForegroundPermissionsAsync();
        setLocationServicesEnabled(status === 'granted');
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);
  
  
  // TODO: have destination be set to the selected building
  const startNavigation = () => {
    setChooseDestVisible(true);
    setNavigationMode(true);
    placeInfoSheet.current?.hide();
    buildingInfoSheet.current?.hide();
    campusToggleSheet.current?.hide();
    navigationSheet.current?.show();
  }
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [zoomedRegion, setZoomedRegion] = useState<Region | null>(null);
  const [isOriginYourLocation, setIsOriginYourLocation] = useState(false);

  const zoomIn = async (originCoordsPlaceID: string, originPlaceName: string) => {
    if (mapRef.current) {
      let targetRegion: Region | undefined;
  
      if (originPlaceName === "Your Location" && myLocation) {
        setIsOriginYourLocation(true);
        targetRegion = {
          latitude: myLocation.latitude,
          longitude: myLocation.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        };
      } else {
        const buildingCoords = campusBuildingCoords.features.find(
          feature => feature.properties.BuildingName === originPlaceName
        )?.geometry.coordinates;
  
        if (buildingCoords) {
          targetRegion = {
            latitude: buildingCoords[1],
            longitude: buildingCoords[0],
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          };
        } else {
          const placeIdCoords = await getPlaceIdCoordinates(originCoordsPlaceID);
          targetRegion = {
            latitude: placeIdCoords.latitude,
            longitude: placeIdCoords.longitude,
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          };
        }
      }
  
      if (targetRegion) {
        setZoomedRegion(targetRegion);
        mapRef.current.animateToRegion(targetRegion, 700);
        setIsZoomedIn(true);
      }
    }
  };
  
  const recenterToPolyline = (latitude: any, longitude: any) => {
    if (mapRef?.current !== null){
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      },1000);
    }
  }

  // Zoom out: Revert to the original region (or a less zoomed-in version)
  const zoomOut = async (destinationCoordsPlaceID: string, destinationPlaceName:string) => {
    if (mapRef.current && isZoomedIn && zoomedRegion && myLocation) {
      let targetRegion: Region | undefined;
  
      if (destinationPlaceName === "Your Location") {
        targetRegion = {
          latitude: myLocation.latitude,
          longitude: myLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
      } else {
        const buildingCoords = campusBuildingCoords.features.find(
          feature => feature.properties.BuildingName === destinationPlaceName
        )?.geometry.coordinates;
  
        if (buildingCoords) {
          targetRegion = {
            latitude: buildingCoords[1],
            longitude: buildingCoords[0],
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          };
        } else {
          const placeIdCoords = await getPlaceIdCoordinates(destinationCoordsPlaceID);
          targetRegion = {
            latitude: placeIdCoords.latitude,
            longitude: placeIdCoords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          };
        }
      }

      if (targetRegion) {
        setIsOriginYourLocation(false);
        setZoomedRegion(null);
        mapRef.current.animateToRegion(targetRegion, 1000);
        setIsZoomedIn(false);
      }
    }
  };

  useEffect(() => {
    routePolylineRef.current = routePolyline;
  }, [routePolyline]);


  const navigateToRoutes = (destination: string) => {
    setDestination(destination);
    navigationSheet.current?.show();
    placeInfoSheet.current?.hide();
    buildingInfoSheet.current?.hide();
    setChooseDestVisible(true);
    setNavigationMode(true);
};


  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationServicesEnabled(status === 'granted');
      if (status !== 'granted') {
        console.log('Permission denied');
        return;
      }
    })();
  
    const updateLocation = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationServicesEnabled(granted);
  
      if (!granted) {
        return;
      }
      // const loc = await Location.getCurrentPositionAsync();
      // const newLocation = {
      //   latitude: loc.coords.latitude,
      //   longitude: loc.coords.longitude,
      //   latitudeDelta: 0.005,
      //   longitudeDelta: 0.005,
      // };
      // setMyLocation(newLocation);
      if (!isZoomedIn) {
        return;
      }
      if (routePolylineRef.current && routePolylineRef.current.length > 0) {
        if (isOriginYourLocation) {
          CenterOnLocation();
          // let candidate: { latitude: number; longitude: number } | null = null;
          // for (const point of routePolylineRef.current) {
          //   const d = haversineDistance(newLocation, point);
          //   if (d >= 5) {
          //     candidate = point;
          //     break;
          //   }
          // }
    
          // if (!candidate) {
          //   candidate = routePolylineRef.current.reduce((prev, curr) => {
          //     return haversineDistance(newLocation, curr) > haversineDistance(newLocation, prev) ? curr : prev;
          //   }, routePolylineRef.current[0]);
          // }

          // const bearing = computeBearing(newLocation, candidate);
          // //console.log("Bearing: ", bearing);
          // if (mapRef.current) {
          //   mapRef.current.animateCamera({ heading: bearing }, { duration: 500 });
          // }
        }
      } else {
        if (mapRef.current) {
          mapRef.current.animateCamera({ heading: 0 }, { duration: 1000 });
        }
      }
    };
  
    // Run updateLocation immediately and then every 3 seconds
    updateLocation();
    const intervalId = setInterval(updateLocation, 5000);
  
    campusToggleSheet.current?.show();

    //console.log("all locked and loaded");
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });
  
    return () => {
      clearInterval(intervalId);
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [isKeyboardVisible, isOriginYourLocation, isZoomedIn]);

  return (
    <>
      <GestureHandlerRootView style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={regionMap}
          customMapStyle={mapStyle}
          ref={mapRef}
          rotateEnabled={true}
        >
          {locationServicesEnabled && myLocation && (
            <Marker coordinate={myLocation} title="My Location">
              <Image
                source={require("../../assets/images/userLocationDot.png")}
                style={{ width: 22, height: 22 }}
              />
            </Marker>
          )}

          {searchMarkerVisible && 
            <Marker
              coordinate={searchMarkerLocation}
            />
          }
          <BuildingMapping
            geoJsonData={campusBuildingCoords}
            onMarkerPress={centerAndShowBuilding}
          />

          {routePolyline && 
            <Polyline
              strokeWidth={10}
              strokeColor="turquoise"
              coordinates={routePolyline}
              /> 
          }
        </MapView>

        <View style={styles.topElements}>
          {!navigationMode && (
            <View style={styles.dropdownWrapper}>
              <AutoCompleteDropdown
                testID="searchBarHomeSheet"
                locked={false}
                searchSuggestions={searchSuggestions}
                setSearchSuggestions={setSearchSuggestions}
                buildingData={buildingList}
                onSelect={(selected) => handleSearch(selected)}
              />
            </View>
          )}
        </View>

        {/* LOCATION BUTTON */}
        <View style={styles.bottomElements}>
        {locationServicesEnabled && (
          <RoundButton
            imageSrc={require("@/assets/images/recenter-map.png")}
            onPress={CenterOnLocation}
            testID="recenter-button"
          />)}
        </View>

        {/* SGW & LOY TOGGLE */}
        {(!isKeyboardVisible &&

        <LoyolaSGWToggleSheet
          actionsheetref = {campusToggleSheet}
          setSelectedCampus={CenterOnCampus}
          navigateToRoutes={navigateToRoutes} 
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
            onPolylineUpdate={(poly) => setRoutePolyline(poly)}
            onExtraClose={() => {
              campusToggleSheet.current?.show();
            }}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            setLatitudeStepByStep = {setLatitudeStepByStep}
            setLongitudeStepByStep = {setLongitudeStepByStep}
            isZoomedIn={isZoomedIn}
            userLocation={myLocation}
          
          />
          <DestinationChoices
            buildingList={buildingList}
            visible={chooseDestVisible}
            destination={destination}
            locationServicesEnabled={locationServicesEnabled}
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
    bottom: "22%",
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