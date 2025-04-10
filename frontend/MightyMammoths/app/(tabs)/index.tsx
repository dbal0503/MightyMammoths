import React, {useRef, useState, useEffect, useCallback, useMemo} from "react";
import {StyleSheet, View, Keyboard, AppState, Linking, Platform, Alert, Image} from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActionSheetRef } from "react-native-actions-sheet";
import {AutoCompleteDropdown,} from "@/components/ui/input/AutoCompleteDropdown";
import MapView, { Marker, Polyline, LatLng, BoundingBox } from "react-native-maps";
import * as Location from "expo-location";
import BuildingMapping, {GeoJsonFeature,} from "@/components/ui/BuildingMapping";
import RoundButton from "@/components/ui/buttons/RoundButton";
import campusBuildingCoords from "../../assets/buildings/coordinates/campusbuildingcoords.json";
import mapStyle from "../../assets/map/map.json"; // Styling the map https://mapstyle.withgoogle.com/
import { DestinationChoices } from "@/components/DestinationsChoices";
import {SuggestionResult,getPlaceDetails,PlaceDetails,} from "@/services/searchService";
import { useFirstLaunch } from '../../hooks/useFirstLaunch'
import TutorialHowTo from "@/components/TutorialHowTo";

// Context providers
import { NavigationProvider } from "../../components/NavigationProvider";
import { getPlaceIdCoordinates } from "../../services/getPlaceIdCoordinatesService";

// Sheets
import LoyolaSGWToggleSheet from "@/components/ui/sheets/LoyolaSGWToggleSheet";
import BuildingInfoSheet from "@/components/ui/sheets/BuildingInfoSheet";
import PlaceInfoSheet from "@/components/ui/sheets/PlaceInfoSheet";
import NavigationSheet from "@/components/ui/sheets/NavigationSheet";
import IndoorMapModal from "@/components/ui/IndoorMapModal";
import { buildingList } from "@/utils/getBuildingList";

