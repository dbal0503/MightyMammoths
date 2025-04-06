import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
} from "react-native";

import buildingData from "../assets/buildings/coordinates/campusbuildingcoords.json";

const getUpdatedTime = (duration: string) => {
  const numericDuration = parseInt(duration, 10);
  const timeNow = new Date();
  timeNow.setMinutes(timeNow.getMinutes() + numericDuration);
  return timeNow.toLocaleTimeString();
};

const isDestinationBuilding = (destination: string) => {
  return buildingData.features.some(
    (feature) => feature.properties.BuildingName === destination
  );
};

interface LiveInformationProps {
  onStop: () => void;
  routes: any;
  onZoomOut: (
    destinationCoordsPlaceID: string,
    destinationPlaceName: string
  ) => void;
  isZoomedIn: boolean;
  destination: string;
  destinationCoords: string;
  onIndoorMapPress: () => void; // Add callback for indoor map button
}

export function LiveInformation({
  onStop,
  routes,
  onZoomOut,
  isZoomedIn,
  destination,
  destinationCoords,
  onIndoorMapPress,
}: LiveInformationProps) {
  const estimates = routes;
  const bestEstimate = estimates && estimates.length > 0 ? estimates[0] : null;
  const stopNavigation = () => {
    onStop();
    if (onZoomOut && isZoomedIn) onZoomOut(destinationCoords, destination);
  };

  // Determine if we should show the indoor map button
  const showIndoorMapButton = useMemo(
    () => isDestinationBuilding(destination),
    [destination]
  );

  return (
    <>
      <View style={styles.container}>
        <View style={styles.destinationInformation}>
          <View style={styles.etaContainer}>
            <Text style={styles.routeHeading}>ETA</Text>
            <Text style={styles.destinationTime}>
              {getUpdatedTime(bestEstimate.duration)}
            </Text>
          </View>
          <View style={styles.travelInformation}>
            <View style={styles.travelText}>
              <Text style={styles.time}>{bestEstimate.duration}</Text>
              <Text style={styles.distance}>{bestEstimate.distance}</Text>
            </View>
            <TouchableOpacity
              style={styles.startButton}
              onPress={stopNavigation}
            >
              <Text style={styles.stop}>Stop</Text>
            </TouchableOpacity>
          </View>

          {/* Indoor Map Button - only show if destination is in building list */}
          {showIndoorMapButton && (
            <View style={[styles.button, styles.indoorMapButton]}>
              <Pressable onPress={onIndoorMapPress} testID="indoorMapButton">
                <Text style={styles.buttonText}>View Indoor Map</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: -30,
    width: "100%",
    height: 500,
    paddingBottom: 30,
    marginBottom: "100%",
    backgroundColor: "black",
  },
  dropdownWrapper: {
    alignItems: "center",
  },
  modeIcon: {
    alignItems: "center",
    color: "black",
    padding: 5,
    backgroundColor: "white",
    borderRadius: 20,
    height: "22%",
  },
  routeHeading: {
    paddingTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 0,
    color: "white",
  },
  routeHeadingDestination: {
    fontSize: 20,
    marginBottom: 0,
    color: "white",
  },
  destinationInformation: {
    paddingLeft: 20,
    width: "80%",
  },
  travelInformation: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 0,
  },
  time: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    paddingRight: 40,
  },
  distance: {
    fontSize: 18,
    color: "white",
  },
  startButton: {
    position: "absolute",
    backgroundColor: "red",
    borderRadius: 20,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 230,
    width: "40%",
    justifyContent: "center",
    marginTop: 100,
  },
  navigationIcon: {
    paddingLeft: 10,
  },
  stop: {
    fontSize: 23,
    color: "white",
  },
  etaContainer: {
    display: "flex",
    flexDirection: "column",
  },
  destinationTime: {
    color: "white",
    fontSize: 20,
  },
  travelText: {
    marginTop: 10,
  },
  // New styles for the indoor map button
  button: {
    padding: 12,
    borderRadius: 20,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  indoorMapButton: {
    backgroundColor: "#800000",
    marginTop: 80,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
