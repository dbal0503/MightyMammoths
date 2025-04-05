import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  Text,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { GeoJsonFeature } from "./BuildingMapping";
import { IconSymbol, IconSymbolName } from "../../components/ui/IconSymbol";
import { getRoomEncodedId } from "../../utils/hallRoomMapper";

// MappedIn map ID and default floor
const MAP_ID = "677d8a736e2f5c000b8f3fa6";
const DEFAULT_FLOOR = "m_2b2365d2f44ba4a0"; // Default floor to display
const SECOND_FLOOR = "m_f06f42e4dd43b7a3"; // Second floor ID

// Default room for entrance when only destination is provided
const DEFAULT_ENTRANCE_ROOM = "103"; // This will be converted to encoded ID

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface IndoorMapModalProps {
  visible: boolean;
  onClose: () => void;
  building: GeoJsonFeature;
  entranceRoomNumber?: string; // Room number (not encoded ID)
  destinationRoomNumber?: string; // Room number (not encoded ID)
}

const IndoorMapModal = ({
  visible,
  onClose,
  building,
  entranceRoomNumber,
  destinationRoomNumber,
}: IndoorMapModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const buildingName = building?.properties?.BuildingName || "Hall";

  // Convert room numbers to encoded IDs if provided
  const entranceRoomCode = entranceRoomNumber
    ? getRoomEncodedId(entranceRoomNumber)
    : undefined;
  const destinationRoomCode = destinationRoomNumber
    ? getRoomEncodedId(destinationRoomNumber)
    : undefined;

  // Default entrance code when only destination is provided
  const defaultEntranceCode =
    getRoomEncodedId(DEFAULT_ENTRANCE_ROOM) || "s_e72c2ed4f1949630";

  // Build the iframe URL dynamically based on provided props
  let iframeSrc = "";

  // Case 1: Neither entrance nor destination provided - show basic map
  if (!entranceRoomCode && !destinationRoomCode) {
    iframeSrc = `https://app.mappedin.com/map/${MAP_ID}?floor=${SECOND_FLOOR}`;
  }
  // Case 2: Only destination provided - use default entrance
  else if (!entranceRoomCode && destinationRoomCode) {
    iframeSrc = `https://app.mappedin.com/map/${MAP_ID}/directions?floor=${DEFAULT_FLOOR}&location=${destinationRoomCode}&departure=${defaultEntranceCode}`;
  }
  // Case 3: Both entrance and destination provided
  else if (entranceRoomCode && destinationRoomCode) {
    iframeSrc = `https://app.mappedin.com/map/${MAP_ID}/directions?floor=${DEFAULT_FLOOR}&location=${destinationRoomCode}&departure=${entranceRoomCode}`;
  }
  // Case 4: Only entrance provided (fallback to showing just the map at that location)
  else if (entranceRoomCode && !destinationRoomCode) {
    iframeSrc = `https://app.mappedin.com/map/${MAP_ID}?floor=${DEFAULT_FLOOR}&highlight=${entranceRoomCode}`;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: #010213; }
          iframe { border: 0; width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <iframe src="${iframeSrc}" allow="geolocation" allowfullscreen></iframe>
      </body>
    </html>
  `;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.backButton}>
            <IconSymbol
              name={"arrow-back" as IconSymbolName}
              size={28}
              color="white"
              style={styles.modeIcon}
            />
          </Pressable>
          <Text style={styles.headerTitle}>{buildingName} • Indoor Map</Text>
        </View>

        <View style={styles.webViewContainer}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Loading map...</Text>
            </View>
          )}

          <WebView
            ref={webViewRef}
            source={{ html: htmlContent }}
            style={styles.webView}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsFullscreenVideo={true}
            originWhitelist={["*"]}
            onError={(error) => console.error("WebView error:", error)}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#010213",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
  },
  webViewContainer: {
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(1, 2, 19, 0.8)",
    zIndex: 10,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 16,
  },
  modeIcon: {
    marginRight: 10,
    marginLeft: 10,
    alignItems: "center",
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 16,
  },
});

export default IndoorMapModal;
