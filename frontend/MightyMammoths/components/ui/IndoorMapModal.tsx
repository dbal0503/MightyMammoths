import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  Text,
  Dimensions,
} from "react-native";
import {
  MiMapView,
  TMapViewRNOptions,
  TMiMapViewOptions,
} from "@mappedin/react-native-sdk";
import { GeoJsonFeature } from "./BuildingMapping";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { getVenue } from "@mappedin/react-native-sdk";
import { Picker } from "@react-native-picker/picker";

//Our MappedIn credentials

const options = {
  key: process.env.EXPO_PUBLIC_MAPPEDIN_CLIENT_ID,
  secret: process.env.EXPO_PUBLIC_MAPPEDIN_SECRET_KEY,
  mapId: "677d8a736e2f5c000b8f3fa6",
  labelAllLocationsOnInit: false,
};

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
  const mapView = React.useRef<MiMapView>(null);
  const [currentFloor, setCurrentFloor] = React.useState("First Floor");
  const [levels, setLevels] = React.useState<MappedinMap[]>([]);
  const [selectedMapId, setSelectedMapId] = React.useState<string | undefined>(
    undefined
  );
  const buildingName = building?.properties?.BuildingName || "Hall";

  // //TODO implement the handleNextFloor function
  // const handleNextFloor = () => {
  //   console.log("Next floor");
  // };
  // //TODO implement the handleNextFloor function
  // const handlePrevFloor = () => {
  //   console.log("Previous floor");
  // };

  // Level selector component
  const MapPicker = () => {
    if (!levels || levels.length === 0) return null;
    return (
      <Picker
        mode="dialog"
        selectedValue={selectedMapId}
        style={styles.picker}
        dropdownIconColor="#fff"
        onValueChange={(mapId) => {
          setSelectedMapId(mapId);
        }}
      >
        {levels.map((m) => (
          <Picker.Item key={m.id} label={m.name} value={m.id} />
        ))}
      </Picker>
    );
  };

  React.useEffect(() => {
    async function setMap() {
      if (selectedMapId && selectedMapId !== mapView.current?.currentMap?.id) {
        await mapView.current?.setMap(selectedMapId);
      }
    }
    setMap();
  }, [selectedMapId]);

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
              name="arrow-back"
              size={28}
              color="white"
              style={styles.modeIcon}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Building Name • Floor level</Text>
        </View>

        <View style={styles.dropdownContainer}>
          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownLabel}>Origin</Text>
          </Pressable>

          <Pressable style={styles.dropdown}>
            <Text style={styles.dropdownLabel}>Destination</Text>
          </Pressable>
        </View>

        <View style={styles.mapWrapper}>
          <MiMapView
            ref={mapView as React.RefObject<any>}
            style={styles.mapView}
            key="mappedin"
            options={options}
            onFirstMapLoaded={() => {
              setSelectedMapId(mapView.current?.currentMap?.id);
              setLevels(mapView.current?.venueData?.maps || []);

              const locationFAKE = {
                //Fake location for testing Blue dot
                timestamp: Date.now(),
                coords: {
                  accuracy: 5,
                  latitude: 73.579,
                  longitude: 45.4973,
                  floorLevel: 0,
                },
                type: 0,
              };

              mapView.current?.BlueDot.enable(); //Blue dot not working need to fix
              mapView.current?.overrideLocation(locationFAKE); //Blue dot not working need to fix
              mapView.current?.FlatLabels.labelAllLocations(); //Labels not working need to fix
            }}
            onMapChanged={({ map }) => {
              setSelectedMapId(map.id);
            }}
          />

          {/* <View style={styles.floorButtonsContainer}>
            <Pressable style={styles.floorButton} onPress={handlePrevFloor}>
              <IconSymbol
                name="arrow-back"
                size={20}
                color="white"
                style={styles.modeIcon}
              />
              <Text style={styles.floorButtonText}>Prev floor</Text>
            </Pressable>


            <Pressable style={styles.floorButton} onPress={handleNextFloor}>
              <Text style={styles.floorButtonText}>Next floor</Text>
              <IconSymbol
                name="arrow.forward"
                size={20}
                color="white"
                style={styles.modeIcon}
              />
            </Pressable>
          </View> */}

          {/* Level Selector */}
          <View style={styles.levelSelectorContainer}>
            <MapPicker />
          </View>
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
  dropdownContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dropdown: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownLabel: {
    fontSize: 16,
    color: "#333",
  },
  mapWrapper: {
    flex: 1,
    position: "relative",
  },
  mapView: {
    ...StyleSheet.absoluteFillObject,
  },
  floorButtonsContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  floorButton: {
    backgroundColor: "#010213",
    borderRadius: 24,
    paddingVertical: 17,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  floorButtonText: {
    color: "white",
    marginHorizontal: 8,
    fontSize: 16,
  },
  modeIcon: {
    marginRight: 10,
    marginLeft: 10,
    alignItems: "center",
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 16,
  },
  levelSelectorContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    width: "90%",
    backgroundColor: "#010213",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  picker: {
    color: "#fff", // White text
    fontSize: 16,
  },
});

export default IndoorMapModal;
