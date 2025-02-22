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

    const fetchPlaceDetails = async (placeId: string, buildingName: string) => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&extra_computations=BUILDING_AND_ENTRANCES&key=${apiKey}`
        );
        const data = await response.json();
    
        if (data.results && data.results.length > 0) {
          const buildings = data.results[0].buildings;
          if (buildings && buildings.length > 0) {
            const buildingOutlines = buildings[0].building_outlines;
            if (buildingOutlines && buildingOutlines.length > 0) {
              const displayPolygon = buildingOutlines[0].display_polygon;
    
              // Handle Polygon and MultiPolygon
              if (displayPolygon.type === 'Polygon') {
                const coordinates = displayPolygon.coordinates[0]
                  .filter((coord: number[]) => coord[0] !== null && coord[1] !== null) // Filter out invalid coordinates
                  .map((coord: number[]) => ({
                    latitude: coord[1], 
                    longitude: coord[0], 
                  }));
    
                // Validate the coordinates array
                if (coordinates.length > 0 && coordinates.every(isValidCoordinate)) {
                  console.log(`Valid coordinates for PlaceID: ${placeId}, Building: ${buildingName}`);
                  return coordinates;
                } else {
                  console.warn(`Invalid coordinates for PlaceID: ${placeId}, Building: ${buildingName}`);
                }
              } else if (displayPolygon.type === 'MultiPolygon') {
                // Handle MultiPolygon by flattening all polygons into one array
                const coordinates = displayPolygon.coordinates.flatMap((polygon: number[][]) =>
                  polygon
                    .filter((coord: number[]) => coord[0] !== null && coord[1] !== null) // Filter out invalid coordinates
                    .map((coord: number[]) => ({
                      latitude: coord[1],
                      longitude: coord[0],
                    }))
                );
    
                // Validate the coordinates array
                if (coordinates.length > 0 && coordinates.every(isValidCoordinate)) {
                  console.log(`Valid coordinates for PlaceID: ${placeId}, Building: ${buildingName}`);
                  return coordinates;
                } else {
                  console.warn(`Invalid coordinates for PlaceID: ${placeId}, Building: ${buildingName}`);
                }
              }
            }
          }
        }
        return null; // Return null if no valid coordinates are found
      } catch (error) {
        console.error(`Error fetching place details for PlaceID: ${placeId}, Building: ${buildingName}:`, error);
        return null;
      }
    };

    const loadAllPolygons = async () => {
      const polygonData = await Promise.all(
        geoJsonData.features.map(async (feature) => {
          if (feature.geometry.type === 'Point') {
            const coordinates = await fetchPlaceDetails(feature.properties.PlaceID,  feature.properties.BuildingName);
            if (coordinates) {
              return { coordinates, buildingName: feature.properties.BuildingName };
            }
          }
          return null;
        })
      );
      setPolygons(polygonData.filter(Boolean));
    };
  
    useEffect(() => {
      loadAllPolygons();
      console.log('Polygons:', polygons);
    }, [geoJsonData]);

    /*const testSinglePlaceId = async () => {
      const placeId = 'ChIJ-aOOv2sayUwR_yIIibMljzc'; 
      const coordinates = await fetchPlaceDetails(placeId);
        setPolygons([{ coordinates, buildingName: 'Test Building' }]);
        console.log('Single test successful');
      
    };
  
    useEffect(() => {
      testSinglePlaceId();
    }, []);*/
  

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
        .filter((polygon) => polygon.coordinates && polygon.coordinates.length > 0) // Filter out invalid polygons
        .map((polygon, index) => {
          //console.log('Polygon coordinates:', polygon.coordinates); 
          return (
            <Polygon
              key={`polygon-${index}`}
              coordinates={polygon.coordinates}
              strokeColor="rgba(255,0,0,0.8)"
              fillColor="rgba(255,0,0,0.3)"
              strokeWidth={2}
              zIndex={2}
            />
          );
        });

  return <>
  {renderMarkers(geoJsonData)}
  {renderPolygons()}
  </>;
};

const isValidCoordinate = (coord: { latitude: any; longitude: any }) => {
  return (
    typeof coord.latitude === 'number' &&
    typeof coord.longitude === 'number' &&
    !isNaN(coord.latitude) &&
    !isNaN(coord.longitude)
  );
};

const isValidPolygon = (polygon: { coordinates: any[] }) => {
  return (
    polygon.coordinates &&
    Array.isArray(polygon.coordinates) &&
    polygon.coordinates.length > 0 &&
    polygon.coordinates.every(isValidCoordinate)
  );
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


/*Broken Coordinates (MUST FIND AND ERADICATE!)
Polygon coordinates: [{"latitude": [-73.5767846513606, 45.4937175398812], "longitude": [-73.577172341666, 45.4939026657172]}, {"latitude": [-73.5771976314539, 45.4928385723552], "longitude": [-73.5773789967915, 45.4929261204166]}]
 (NOBRIDGE) LOG  Polygon coordinates: [{"latitude": [-73.5767846513606, 45.4937175398812], "longitude": [-73.577172341666, 45.4939026657172]}, {"latitude": [-73.5771976314539, 45.4928385723552], "longitude": [-73.5773789967915, 45.4929261204166]}]
 (NOBRIDGE) LOG  Polygon coordinates: [{"latitude": [-73.5767846513606, 45.4937175398812], "longitude": [-73.577172341666, 45.4939026657172]}, {"latitude": [-73.5771976314539, 45.4928385723552], "longitude": [-73.5773789967915, 45.4929261204166]}] 
  Polygon coordinates: [{"latitude": [-73.6407985119765, 45.4586801381204], "longitude": [-73.6408772869513, 45.4585890444863]}, {"latitude": [-73.6407957736703, 45.4583791494107], "longitude": [-73.640685034277, 45.4585208608007]}]
 */
