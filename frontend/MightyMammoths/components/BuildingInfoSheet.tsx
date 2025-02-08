// components/BuildingInfo.tsx
import campusBuildingCoords from '../assets/buildings/coordinates/campusbuildingcoords.json';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Define the type for the building properties
interface BuildingProperties {
  Campus: string;
  Building: string;
  BuildingName: string;
  'Building Long Name': string;
  Address: string;
  Latitude: number;
  Longitude: number;
}

// Define the type for the props passed to the BuildingInfo component
interface BuildingInfoProps {
  buildingName: string;
}

// Utility function to get building information
export const getBuildingInfo = (buildingName: string): BuildingProperties | null => {
  const building = campusBuildingCoords.features.find(
    (feature) => feature.properties.BuildingName === buildingName
  );
  return building ? building.properties : null;
};

const BuildingInfo: React.FC<BuildingInfoProps> = ({ buildingName }) => {
  const [buildingInfo, setBuildingInfo] = useState<BuildingProperties | null>(null);

  useEffect(() => {
    console.log('Fetching info for:', buildingName);
    const info = getBuildingInfo(buildingName);
    setBuildingInfo(info);
    console.log('Building info:', info);
  }, [buildingName]);

  if (!buildingInfo) {
    return (
      <View style={styles.container}>
        <Text>Loading building information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{buildingInfo['Building Long Name']}</Text>
      <Text style={styles.subtitle}>{buildingInfo.BuildingName}</Text>
      <Text style={styles.info}>Campus: {buildingInfo.Campus}</Text>
      <Text style={styles.info}>Address: {buildingInfo.Address}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});

export default BuildingInfo;