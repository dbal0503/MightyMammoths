import { createContext, useState, useEffect, ReactNode, useRef, useMemo, useContext } from "react";
import { getRoutes, RouteData } from "@/services/directionsService";
import { isWithinRadius } from "@/utils/isWithinCampus";
import BottomSheet from "@gorhom/bottom-sheet";
import * as Location from "expo-location";
import { getShuttleBusRoute } from "@/services/shuttleBusRouteService";
import campusBuildingCoords from "../assets/buildings/coordinates/campusbuildingcoords.json";

import { SuggestionResult } from "@/services/searchService";
// Constants can be exported from the same file
export const transportModes = ["driving", "transit", "bicycling", "walking"];


// Extend our previous state interface
interface NavigationState {
  origin: string;
  originCoords: string;
  destination: string;
  destinationCoords: string;
  routeEstimates: { [mode: string]: RouteData[] };
  loadingRoutes: boolean;
  selectedMode: string | null;
  selectedRoute: RouteData | null;
  selectedBuilding: string | null;
  twoBuildingsSelected: boolean;
  snapPoints: string[];
  sheetRef: React.RefObject<BottomSheet>;
  searchSuggestions: SuggestionResult[];
  setSearchSuggestions: React.Dispatch<React.SetStateAction<SuggestionResult[]>>;
  routesValid: boolean;
  isIndoorMapVisible: boolean;
  selectedRoomId: string | null;
  setModalVisible: (visible: boolean, roomId?: string | null) => void;
}

interface NavigationContextType {
  state: NavigationState;
  functions: {
    setOrigin: (value: string) => void;
    setOriginCoords: (value: string) => void;
    setDestination: (value: string) => void;
    setDestinationCoords: (value: string) => void;
    setRouteEstimates: (value: { [mode: string]: RouteData[] }) => void;
    setLoadingRoutes: (value: boolean) => void;
    setSelectedMode: (value: string | null) => void;
    setSelectedRoute: (value: RouteData | null) => void;
    setSelectedBuilding: (value: string | null) => void;
    setTwoBuildingsSelected: (value: boolean) => void;
    fetchRoutes: () => void;
    setRoutesValid: (value: boolean) => void;
    setModalVisible: (visible: boolean, roomId?: string | null) => void;
  };
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export interface NavigationProviderProps {
  children: ReactNode;
  searchSuggestions: SuggestionResult[];
  setSearchSuggestions: React.Dispatch<React.SetStateAction<SuggestionResult[]>>;
  navigationMode: boolean;
}

const NavigationProvider = ({ 
  children, 
  searchSuggestions, 
  setSearchSuggestions,
  navigationMode 
}: NavigationProviderProps) => {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%", "60%"], []);

  const [origin, setOrigin] = useState<string>("");
  const [originCoords, setOriginCoords] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [destinationCoords, setDestinationCoords] = useState<string>("");
  const [routeEstimates, setRouteEstimates] = useState<{
    [mode: string]: RouteData[];
  }>({});
  const [loadingRoutes, setLoadingRoutes] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [twoBuildingsSelected, setTwoBuildingsSelected] = useState<boolean>(false);
  const [routesValid, setRoutesValid] = useState<boolean>(false);
  const [isIndoorMapVisible, setIsIndoorMapVisible] = useState<boolean>(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  //Translate building name i.e EV, MB, etc to coords to pass to google directions api
  async function nameToPlaceID(name: string): Promise<string>{
    if(name === "Your Location"){
      const loc = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Low});
      return `${loc.coords.latitude},${loc.coords.longitude}`
    } else if (name === "Concordia") {
      // Use the Hall Building coordinates for Concordia
      console.log("Resolving Concordia to Hall Building coordinates");
      const hallBuilding = campusBuildingCoords.features.find((item) => item.properties.Building === "H");
      if (hallBuilding) {
        return `${hallBuilding.properties.Latitude},${hallBuilding.properties.Longitude}`;
      }
      // Fallback to hardcoded coordinates for Hall Building
      return "45.497092,-73.5788";
    } else {
      let id = campusBuildingCoords.features.find((item) => item.properties.Building === name)?.properties.PlaceID
      if(id){
        return `place_id:${id}`;
      }else{
        id = searchSuggestions.find((item) => item.placePrediction.structuredFormat.mainText.text === name)?.placePrediction.placeId
        if(id){
          return `place_id:${id}`;
        }else{
          throw new Error("Could not resolve name to place id.")
        }
      }
    }
  }

