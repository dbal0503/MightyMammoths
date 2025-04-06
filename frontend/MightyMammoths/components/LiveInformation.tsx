import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

import buildingData from "../assets/buildings/coordinates/campusbuildingcoords.json";
import IndoorMapModal from "../components/ui/IndoorMapModal"; // Make sure this path is correct

const getUpdatedTime = (duration: string) => {
  const numericDuration = parseInt(duration, 10);
  const timeNow = new Date();
  timeNow.setMinutes(timeNow.getMinutes() + numericDuration);
  return timeNow.toLocaleTimeString();
};

const isDestinationBuilding = (destination: string) => {
  console.log(
    "DEBUG: isDestinationBuilding called with destination:",
    destination
  );

  if (!destination) {
    console.log("DEBUG: Destination is null, undefined, or empty string");
    return false;
  }

  const normalizedDestination = destination.toLowerCase().trim();
  console.log("DEBUG: normalizedDestination:", normalizedDestination);

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
  campusToggleSheet: any; // Add this to manage showing the sheet
}

export function LiveInformation({
  onStop,
  routes,
  onZoomOut,
  isZoomedIn,
  destination,
  destinationCoords,
  onIndoorMapPress,
  campusToggleSheet,
}: LiveInformationProps) {
  const [indoorMapVisible, setIndoorMapVisible] = useState(false);

  const estimates = routes;
  const bestEstimate = estimates && estimates.length > 0 ? estimates[0] : null;

  const stopNavigation = () => {
    onStop();
    if (onZoomOut && isZoomedIn) {
      onZoomOut(destinationCoords, destination);
    }
  };

  // Determine if we should show the indoor map
  const showIndoorMapButton = useMemo(() => {
    const result = isDestinationBuilding(destination);
    console.log("DEBUG: showIndoorMapButton result:", result);
    return result;
  }, [destination]);

  // Set the indoor map visibility based on the button condition
  useEffect(() => {
    if (showIndoorMapButton) {
      setIndoorMapVisible(true);
      // If you need to hide any sheets when showing the modal
      if (campusToggleSheet?.current?.hide) {
        campusToggleSheet.current.hide();
      }
    }
  }, [showIndoorMapButton, campusToggleSheet]);

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

          {/* Show the stop button */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopNavigation}
            >
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>

            {/* Manual toggle button for indoor map - optional */}
            {showIndoorMapButton && (
              <TouchableOpacity
                style={styles.indoorMapButton}
                onPress={() => setIndoorMapVisible(true)}
                testID="indoorMapButton"
              >
                <Text style={styles.buttonText}>View Indoor Map</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Indoor Map Modal */}
      <IndoorMapModal
        visible={indoorMapVisible}
        building={destination} // Using destination as the building name
        onClose={() => {
          setIndoorMapVisible(false);
          if (campusToggleSheet?.current?.show) {
            campusToggleSheet.current.show();
          }
        }}
      />
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
  destinationInformation: {
    paddingLeft: 20,
    paddingRight: 20,
    width: "100%",
  },
  etaContainer: {
    display: "flex",
    flexDirection: "column",
  },
  routeHeading: {
    paddingTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 0,
    color: "white",
  },
  destinationTime: {
    color: "white",
    fontSize: 20,
  },
  travelInformation: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 0,
  },
  travelText: {
    marginTop: 10,
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
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    width: "100%",
    position: "absolute",
    bottom: -100,
  },
  stopButton: {
    backgroundColor: "red",
    borderRadius: 20,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    width: "45%",
    paddingVertical: 8,
  },
  indoorMapButton: {
    backgroundColor: "#800000",
    borderRadius: 20,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    width: "45%",
    paddingVertical: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
