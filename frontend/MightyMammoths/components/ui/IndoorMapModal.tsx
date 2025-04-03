import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  Text,
  Dimensions,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { WebView } from "react-native-webview";
import { GeoJsonFeature } from "./BuildingMapping";
import { IconSymbol, IconSymbolName } from "../../components/ui/IconSymbol";

// MappedIn map ID
const MAP_ID = "677d8a736e2f5c000b8f3fa6";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface IndoorMapModalProps {
  visible: boolean;
  onClose: () => void;
  building: GeoJsonFeature;
}

const IndoorMapModal = ({
  visible,
  onClose,
  building,
}: IndoorMapModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const buildingName = building?.properties?.BuildingName || "Hall";
  
  // Use the direct embedded iframe URL from Mappedin
  const mappedinEmbedUrl = `https://app.mappedin.com/map/${MAP_ID}?embedded=true`;

  // Simplest possible HTML wrapping the iframe
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
        <iframe src="${mappedinEmbedUrl}" allow="geolocation" allowfullscreen></iframe>
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
            originWhitelist={['*']}
            onError={(error) => console.error('WebView error:', error)}
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
    backgroundColor: 'transparent',
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
