import React, { useState, useEffect } from 'react';
import { Marker } from 'react-native-maps';
import { Alert, Image, Modal, Text, StyleSheet, View } from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import campusBuildingCoords from '../../assets/buildings/coordinates/campusbuildingcoords.json';
import BuildingInfo from '../BuildingInfoSheet';


interface GeoJsonFeature {
  type: string;
  properties: {
    Campus: string;
    Building: string;
    BuildingName: string;
    'Building Long Name': string;
    Address: string;
    Latitude: number;
    Longitude: number;
  };
  geometry: {
    type: string;
    coordinates: number[]; 
  };
}

interface GeoJsonData {
  type: string;
  name: string;
  features: GeoJsonFeature[];
}

interface BuildingMappingProps {
  geoJsonData: GeoJsonData;
}

const BuildingMapping: React.FC<BuildingMappingProps> = ({ geoJsonData }) => {
  const [selectedBuildingName, setSelectedBuildingName] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false); 
  // Function to handle Marker clicks: calls the BuildingInfoSheet
  const handleMarkerPress = (buildingName: string) => {
    console.log('Marker pressed:', buildingName);
    setSelectedBuildingName(buildingName);
    setModalVisible(true); 
  };

  const renderMarkers = (geoJsonData: GeoJsonData) => {
    return geoJsonData.features.map((feature) => {
      if (feature.geometry.type === 'Point') {
        const coordinates = feature.geometry.coordinates;
        const buildingName = feature.properties.BuildingName;
        const address = feature.properties.Address;

        const [longitude, latitude] = coordinates;

        return (
          <Marker
            key={buildingName}
            coordinate={{ latitude, longitude }} 
            title={buildingName}
            description={address}
            onPress={() => handleMarkerPress(buildingName)} 
          >

            {}
            
            <View style={styles.marker}>
              <Text style={styles.text}>{feature.properties.Building} </Text>
            </View>
          </Marker>
          
        );
      }
      return null;
    });
  };
//Pop up containing the BuildingInfo
  return (<>{renderMarkers(geoJsonData)}
 <Modal
  visible={modalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => {
    setModalVisible(false);
    setSelectedBuildingName(null);
  }}
>
  <View style={styles.modalContainer}>
    {selectedBuildingName && (
      <BuildingInfo key={selectedBuildingName} buildingName={selectedBuildingName} />
    )}
  </View>
</Modal>
  </>);
};

const styles = StyleSheet.create({
  marker: {
    backgroundColor: 'maroon',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

const MapDataLoader: React.FC = () => {
  console.log("MapDataLoaded")
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null);

  useEffect(() => {
    
    setGeoJsonData(campusBuildingCoords);
  }, []);

  return geoJsonData ? <BuildingMapping geoJsonData={geoJsonData} /> : null;

};

export default MapDataLoader;
