import { createContext, useState, useEffect, ReactNode, useRef, useMemo, useContext } from "react";
import { getRoutes, RouteData } from "@/services/directionsService";
import { isWithinRadius } from "@/utils/isWithinCampus";
import BottomSheet from "@gorhom/bottom-sheet";
import * as Location from "expo-location";
import { getShuttleBusRoute } from "@/services/shuttleBusRoute";
import { fetchShuttleData } from "@/utils/getLiveShuttleData";
import campusBuildingCoords from "../assets/buildings/coordinates/campusbuildingcoords.json";
// Constants can be exported from the same file
export const transportModes = ["driving", "transit", "bicycling", "walking"];


// Extend our previous state interface
interface NavigationState {
  origin: string;
  destination: string;
  routeEstimates: { [mode: string]: RouteData[] };
  loadingRoutes: boolean;
  selectedMode: string | null;
  selectedRoute: RouteData | null;
  selectedBuilding: string | null;
  twoBuildingsSelected: boolean;
  snapPoints: string[];
  sheetRef: React.RefObject<BottomSheet>;
}

interface NavigationContextType {
  state: NavigationState;
  functions: {
    setOrigin: (value: string) => void;
    setDestination: (value: string) => void;
    setRouteEstimates: (value: { [mode: string]: RouteData[] }) => void;
    setLoadingRoutes: (value: boolean) => void;
    setSelectedMode: (value: string | null) => void;
    setSelectedRoute: (value: RouteData | null) => void;
    setSelectedBuilding: (value: string | null) => void;
    setTwoBuildingsSelected: (value: boolean) => void;
    fetchRoutes: () => void;
  };
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export interface NavigationProviderProps {
  children: ReactNode;
}

const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["30%", "60%"], []);

  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [routeEstimates, setRouteEstimates] = useState<{
    [mode: string]: RouteData[];
  }>({});
  const [loadingRoutes, setLoadingRoutes] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [twoBuildingsSelected, setTwoBuildingsSelected] = useState<boolean>(false);

  //Translate building name i.e EV, MB, etc to coords to pass to google directions api
  async function buildingNametoCoords(building: string): Promise<string>{
    if(building == "Your Location"){
      const loc = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Low});
      //return `${loc.coords.latitude},${loc.coords.longitude}`
      return '45.494666,-73.577603'
    }else{
      const loc = campusBuildingCoords.features.find((item) => item.properties.Building == building)?.properties
      return loc ? `${loc.Latitude},${loc.Longitude}` : ""
    }
  }

  async function parseCoordinates(coordString: string): Promise<[number, number]> {
    const [lat, long] = coordString.split(",").map(parseFloat);
    return [lat, long];
  }

  // Move the route fetching logic into the provider
  async function fetchRoutes() {
    if (origin && destination) {

      console.log(`fetching routes for origin: ${origin}, destination: ${destination}`)
      setLoadingRoutes(true);
      const estimates: { [mode: string]: RouteData[] } = {};
      try {
        const originCoords = await buildingNametoCoords(origin)
        const destinationCoords = await buildingNametoCoords(destination)

        for (const mode of transportModes) {
          const routeMode = await getRoutes(originCoords, destinationCoords, mode);
          console.log("Mode: ", mode, "Shortest Route: ", routeMode);
          if (routeMode) {
            estimates[mode] = [routeMode]; 
          }
        } 
        
        //await fetchShuttleData();

        const destinationCampus = campusBuildingCoords.features.find((item) => item.properties.Building == destination)?.properties.Campus ?? "";
        
        if (origin == "Your Location") {
          const [userLatitude, userLongitude] = await parseCoordinates(originCoords);
          const nearestCampus = await isWithinRadius(userLatitude, userLongitude);
          if (nearestCampus != destinationCampus && nearestCampus != "" && destinationCampus != "") {
            estimates["shuttle"] = await getShuttleBusRoute(originCoords, destinationCoords, nearestCampus); 
          }
        } else{
          const originCampus = campusBuildingCoords.features.find((item) => item.properties.Building == origin)?.properties.Campus ?? "";
          if (originCampus != destinationCampus && originCampus != "" && destinationCampus != "") {
            estimates["shuttle"] = await getShuttleBusRoute(originCoords, destinationCoords, originCampus); 
          }
        }
        
        console.log("Mode shuttle: ", estimates["shuttle"]);
        console.log(estimates)
        setRouteEstimates(estimates);
      } catch (error) {
        console.error("Error fetching routes", error);
      } finally {
        setLoadingRoutes(false);
      }
    }
  }

  useEffect(() => {
    async()=>{await Location.requestForegroundPermissionsAsync()};
  })

  useEffect(() => {
    fetchRoutes();
  }, [origin, destination]);

  return (
    <NavigationContext.Provider
      value={{
        state: {
          origin,
          destination,
          routeEstimates,
          loadingRoutes,
          selectedMode,
          selectedRoute,
          selectedBuilding,
          twoBuildingsSelected,
          snapPoints,
          sheetRef,
        },
        functions: {
          setOrigin,
          setDestination,
          setRouteEstimates,
          setLoadingRoutes,
          setSelectedMode,
          setSelectedRoute,
          setSelectedBuilding,
          setTwoBuildingsSelected,
          fetchRoutes
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