export default function HomeScreen() {
  interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
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
  const isFirstLaunch = useFirstLaunch();
  const [showTutorialHowTo, setShowTutorialHowTo] = useState(true);
  const [indoorMapVisible, setIndoorMapVisible] = useState(false);
  const placeInfoSheet = useRef<ActionSheetRef>(null);

  //This is for globally storing data for place search so that all location choice dropdown have the same options
  //probably should be refactored to be defined in a context if time allows
  const [searchSuggestions, setSearchSuggestions] = useState<SuggestionResult[]>([]); //stores google api search suggestion data
  const [currentPlace, setCurrentPlace] = useState<PlaceDetails| undefined>(undefined)
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("")
  const [navigationMode, setNavigationMode] = useState<boolean>(false);
  const [chooseDestVisible, setChooseDestVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<GeoJsonFeature | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [regionMap, setRegion] = useState(sgwRegion);
  const [myLocation, setMyLocation] = useState({
    latitude: 45.49465577566852,
    longitude: -73.57763385380554,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  //Search Marker state
  const [searchMarkerLocation, setSearchMarkerLocation] = useState<Region>({
    latitude: 1,
    longitude: 1,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [searchMarkerVisible, setSearchMarkerVisible] = useState<boolean>(false);
  const [routePolyline, setRoutePolyline] = useState<LatLng[]>([]);
  const routePolylineRef = useRef<LatLng[]>([]);
  const [latitudeStepByStep, setLatitudeStepByStep] = useState(0);
  const [longitudeStepByStep, setLongitudeStepByStep] = useState(0);
  const [nearbyPlaces, setNearbyPlaces] = useState<SuggestionResult[]>([]);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [zoomedRegion, setZoomedRegion] = useState<Region | null>(null);
  const [isOriginYourLocation, setIsOriginYourLocation] = useState(false);
  const [boundaries, setBoundaries] = useState<BoundingBox>();
  const [showCafes, setShowCafes] = useState(false);
  const [showRestaurants, setShowRestaurants] = useState(false);
  const [destinationRoom, setDestinationRoom] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [classBuilding, setClassBuilding] = useState<string | null>(null);
  const [classRoom, setClassRoom] = useState<string | null>(null);
 
  const parseRoomNumber = (text: string): string | null => {
    const match = /(?:room\s+)?(\d+)|\b([a-z])-(\d+)\b/i.exec(text);
    return match ? match[1] || match[3] : null;
  };


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
    // If it's a polygon, you might need to compute or store a centroid
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

  const CenterOnCampus = (campus: string) => {
    ChangeLocation(campus);
  };

  const CenterOnLocation = async () => {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });
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

  const recenterToPolyline = (latitude: number, longitude: number) => {
    if (mapRef?.current !== null){
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      },1000);
    }
  }

  const fetchBoundaries = async () => {
    if (mapRef.current) {
      try {
        const bounds = await mapRef.current.getMapBoundaries();
        // Perform a shallow comparison or a more robust deep comparison if needed.
        if (
          !boundaries ||
          boundaries.northEast.latitude !== bounds.northEast.latitude ||
          boundaries.northEast.longitude !== bounds.northEast.longitude ||
          boundaries.southWest.latitude !== bounds.southWest.latitude ||
          boundaries.southWest.longitude !== bounds.southWest.longitude
        ) {
          setBoundaries(bounds);
        }
      } catch (error) {
        console.error("Error fetching boundaries:", error);
      }
    }
  };
  
  useEffect(() => {
    if (latitudeStepByStep !== 0 && longitudeStepByStep !== 0) {
      recenterToPolyline(latitudeStepByStep, longitudeStepByStep);
    }
  }, [latitudeStepByStep, longitudeStepByStep]);

  useEffect(() => {
    const buildingResults: SuggestionResult[] = buildingList.map((building) => ({
      discriminator: "building",
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
      if (status !== "granted") {
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
              },
            },
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
        console.log("Index.tsx: selected place is undefined");
        return;
      }

      if (data.placePrediction.types.includes("building")) {
        // Update the building state so that BuildingInfoSheet gets the correct info
        centerAndShowBuilding(
          data.placePrediction.structuredFormat.mainText.text
        );
        return;
      }

      // For non-building suggestions, fetch details and create a waypoint as before
      const details = await getPlaceDetails(data.placePrediction.placeId);
      if (details === undefined) {
        console.log("Index.tsx: failed to fetch place location");
        return;
      }
      const placeRegion: Region = {
        latitude: details.location.latitude,
        longitude: details.location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
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
        console.log("Index.tsx: location info sheet ref is not defined");
      }
    } catch (error) {
      console.log(`Index.tsx: Error selecting place: ${error}`);
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (nextAppState === "active") {
          // When the app becomes active, check the current location permissions
          const { status } = await Location.getForegroundPermissionsAsync();
          setLocationServicesEnabled(status === "granted");
        }
      }
    );
    return () => {
      subscription.remove();
    };
  }, []);


const handleNearbyPlacePress = async(place: SuggestionResult) => {
  try {
    if (!place.location || !place.placePrediction) {
      console.log('Index.tsx: nearby place has no location data');
      return;
    }

    const placeExists = searchSuggestions.some(
      (suggestion) => suggestion.placePrediction.placeId === place.placePrediction.placeId
    );

    if (!placeExists) {
      setSearchSuggestions((prevSuggestions) => [...prevSuggestions, place]);
    }

    //Region for the place
    const placeRegion: Region = {
      latitude: place.location.latitude,
      longitude: place.location.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005
    };

    setSearchMarkerLocation(placeRegion);
    setRegion(placeRegion);
    setSearchMarkerVisible(true);

    // Fetching the place details
    if (place.placePrediction.placeId) {
      const details = await getPlaceDetails(place.placePrediction.placeId);
      if (details) {
        setCurrentPlace(details);
        setDestination(place.placePrediction.structuredFormat.mainText.text);
      }
    }

    if (mapRef.current) {
      mapRef.current.animateToRegion(placeRegion, 1000);
    }

    campusToggleSheet.current?.hide();
    buildingInfoSheet.current?.hide();
    
    if (placeInfoSheet.current) {
      placeInfoSheet.current.show();
    } 
    else {
      console.log('Index.tsx: place info sheet ref is not defined');
    }
  } 
  catch (error) {
    console.log(`Index.tsx: Error handling nearby place: ${error}`);
  }
};

  // TODO: have destination be set to the selected building
  const startNavigation = () => {
    setOrigin("Your Location");
    setChooseDestVisible(true);
    setNavigationMode(true);
    
    // Extract room number from destination if possible
    const roomNumber = parseRoomNumber(destination);
    setDestinationRoom(roomNumber);
    
    placeInfoSheet.current?.hide();
    buildingInfoSheet.current?.hide();
    campusToggleSheet.current?.hide();
    navigationSheet.current?.show();
  };

  const zoomIn = async (
    originCoordsPlaceID: string,
    originPlaceName: string
  ) => {
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
          (feature) => feature.properties.BuildingName === originPlaceName
        )?.geometry.coordinates;

        if (buildingCoords) {
          targetRegion = {
            latitude: buildingCoords[1],
            longitude: buildingCoords[0],
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          };
        } else {
          const placeIdCoords = await getPlaceIdCoordinates(
            originCoordsPlaceID
          );
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

  // Zoom out: Revert to the original region (or a less zoomed-in version)
  const zoomOut = async (
    destinationCoordsPlaceID: string,
    destinationPlaceName: string
  ) => {
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
          (feature) => feature.properties.BuildingName === destinationPlaceName
        )?.geometry.coordinates;

        if (buildingCoords) {
          targetRegion = {
            latitude: buildingCoords[1],
            longitude: buildingCoords[0],
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          };
        } else {
          const placeIdCoords = await getPlaceIdCoordinates(
            destinationCoordsPlaceID
          );
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


  function navigateToRoutes (
    params: string | { origin?: string; destination: string }
  ) {
    console.log("Origin: ", origin);
    console.log("Destination: ", destination);
    let finalDestination: string;
    let finalOrigin: string | undefined;
  
    if (typeof params === "string") {
      finalDestination = params;
      finalOrigin = undefined;
    } else {
      finalDestination = params.destination;
      finalOrigin = params.origin;
    }
    console.log("Final Destination: ", finalDestination);
    console.log("Final Origin: ", finalOrigin);
  
    if (!finalDestination) return;
  
    setDestination(finalDestination);
  
    // Store origin so NavigationSheet can access it
    if (finalOrigin) {
      setOrigin(finalOrigin);
    } else {
      setOrigin("Your Location");
    }

    navigationSheet.current?.show();
    placeInfoSheet.current?.hide();
    buildingInfoSheet.current?.hide();
    setChooseDestVisible(true);
    setNavigationMode(true);
  }

  //have destination be set to the selected building

  const switchToIndoor = () => {
    placeInfoSheet.current?.hide();
    campusToggleSheet.current?.hide();
    setIndoorMapVisible(true);
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationServicesEnabled(status === "granted");
      if (status !== "granted") {
        console.log("Permission denied");
        return;
      }
    })();

    const updateLocation = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      const granted = status === "granted";
      
      // Only update the state if the permission status has changed
      if (locationServicesEnabled !== granted) {
        setLocationServicesEnabled(granted);
      }

      if (!granted || !isZoomedIn) {
        return;
      }
      
      // Only update location when necessary
      if (routePolylineRef.current && routePolylineRef.current.length > 0) {
        if (isOriginYourLocation) {
          CenterOnLocation();
        }
      } else if (mapRef.current){
        mapRef.current.animateCamera({ heading: 0 }, { duration: 1000 });
      }
      
      // Check if we're near the destination building

    };

    // Run updateLocation immediately and then every 10 seconds instead of 5
    updateLocation();
    const intervalId = setInterval(updateLocation, 10000);

    campusToggleSheet.current?.show();

    let keyboardVisible = false;
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        if (!keyboardVisible) {
          keyboardVisible = true;
          setIsKeyboardVisible(true);
        }
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        if (keyboardVisible) {
          keyboardVisible = false;
          setIsKeyboardVisible(false);
        }
      }
    );

    return () => {
      clearInterval(intervalId);
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [isOriginYourLocation, isZoomedIn, destinationRoom, selectedBuilding]); // Added destinationRoom and selectedBuilding to dependencies

  // This function is specifically for handling the transition from room prompt to indoor map
  const showIndoorMapWithRoom = (roomId: string, floorId: string, roomNumber: string) => {
    // Set all required state variables
    setDestinationRoom(roomNumber);
    setSelectedRoomId(roomId);
    setSelectedFloorId(floorId);
    
    // If no building is selected, set the Hall Building as default
    if (!selectedBuilding) {
      const hallBuilding = campusBuildingCoords.features.find(
        feature => feature.properties.BuildingName === "Hall Building"
      );
      if (hallBuilding) {
        setSelectedBuilding(hallBuilding);
      }
    }
    
    // Hide any open sheets
    navigationSheet.current?.hide();
    campusToggleSheet.current?.hide();
    buildingInfoSheet.current?.hide();
    
    // Show the indoor map modal
    setIndoorMapVisible(true);
  };

  // Global temporary storage for room selection
  const roomSelectionData = useRef<{
    roomId: string | null;
    floorId: string | null;
    roomNumber: string | null;
  }>({
    roomId: null,
    floorId: null,
    roomNumber: null
  });

  // Force show the indoor map - call this directly to avoid using context
  const forceShowIndoorMap = () => {
    // First complete any pending state updates
    
    // Set the room and floor IDs from our temporary storage
    if (roomSelectionData.current.roomId) {
      setSelectedRoomId(roomSelectionData.current.roomId);
      console.log("Selected Room ID: ", roomSelectionData.current.roomId);
    }
    
    if (roomSelectionData.current.floorId) {
      setSelectedFloorId(roomSelectionData.current.floorId);
    }
    
    if (roomSelectionData.current.roomNumber) {
      setDestinationRoom(roomSelectionData.current.roomNumber);
      console.log("Selected Room Number: ", roomSelectionData.current.roomNumber);
    }
    
    // Ensure we have a proper Hall building if no building is selected
    if (!selectedBuilding) {
      const hallBuilding = campusBuildingCoords.features.find(
        feature => feature.properties.BuildingName === "Hall Building"
      );
      if (hallBuilding) {
        setSelectedBuilding(hallBuilding);
      }
    }
    
    // Give a little time for state to update, then show the modal
    setTimeout(() => {
      setIndoorMapVisible(true);
    }, 300);
  };

  return (
    <>
      <GestureHandlerRootView style={styles.container}>
        {/* HOW TO guide */}
        {isFirstLaunch && showTutorialHowTo &&
          <TutorialHowTo 
            onClose={()=>setShowTutorialHowTo(false)}
          />
        }
        
        <MapView
          style={styles.map}
          initialRegion={regionMap}
          customMapStyle={mapStyle}
          ref={mapRef}
          rotateEnabled={true}
          onRegionChangeComplete={fetchBoundaries}
          onMapReady={fetchBoundaries}
        >
          {locationServicesEnabled && myLocation && (
            <Marker coordinate={myLocation} title="My Location">
              <Image
                source={require("../../assets/images/userLocationDot.png")}
                style={{ width: 22, height: 22 }}
              />
            </Marker>
          )}

          {searchMarkerVisible && <Marker coordinate={searchMarkerLocation} />}
          
          {/* Use React.memo to optimize building mapping render */}
          <BuildingMapping
            geoJsonData={campusBuildingCoords}
            onMarkerPress={centerAndShowBuilding}
            nearbyPlaces={nearbyPlaces}
            onNearbyPlacePress={handleNearbyPlacePress}
            showCafes={showCafes} 
            showRestaurants={showRestaurants} 
          />

          {routePolyline.length > 0 && (
            <Polyline
              strokeWidth={10}
              strokeColor="turquoise"
              coordinates={routePolyline}
            />
          )}
        </MapView>

        {/* Optimize rendering of top elements */}
        {useMemo(() => (
          <View style={styles.topElements}>
            {!navigationMode && (
              <View style={[styles.dropdownWrapper, isKeyboardVisible && styles.dropdownWrapperKeyboardOpen]}>
                <AutoCompleteDropdown
                  testID="searchBarHomeSheet"
                  locked={false}
                  searchSuggestions={searchSuggestions}
                  setSearchSuggestions={setSearchSuggestions}
                  buildingData={buildingList}
                  onSelect={(selected) => handleSearch(selected)}
                  onNearbyResults={(results) => setNearbyPlaces(results)}
                  showNearbyButtons={true}
                  boundaries = {boundaries}
                  showCafes={showCafes} 
                  showRestaurants={showRestaurants} 
                  setShowCafes={setShowCafes}
                  setShowRestaurants={setShowRestaurants}
              />
              </View>
            )}
          </View>
        ), [navigationMode, isKeyboardVisible, searchSuggestions, buildingList])}

        {/* LOCATION BUTTON */}
        <View style={styles.bottomElements}>
          {locationServicesEnabled && (
            <RoundButton
              imageSrc={require("@/assets/images/recenter-map.png")}
              onPress={CenterOnLocation}
              testID="recenter-button"
            />
          )}
        </View>

        {/* SGW & LOY TOGGLE */}
          <LoyolaSGWToggleSheet
            actionsheetref={campusToggleSheet}
            setSelectedCampus={CenterOnCampus}
            navigateToRoutes={navigateToRoutes}
            setClassBuilding={setClassBuilding}
            setClassRoom={setClassRoom}
          />

        {/* BUILDING INFO */}
        {selectedBuilding && (
          <BuildingInfoSheet
            navigate={startNavigation}
            navigateIndoor={switchToIndoor}
            actionsheetref={buildingInfoSheet}
            building={selectedBuilding}
            onClose={() => {
              campusToggleSheet.current?.show();
            }}
          />
        )}

        <PlaceInfoSheet
          navigate={startNavigation}
          actionsheetref={placeInfoSheet}
          mainsheet={campusToggleSheet}
          PlaceDetails={currentPlace}
        />

        <NavigationProvider
          searchSuggestions={searchSuggestions}
          setSearchSuggestions={setSearchSuggestions}
          navigationMode={navigationMode}
          destination={destination}
          setDestination={setDestination}
          origin={origin}
          setOrigin={setOrigin}
        >
          <NavigationSheet
            setNavigationMode={setNavigationMode}
            actionsheetref={navigationSheet}
            closeChooseDest={setChooseDestVisible}
            onPolylineUpdate={(poly) => {
                setRoutePolyline(poly)
              }
            }
            onExtraClose={() => {
              campusToggleSheet.current?.show();
            }}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            setLatitudeStepByStep={setLatitudeStepByStep}
            setLongitudeStepByStep={setLongitudeStepByStep}
            isZoomedIn={isZoomedIn}
            userLocation={myLocation}
            classBuilding={classBuilding}
            classRoom={classRoom}
            onShowIndoorMap={(roomData) => {
              // Store the room data in our temporary storage
              if (roomData) {
                roomSelectionData.current = {
                  roomId: roomData.roomId,
                  floorId: roomData.floorId,
                  roomNumber: roomData.roomNumber
                };
              }
              
              // Then call forceShowIndoorMap to display the indoor map
              forceShowIndoorMap();
            }}
          />
          <DestinationChoices
            buildingList={buildingList}
            visible={chooseDestVisible}
            destination={destination}
            origin={origin}
            locationServicesEnabled={locationServicesEnabled}
          />
          
          {/* Add IndoorMapModal inside the NavigationProvider */}
          <IndoorMapModal
            visible={indoorMapVisible}
            onClose={() => {
              setIndoorMapVisible(false);
              if (navigationMode) {
                navigationSheet.current?.show();
              } else {
                campusToggleSheet.current?.show();
              }
            }}
            building={selectedBuilding ?? {
              properties: { 
                BuildingName: "Hall Building",
                Campus: "SGW",
                Building: "H",
                "Building Long Name": "Henry F. Hall Building",
                Address: "1455 De Maisonneuve Blvd. W",
                PlaceID: "ChIJbWPFbY6QyUwRXZZcfOWRRD0",
                Latitude: 45.497092,
                Longitude: -73.5788
              },
              geometry: { type: "Point", coordinates: [-73.5788, 45.497092] },
              type: "Feature"
            }}
            roomNumber={destinationRoom}
            roomId={selectedRoomId ?? undefined}
            floorId={selectedFloorId ?? undefined}
            userLocation={myLocation}
          />
        </NavigationProvider>
      </GestureHandlerRootView>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#010213",
    borderRadius: 10,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: "white",
    ...Platform.select({
      ios: {
        position: 'relative',
      },
      android: {
        
      },
    }),
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
    backfaceVisibility: 'hidden',
  },
  dropdownWrapperKeyboardOpen: {
    top: "-10%",
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
    backfaceVisibility: 'hidden',
  },
  topElements: {
    top: 0,
    position: "absolute",
    left: 30,
    gap: "6%",
    marginTop: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "10%",
    backfaceVisibility: 'hidden',
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
