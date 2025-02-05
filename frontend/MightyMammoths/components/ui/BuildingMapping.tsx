import React, { useState, useEffect } from 'react';
import MapView, { Geojson } from 'react-native-maps';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';


export default function App() {
  const [geoJsonData, setGeoJsonData] = useState(null);

  useEffect(() => {
   
    const loadGeoJSON = async () => {
      const asset = Asset.fromModule(require('../../assets/buildings/coordinates/campusbuildingcoords.json'));
      await asset.downloadAsync(); 

    
      if (asset.localUri) {
        try {
          const fileContent = await FileSystem.readAsStringAsync(asset.localUri);
          const data = JSON.parse(fileContent); 

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

  return geoJsonData ? (
    <Geojson
      geojson={geoJsonData}
      strokeColor="green"    
      strokeWidth={4}       
      fillColor="rgba(227, 7, 103, 0.3)" 
    />
  ) : null;
}
