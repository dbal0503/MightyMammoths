import React, { useState, useEffect } from 'react';
import { Marker } from 'react-native-maps';
import { Alert, Image } from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import campusBuildingCoords from '../../assets/buildings/coordinates/campusbuildingcoords.json';


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
            testID={`marker-${buildingName}`}
            coordinate={{ latitude, longitude }} 
            title={buildingName}
            description={address}
            onPress={() => handleMarkerPress(buildingName, address)} 
          >

            {}
            <Image
              testID={`markerImage-${buildingName}`}
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
  console.log("MapDataLoaded")
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonData | null>(null);

  useEffect(() => {
    
    setGeoJsonData(campusBuildingCoords);
  }, []);

  return geoJsonData ? <BuildingMapping geoJsonData={geoJsonData} /> : null;

};

export default MapDataLoader;
