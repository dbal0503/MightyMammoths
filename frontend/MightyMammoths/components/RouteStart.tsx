// components/RouteStart.tsx
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { RouteData } from "@/services/directionsService";
import { useRouter } from "expo-router";

interface StartNavigationProps {
  mode: string;
  routes: RouteData[];
  onSelectRoute: (route: RouteData) => void;
  onBack: () => void;
}

export function StartNavigation({
  mode,
  routes,
  onSelectRoute,
  onBack,
}: StartNavigationProps) {
  const router = useRouter();

  const handleStartNavigation = () => {
    // Pass the selected route data to your directions screen or shared state.
    router.push("/directions");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <IconSymbol name="arrow-back" size={30} color="white" />
      </TouchableOpacity>
      <Text style={styles.heading}>Select a Route for {mode}</Text>
      <FlatList
        data={routes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.routeItem}
            onPress={() => onSelectRoute(item)}
          >
            <Text style={styles.routeText}>
              {item.duration} – {item.distance}
            </Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartNavigation}
      >
        <IconSymbol name="play" size={30} color="white" />
        <Text style={styles.startText}>Start Navigation</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#010213",
  },
  backButton: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  routeItem: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  routeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "blue",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  startText: {
    fontSize: 18,
    color: "white",
    marginLeft: 10,
  },
});
