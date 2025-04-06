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
import { getRoom, getNearestEntrance, getMapId } from "../../services/mappedinService";
import { useNavigation as useNavigationProvider } from "../NavigationProvider";
import { getMappedinUrl } from "../../utils/hallBuildingRooms";

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
  userLocation,
}: IndoorMapModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [floorId, setFloorId] = useState<string | null>(null);
  const [entranceId, setEntranceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const { state } = useNavigationProvider();
  const { selectedRoomId } = state;
  
  const buildingName = building?.properties?.BuildingName || "Hall Building";

  // Debug the component rendering and props
  useEffect(() => {
    console.log('IndoorMapModal rendered with props:', {
      visible,
      buildingName,
      roomNumber, 
      propRoomId,
      propFloorId,
      selectedRoomId: state.selectedRoomId
    });
  }, [visible, roomNumber, propRoomId, propFloorId, state.selectedRoomId]);

  // Reset state when modal shows/hides
  useEffect(() => {
    console.log(`[IndoorMapModal] Visibility changed to: ${visible}`);
    if (visible) {
      console.log('[IndoorMapModal] Modal became visible, resetting state');
      setIsLoading(true);
      setError(null);
      setMapLoaded(false);
      
      // Set default entrance ID for Hall Building
      if (buildingName === "Hall Building" || buildingName === "H Building") {
        console.log('[IndoorMapModal] Setting default Hall Building entrance ID');
        setEntranceId("s_e72c2ed4f1949630"); // Main entrance ID from URL
      }
      
      // Alert to confirm we're actually showing the modal (for debugging)
      console.log('[IndoorMapModal] 🚨 MODAL IS NOW VISIBLE 🚨');
    }
  }, [visible, buildingName]);

  // Force visibility if we have a room ID but modal isn't showing
  useEffect(() => {
    // If we have a room ID (either direct prop or from context) but modal isn't visible
    const hasRoomId = propRoomId || selectedRoomId || roomNumber;
    if (hasRoomId && !visible && !error) {
      console.log('[IndoorMapModal] 🔄 We have a room ID but modal is not visible:', {
        propRoomId,
        selectedRoomId,
        roomNumber
      });
    }
  }, [propRoomId, selectedRoomId, roomNumber, visible]);

  // Check if we have direct roomId and floorId props
  useEffect(() => {
    console.log('Checking room and floor IDs:', { propRoomId, propFloorId, selectedRoomId });
    
    // Priority: 1. Direct props passed in, 2. Context selectedRoomId, 3. Look up by roomNumber
    if (propRoomId) {
      console.log('Using propRoomId:', propRoomId);
      setRoomId(propRoomId);
    } else if (selectedRoomId) {
      console.log('Using selectedRoomId from context:', selectedRoomId);
      setRoomId(selectedRoomId);
    }

    if (propFloorId) {
      console.log('Using propFloorId:', propFloorId);
      setFloorId(propFloorId);
    }
  }, [propRoomId, propFloorId, selectedRoomId]);

  // Load room and entrance IDs when modal becomes visible
  useEffect(() => {
    if (visible && roomNumber && !roomId) {
      console.log('Trying to load room details for:', roomNumber);
      const loadLocationIds = async () => {
        try {
          // Get room by number
          const room = await getRoom(buildingName, roomNumber);
          if (room) {
            console.log('Found room:', room);
            setRoomId(room.id);
          } else {
            console.warn(`Room ${roomNumber} not found in ${buildingName}`);
          }
          
          // Get nearest entrance based on user location
          if (userLocation) {
            const entrance = await getNearestEntrance(buildingName, userLocation);
            if (entrance) {
              console.log('Found entrance:', entrance);
              setEntranceId(entrance.id);
            } else {
              console.warn(`Could not determine nearest entrance for ${buildingName}`);
            }
          }
        } catch (error) {
          console.error('Error loading indoor map data:', error);
          setError('Failed to load indoor navigation data');
        }
      };
      
      loadLocationIds();
    }
  }, [visible, roomNumber, buildingName, userLocation, roomId]);

  const handleMapError = (errorMessage: string) => {
    console.error('Map error:', errorMessage);
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleMapLoaded = () => {
    setIsLoading(false);
    setMapLoaded(true);
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setMapLoaded(false);
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
      const mapId = getMapId(buildingName) || "677d8a736e2f5c000b8f3fa6"; // Fallback to Hall Building ID
      
      // Base URL without directions
      let url = `https://app.mappedin.com/map/${mapId}`;
      
      // If we have room and entrance IDs, add directions
      if (roomId && entranceId) {
        url = `https://app.mappedin.com/map/${mapId}/directions?location=${roomId}&departure=${entranceId}`;
      } else if (roomId) {
        // Just navigate to the room without directions
        url = `https://app.mappedin.com/map/${mapId}/routes/${roomId}`;
      }
      
      Linking.openURL(url);
    } catch (error) {
      console.error('Error opening browser URL:', error);
      setError('Failed to open browser');
    }
  };

  const [retryKey, setRetryKey] = useState(0);

  const displayRoomInfo = roomNumber ? `• Room ${roomNumber}` : (roomId ? '• Selected Room' : '• Indoor Map');

  console.log(`[IndoorMapModal] Rendering with visible=${visible}, roomId=${roomId || 'none'}, floorId=${floorId || 'none'}`);

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
              buildingName={buildingName}
              roomId={roomId || undefined}
              entranceId={entranceId || undefined}
              floorId={floorId || undefined}
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