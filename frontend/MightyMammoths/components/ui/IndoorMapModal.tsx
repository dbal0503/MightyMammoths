import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  Text,
  ActivityIndicator,
  Linking,
} from "react-native";
import { IconSymbol, IconSymbolName } from "../../components/ui/IconSymbol";
import { GeoJsonFeature } from "./BuildingMapping";
import MappedinView from "./MappedinView";
import {getMapId } from "../../services/mappedinService";
import { getMappedinUrl, getBuildingNameByRoomNumber } from "../../utils/hallBuildingRooms";
import { useNavigation } from "@/components/NavigationProvider";

interface IndoorMapModalProps {
  visible: boolean;
  onClose: () => void;
  building: GeoJsonFeature;
  roomNumber?: string | null;
  roomId?: string | null;
  floorId?: string | null;
  userLocation?: { latitude: number; longitude: number } | null;
}

const IndoorMapModal = ({
  visible,
  onClose,
  building,
  roomNumber,
  roomId: propRoomId,
  floorId: propFloorId,
}: IndoorMapModalProps) => {

  const { functions } = useNavigation();
  
  const { 
      setNavigationIsStarted
  } = functions;

  const [isLoading, setIsLoading] = useState(true);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [floorId, setFloorId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [buildingName, setBuildingName] = useState<string | null>(null);
  const [campusName, setCampusName] = useState<string | null>(null);

  console.log("Campus Name: ", campusName);
  
  useEffect(() => {
    if (building) {
      setBuildingName(building.properties.BuildingName);
      setCampusName(building.properties.Campus);
    }
    console.log("Building Name: ", buildingName);
    console.log("Campus Name new: ", campusName);
  }, [building]);


  useEffect(() => {
    if (propRoomId) {
      setRoomId(propRoomId);
    }
    if (propFloorId) {
      setFloorId(propFloorId);
    }
  }, [propRoomId, propFloorId]);

  useEffect(() => {
    if (roomNumber) {
      console.log("Room Number:", roomNumber);
      setCampusName(getBuildingNameByRoomNumber(roomNumber));
    }
  }, [roomNumber]);



  const handleMapError = (errorMessage: string) => {
    console.error('Map error:', errorMessage);
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleMapLoaded = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Force a re-render of MappedinView by using a key
    setRetryKey(prevKey => prevKey + 1);
  };
  
  const openInBrowser = () => {
    try {
      // If we have roomId and floorId, use our utility function
      if (roomId && floorId) {
        const url = getMappedinUrl(roomId, floorId);
        Linking.openURL(url);
        return;
      }
      
      // Fallback to old method if we don't have floor information
      if (campusName) {
        console.log('Campus Name new ahaha:', campusName);
        const mapId = getMapId(campusName);
      
      
      // Base URL without directions
      let url = `https://app.mappedin.com/map/${mapId}`;
      
      // If we have room and entrance IDs, add directions
      if (roomId) {
        url = `https://app.mappedin.com/map/${mapId}/directions?location=${roomId}&departure=${undefined}`;
      } else if (roomId) {
        // Just navigate to the room without directions
        url = `https://app.mappedin.com/map/${mapId}/routes/${roomId}`;
      }
      
      Linking.openURL(url);}
    } catch (error) {
      console.error('Error opening browser URL:', error);
      setError('Failed to open browser');
    }
  };

  const [retryKey, setRetryKey] = useState(0);

  const displayRoomInfo = roomNumber ? `• Room ${roomNumber}` : (roomId ? '• Selected Room' : '• Indoor Map');

  console.log("Room ID:", roomId);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={() => {
        onClose()
        setNavigationIsStarted(true);
      }}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => {
        onClose()
        setNavigationIsStarted(true);
      }} style={styles.backButton}>
            <IconSymbol
              name={"arrow-back" as IconSymbolName}
              size={28}
              color="white"
              style={styles.modeIcon}
            />
          </Pressable>
          <Text style={styles.headerTitle}>
            {buildingName} {displayRoomInfo}
          </Text>
        </View>

        <View style={styles.webViewContainer}>
          {isLoading && !error && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Loading indoor map...</Text>
            </View>
          )}
          
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Unable to load indoor map. {error}
              </Text>
              <View style={styles.buttonRow}>
                <Pressable 
                  style={styles.tryAgainButton}
                  onPress={handleRetry}
                >
                  <Text style={styles.tryAgainButtonText}>Try Again</Text>
                </Pressable>
                <Pressable 
                  style={[styles.tryAgainButton, styles.browserButton]}
                  onPress={openInBrowser}
                >
                  <Text style={styles.tryAgainButtonText}>Open in Browser</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <MappedinView
              key={`mappedin-view-${retryKey}`}
              buildingName={buildingName ?? ''}
              campusName={campusName ?? ''}
              roomId={roomId ?? undefined}
              entranceId={undefined}
              floorId={floorId ?? undefined}
              onMapLoaded={handleMapLoaded}
              onError={handleMapError}
            />
          )}
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
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(1, 2, 19, 0.8)",
    zIndex: 10,
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  tryAgainButton: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginHorizontal: 5,
    flex: 1,
    alignItems: "center",
  },
  browserButton: {
    backgroundColor: "#4a90e2",
  },
  tryAgainButtonText: {
    color: "#010213",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default IndoorMapModal;