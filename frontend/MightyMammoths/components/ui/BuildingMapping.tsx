import React, {useState, useEffect} from 'react';
import MapView, { Marker, Polygon} from 'react-native-maps';
import { View, Text, StyleSheet,  } from 'react-native';

export interface GeoJsonFeature {
  type: string;
  properties: {
    Campus: string;
    Building: string;
    BuildingName: string;
    'Building Long Name': string;
    Address: string;
    PlaceID: string;
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
  const [polygons, setPolygons] = useState<any[]>([]);

  
  
  
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    if(!apiKey){
        console.log('failed loading google api key in building mapping')
    }
    else {console.log("api key loadedj")}

    const fetchPlaceDetails = async (placeId: string) => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&extra_computations=BUILDING_AND_ENTRANCES&key=${apiKey}`
        );
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2)); // Log the full response for debugging
    
        if (data.results && data.results.length > 0) {
          const buildings = data.results[0].buildings;
          if (buildings && buildings.length > 0) {
            const buildingOutlines = buildings[0].building_outlines;
            if (buildingOutlines && buildingOutlines.length > 0) {
              const coordinates = buildingOutlines[0].display_polygon.coordinates[0].map((coord: number[]) => ({
                latitude: coord[1],
                longitude: coord[0],
              }));
              return coordinates;
            }
          }
        }
        return null; // Return null if no coordinates are found
      } catch (error) {
        console.error('Error fetching place details:', error);
        return null;
      }
    };

    const testSinglePlaceId = async () => {
      const placeId = 'ChIJ-aOOv2sayUwR_yIIibMljzc'; 
      const coordinates = await fetchPlaceDetails(placeId);
        setPolygons([{ coordinates, buildingName: 'Test Building' }]);
        console.log('Single test successful');
      
    };
  
    useEffect(() => {
      testSinglePlaceId();
    }, []);
  

  const renderMarkers = (geoJsonData: GeoJsonData) =>
    geoJsonData.features.map((feature) => {
      if (feature.geometry.type === 'Point') {
        const [longitude, latitude] = feature.geometry.coordinates;
        const buildingName = feature.properties.BuildingName;
        const buildingAccronym = feature.properties.Building;
        return (
          <Marker
            key={buildingName}
            coordinate={{ latitude, longitude }}
            title={buildingName}
            description={feature.properties.Address}
            onPress={() => onMarkerPress(buildingName)}
            testID={`marker-${buildingAccronym}`}
          >
            <View style={styles.marker}>
              <Text style={styles.text} testID={`marker-text-${buildingAccronym}`}>{feature.properties.Building}</Text>
            </View>
          </Marker>
        );
      }
      return null;
    });



    
    
    const renderPolygons = () =>
      polygons
        .filter((polygon) => polygon.coordinates) 
        .map((polygon, index) => (
          <Polygon
            key={`polygon-${index}`}
            coordinates={polygon.coordinates}
            strokeColor="rgba(255,0,0,0.8)"
            fillColor="rgba(255,0,0,0.3)"
            strokeWidth={2}
            zIndex={2}
          />
        ));

  return <>
  {renderMarkers(geoJsonData)}
  {renderPolygons()}
  </>;
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
