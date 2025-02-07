import React from 'react';
import { Marker } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';

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
  onMarkerPress: (buildingName: string) => void;
}

const BuildingMapping: React.FC<BuildingMappingProps> = ({ geoJsonData, onMarkerPress }) => {
  const renderMarkers = (geoJsonData: GeoJsonData) =>
    geoJsonData.features.map((feature) => {
      if (feature.geometry.type === 'Point') {
        const [longitude, latitude] = feature.geometry.coordinates;
        const buildingName = feature.properties.BuildingName;
        return (
          <Marker
            key={buildingName}
            coordinate={{ latitude, longitude }}
            title={buildingName}
            description={feature.properties.Address}
            onPress={() => onMarkerPress(buildingName)}
          >
            <View style={styles.marker}>
              <Text style={styles.text}>{feature.properties.Building}</Text>
            </View>
          </Marker>
        );
      }
      return null;
    });

  return <>{renderMarkers(geoJsonData)}</>;
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
});

export default BuildingMapping;