  async function parseCoordinates(coordString: string): Promise<[number, number]> {
    const [lat, long] = coordString.split(",").map(parseFloat);
    return [lat, long];
  }



  // Move the route fetching logic into the provider
  async function fetchRoutes() {

    if (!origin || !destination || !navigationMode) return;
    setLoadingRoutes(true);
    
    // Set twoBuildingsSelected to true when both origin and destination are set
    if (origin && destination) {
      setTwoBuildingsSelected(true);
      console.log("Both origin and destination are set:", { origin, destination });
    } else {
      setTwoBuildingsSelected(false);
      console.log("Missing origin or destination:", { origin, destination });
    }
    
    const estimates: { [mode: string]: RouteData[] } = {};
    try {
      
      //Fix only check if Your location is used and translate to coords otherwise use place id.
      const originCoordsLocal = await nameToPlaceID(origin)
      setOriginCoords(originCoordsLocal)
      const destinationCoordsLocal = await nameToPlaceID(destination)
      setDestinationCoords(destinationCoordsLocal)

      console.log(`originCoords: ${originCoordsLocal}, destinationCoords: ${destinationCoordsLocal}`)
      for (const mode of transportModes) {
        const routeMode = await getRoutes(originCoordsLocal, destinationCoordsLocal, mode);
        console.log("Mode: ", mode, "Shortest Route: ", routeMode);
        if (routeMode) {
          estimates[mode] = [routeMode]; 
        }
      } 

      const destinationCampus = campusBuildingCoords.features.find((item) => item.properties.BuildingName === destination)?.properties.Campus ?? "";
      
      if (origin === "Your Location") {
        const [userLatitude, userLongitude] = await parseCoordinates(originCoordsLocal);
        const nearestCampus = await isWithinRadius(userLatitude, userLongitude);
        if (nearestCampus !== destinationCampus && nearestCampus !== "" && destinationCampus !== "") {
          estimates["shuttle"] = await getShuttleBusRoute(originCoordsLocal, destinationCoordsLocal, nearestCampus); 
        }
      } else{
        const originCampus = campusBuildingCoords.features.find((item) => item.properties.BuildingName === origin)?.properties.Campus ?? "";
        if (originCampus !== destinationCampus && originCampus !== "" && destinationCampus !== "") {
          estimates["shuttle"] = await getShuttleBusRoute(originCoordsLocal, destinationCoordsLocal, originCampus); 
        }
      }
      
      console.log(estimates['shuttle']);
      console.log(estimates)
      setRouteEstimates(estimates);
      setRoutesValid(true);
    } catch (error) {
      console.error("Error fetching routes: ", error);
    } finally {
      setLoadingRoutes(false);
    }
  }

  useEffect(() => {
    const requestPermission = async () => {
      await Location.requestForegroundPermissionsAsync();
    };
  
    requestPermission();
  }, [])

  useEffect(() => {
    fetchRoutes();
  }, [origin, destination, navigationMode]);

  // Function to set modal visibility and optionally a room ID
  const setModalVisible = (visible: boolean, roomId: string | null = null) => {
    console.log(`[NavigationProvider] Setting modal visibility to ${visible}, roomId: ${roomId || 'none'}`);
    
    // First set the room ID if provided
    if (roomId) {
      console.log(`[NavigationProvider] Setting selected room ID to ${roomId}`);
      setSelectedRoomId(roomId);
    }
    
    // Then set visibility with a slight delay to ensure state updates
    setTimeout(() => {
      console.log(`[NavigationProvider] Actually changing visibility to ${visible}`);
      setIsIndoorMapVisible(visible);
    }, 100);
  };

  return (
    <NavigationContext.Provider
      value={{
        state: {
          origin,
          originCoords,
          destination,
          destinationCoords,
          routeEstimates,
          loadingRoutes,
          selectedMode,
          selectedRoute,
          selectedBuilding,
          twoBuildingsSelected,
          snapPoints,
          sheetRef,
          searchSuggestions,
          setSearchSuggestions,
          routesValid,
          isIndoorMapVisible,
          selectedRoomId,
          setModalVisible,
        },
        functions: {
          setOrigin,
          setOriginCoords,
          setDestinationCoords,
          setDestination,
          setRouteEstimates,
          setLoadingRoutes,
          setSelectedMode,
          setSelectedRoute,
          setSelectedBuilding,
          setTwoBuildingsSelected,
          fetchRoutes,
          setRoutesValid,
          setModalVisible,
        },
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

// Create a custom hook for easier context usage
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export { NavigationContext, NavigationProvider };