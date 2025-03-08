// screens/NavigationScreen.tsx
import React, { useRef, useMemo, useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { DestinationChoices } from "@/components/Destinations";
import { TransportChoice } from "@/components/RoutesSheet";
import { StartNavigation } from "@/components/RouteStart";
import { getRoutes, RouteData } from "@/services/directionsService";

import { getBuildingAddress } from "@/utils/buildingMapping";
import { fetchShuttleData } from "@/utils/getLiveShuttleData";
import { getShuttleBusRoute } from "@/services/shuttleBusRoute";

const transportModes = ["driving", "transit", "bicycling", "walking"];

export default function NavigationScreen() {
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

  

  // Prefetch route estimates once both origin and destination are selected.
  useEffect(() => {
    async function fetchRoutes() {
      if (origin && destination) {

        let startDirection = "";

        if (origin.includes("Hall Building") || origin.includes("CL Building") ||
          origin.includes("John Molson") || origin.includes("EV")){
          if (destination.includes("Hingston Hall") || destination.includes("Smith Building")){
            startDirection = "SGW";
          }
        } else {
          if (destination.includes("Hall Building") ||
          destination.includes("CL Building") ||
          destination.includes("John Molson") ||
          destination.includes("EV")){
            startDirection = "LOY";
          }
        }

        setLoadingRoutes(true);
        const estimates: { [mode: string]: RouteData[] } = {};
        try {
          for (const mode of transportModes) {
            const routes = await getRoutes(origin, destination, mode);
            estimates[mode] = routes;
          }
          estimates["shuttle"] = await getShuttleBusRoute(origin, destination, startDirection);
          await fetchShuttleData();
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
    <GestureHandlerRootView style={styles.container}>
      <DestinationChoices
        onSelectOrigin={(origin) => setOrigin(getBuildingAddress(origin))}
        onSelectDestination={(destination) =>
          setDestination(getBuildingAddress(destination))
        }
        setSelectedBuilding={setSelectedBuilding}
        setTwoBuildingsSelected={setTwoBuildingsSelected}
      />
      {loadingRoutes && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={{ color: "white" }}>Fetching routes...</Text>
        </View>
      )}
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: "#010213" }}
        handleIndicatorStyle={{ backgroundColor: "white" }}
      >
        {selectedMode === null ? (
          // Show the transportation mode options
          <TransportChoice
            routeEstimates={routeEstimates}
            onSelectMode={(mode) => setSelectedMode(mode)}
            destinationBuilding={selectedBuilding}
            bothSelected={twoBuildingsSelected}
          />
        ) : (
          // Once a mode is selected, show alternative routes for that mode.
          <StartNavigation
            mode={selectedMode}
            routes={routeEstimates[selectedMode] || []}
            onSelectRoute={setSelectedRoute}
            onBack={() => setSelectedMode(null)}
            destinationBuilding={selectedBuilding}
          />
        )}
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#010213",
  },
});