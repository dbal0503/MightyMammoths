import React, { useState, useEffect } from 'react';
import { Marker } from 'react-native-maps';
import { Alert, Image } from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

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

  // Function to handle Marker clicks
  const handleMarkerPress = (buildingName: string, address: string) => {
    // Replace with the info sheet
    Alert.alert(`Building: ${buildingName}`, `Address: ${address}`);
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
            onPress={() => handleMarkerPress(buildingName, address)} 
          >
            {}
            <Image
              source={require('../../assets/images/arrow.png')} 
              style={{ width: 30, height: 30 }} 
            />
          </Marker>
        );
      }
      return null;
    });
  };

  return <>{renderMarkers(geoJsonData)}</>;
};

const MapDataLoader: React.FC = () => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null);

  useEffect(() => {
    const loadGeoJSON = async () => {
      const asset = Asset.fromModule(require('../../assets/buildings/coordinates/campusbuildingcoords.json'));
      await asset.downloadAsync();

      if (asset.localUri) {
        try {
          const fileContent = await FileSystem.readAsStringAsync(asset.localUri);
          const data: GeoJsonData = JSON.parse(fileContent);
          console.log('GeoJSON Data:', data);
          setGeoJsonData(data);
        } catch (error) {
          console.error('Error reading GeoJSON file:', error);
        }
      } else {
        console.error('Asset localUri is null.');
      }
    };

    loadGeoJSON();
  }, []);

  return geoJsonData ? <BuildingMapping geoJsonData={geoJsonData} /> : null;
};

export default MapDataLoader;
