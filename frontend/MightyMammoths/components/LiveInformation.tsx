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

// Add tons of console logs for debugging
const isDestinationBuilding = (destination: string) => {
  console.log(
    "DEBUG: isDestinationBuilding called with destination:",
    destination
  );

  // Check if we have a valid destination
  if (!destination) {
    console.log("DEBUG: Destination is null, undefined, or empty string");
    return false;
  }

  // Convert destination to lowercase, trim any extra spaces
  const normalizedDestination = destination.toLowerCase().trim();
  console.log("DEBUG: normalizedDestination:", normalizedDestination);

  // Check each building
  const foundBuilding = buildingData.features.find((feature, index) => {
    const buildingName = feature.properties.BuildingName.toLowerCase().trim();
    console.log(
      "DEBUG: Checking building index",
      index,
      "with BuildingName:",
      feature.properties.BuildingName,
      "| Lowercase/trimmed:",
      buildingName
    );

    // Compare normalized strings
    const isMatch = buildingName === normalizedDestination;
    console.log("DEBUG: isMatch:", isMatch);
    return isMatch;
  });

  if (foundBuilding) {
    console.log(
      "DEBUG: We found a matching building:",
      foundBuilding.properties.BuildingName
    );
    return true;
  } else {
    console.log(
      "DEBUG: No matching building found for:",
      normalizedDestination
    );
    return false;
  }
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
  onIndoorMapPress: () => void;
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
  console.log("DEBUG: LiveInformation Props -> destination:", destination);

  const estimates = routes;
  console.log("DEBUG: routes (estimates) array:", estimates);

  const bestEstimate = estimates && estimates.length > 0 ? estimates[0] : null;
  console.log("DEBUG: bestEstimate:", bestEstimate);

  const stopNavigation = () => {
    console.log("DEBUG: stopNavigation called");
    onStop();
    if (onZoomOut && isZoomedIn) {
      console.log(
        "DEBUG: onZoomOut invoked with coords:",
        destinationCoords,
        "destination:",
        destination
      );
      onZoomOut(destinationCoords, destination);
    }
  };

  // Determine if we should show the indoor map button
  const showIndoorMapButton = useMemo(() => {
    console.log(
      "DEBUG: useMemo showIndoorMapButton -> checking isDestinationBuilding"
    );
    const result = isDestinationBuilding(destination);
    console.log("DEBUG: showIndoorMapButton result:", result);
    return result;
  }, [destination]);

  console.log("DEBUG: showIndoorMapButton:", showIndoorMapButton);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.destinationInformation}>
          <View style={styles.etaContainer}>
            <Text style={styles.routeHeading}>ETA</Text>
            <Text style={styles.destinationTime}>
              {bestEstimate ? getUpdatedTime(bestEstimate.duration) : "--:--"}
            </Text>
          </View>
          <View style={styles.travelInformation}>
            <View style={styles.travelText}>
              <Text style={styles.time}>
                {bestEstimate ? bestEstimate.duration : "No duration"}
              </Text>
              <Text style={styles.distance}>
                {bestEstimate ? bestEstimate.distance : "No distance"}
              </Text>
            </View>
          </View>

          {/* Bottom Buttons Container */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopNavigation}
            >
              <Text style={styles.stop}>Stop</Text>
            </TouchableOpacity>

            {showIndoorMapButton && (
              <TouchableOpacity
                style={styles.indoorMapButton}
                onPress={onIndoorMapPress}
                testID="indoorMapButton"
              >
                <Text style={styles.buttonText}>View Indoor Map</Text>
              </TouchableOpacity>
            )}
          </View>
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
    width: "90%",
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
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  stopButton: {
    backgroundColor: "red",
    borderRadius: 20,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "45%",
  },
  indoorMapButton: {
    backgroundColor: "#800000",
    borderRadius: 20,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
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
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
