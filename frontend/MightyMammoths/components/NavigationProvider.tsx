import { createContext, useState, useEffect, ReactNode, useRef, useMemo, useContext } from "react";
import { getRoutes, RouteData } from "@/services/directionsService";
import BottomSheet from "@gorhom/bottom-sheet";

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

  // Move the route fetching logic into the provider
  useEffect(() => {
    async function fetchRoutes() {
      if (origin && destination) {
        setLoadingRoutes(true);
        const estimates: { [mode: string]: RouteData[] } = {};
        try {
          for (const mode of transportModes) {
            const routes = await getRoutes(origin, destination, mode);
            estimates[mode] = routes;
          }
          setRouteEstimates(estimates);
        } catch (error) {
          console.error("Error fetching routes", error);
        } finally {
          setLoadingRoutes(false);
        }
      }
    }
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