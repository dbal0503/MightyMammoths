import React, {useState, useEffect} from 'react';
import { Marker, Polygon} from 'react-native-maps';
import { View, Text, StyleSheet,  } from 'react-native';
import { fetchPlaceDetails} from '../../services/buildingsService';
import { SuggestionResult } from '@/services/searchService';

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
  nearbyPlaces: SuggestionResult[];
  onNearbyPlacePress?: (place: SuggestionResult) => void;

  showCafes: boolean;
  showRestaurants: boolean;
}

const BuildingMapping: React.FC<BuildingMappingProps> = ({ 
  geoJsonData, 
  onMarkerPress,
  nearbyPlaces,
  onNearbyPlacePress,
  showCafes,
  showRestaurants,
}) => {
  const [polygons, setPolygons] = useState<any[]>([]);

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
    }, [geoJsonData]);

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

    const renderNearbyMarkers = () => {
      if (!nearbyPlaces || nearbyPlaces.length === 0) return null;
      return nearbyPlaces.map((place, index) => {
        if (!place.location) return null;
        const { latitude, longitude } = {latitude: place.location?.latitude, longitude: place.location?.longitude};
        const mainText = place.placePrediction.structuredFormat.mainText.text;

        if ((showCafes || showRestaurants) ) {
        return (
          <Marker
            key={`nearby-${index}`}
            coordinate={{ latitude, longitude }}
            title={mainText}
            onPress={() => onNearbyPlacePress && onNearbyPlacePress(place)}
          >
            <View style={styles.nearbyMarker}>
              <Text style={styles.text}>{mainText}</Text>
            </View>
          </Marker>
        );
     }
      return null;
      });
    };

    const renderPolygons = () =>
      polygons
        .filter((polygon) => polygon.coordinates && polygon.coordinates.length > 0) // Filter out invalid polygons
        .map((polygon, index) => {
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

        const rendermissingPolygons = () =>
          Object.entries(missingPolygons).map(([buildingName, coordinates]) => (
            <Polygon
              key={buildingName}
              coordinates={coordinates}
              strokeColor="rgba(255,0,0,0.8)"
              fillColor="rgba(255,0,0,0.3)"
              strokeWidth={2}
              zIndex={2}
            />
          )
        );

  return <>
  {renderMarkers(geoJsonData)}
  {renderPolygons()}
  {rendermissingPolygons()}
  {renderNearbyMarkers()}
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

const missingPolygons = {
  EV: [
    { latitude: 45.495633054158894, longitude: -73.57874661684036 },
    { latitude: 45.49559169126274, longitude: -73.57867151498795 },
    { latitude: 45.495565369403934, longitude: -73.57869565486908 },
    { latitude: 45.49524574585073, longitude: -73.57803583145142 },
    { latitude: 45.495255146569384, longitude: -73.5780143737793 },
    { latitude: 45.495185581214294, longitude: -73.57787221670151 },
    { latitude: 45.495439400337794, longitude: -73.57761472463608 },
    { latitude: 45.495493924296525, longitude: -73.57774078845978 },
    { latitude: 45.49551084551436, longitude: -73.57772469520569 },
    { latitude: 45.49553152699593, longitude: -73.57775688171387 },
    { latitude: 45.495584170732904, longitude: -73.5776898264885 },
    { latitude: 45.495514605784315, longitude: -73.57753962278365 },
    { latitude: 45.4958361079357, longitude: -73.5772231221199 },
    { latitude: 45.49607676331564, longitude: -73.57770323753357 },
    { latitude: 45.495755262538225, longitude: -73.57800632715225 },
    { latitude: 45.495903792365255, longitude: -73.57830941677094 },
    { latitude: 45.49588311102042, longitude: -73.57833623886108 },
    { latitude: 45.49593387430786, longitude: -73.57844889163971 },
    { latitude: 45.495633054158894, longitude: -73.57874661684036 },
  ],
  FC: [
    { latitude: 45.458347122224595, longitude: -73.63920629024506 },
    { latitude: 45.45852397123731, longitude: -73.63907754421233 },
    { latitude: 45.45866695513995, longitude: -73.63956034183502 },
    { latitude: 45.458648141489256, longitude: -73.63966226577757 },
    { latitude: 45.45856912408782, longitude: -73.6396837234497 },
    { latitude: 45.45849386931688, longitude: -73.63958179950713 },
    { latitude: 45.458347122224595, longitude: -73.63920629024506 },
  ],
  CC: [
    { latitude: 45.458482581092554, longitude: -73.64071905612946 },
    { latitude: 45.45832078296248, longitude: -73.64087998867035 },
    { latitude: 45.457985896985775, longitude: -73.64002704620361 },
    { latitude: 45.458170272657235, longitude: -73.63988757133484 },
    { latitude: 45.458482581092554, longitude: -73.64071905612946 },
  ],
  AD: [
    { latitude: 45.4578509, longitude: -73.6401821 },
    { latitude: 45.457723, longitude: -73.6398683 },
    { latitude: 45.4578058, longitude: -73.6397771 },
    { latitude: 45.4578472, longitude: -73.6398683 },
    { latitude: 45.4581217, longitude: -73.6396269 },
    { latitude: 45.4580972, longitude: -73.6395357 },
    { latitude: 45.4581875, longitude: -73.6394901 },
    { latitude: 45.4583022, longitude: -73.6398012 },
    { latitude: 45.4582345, longitude: -73.639879 },
    { latitude: 45.4581969, longitude: -73.6398039 },
    { latitude: 45.4580784, longitude: -73.6398951 },
    { latitude: 45.4580916, longitude: -73.6399353 },
    { latitude: 45.4580239, longitude: -73.6399809 },
    { latitude: 45.4580089, longitude: -73.6399621 },
    { latitude: 45.4578904, longitude: -73.6400533 },
    { latitude: 45.4579111, longitude: -73.640115 },
    { latitude: 45.4578509, longitude: -73.6401821 },
  ],
  RF: [
    { latitude: 45.45849010657569, longitude: -73.64131987094879 },
    { latitude: 45.45844119091744, longitude: -73.6411589384079 },
    { latitude: 45.458358410476016, longitude: -73.64121258258818 },
    { latitude: 45.45831702020976, longitude: -73.64107847213745 },
    { latitude: 45.4583809869721, longitude: -73.64102482795715 },
    { latitude: 45.458328308467216, longitude: -73.64088535308838 },
    { latitude: 45.45844871640609, longitude: -73.6407083272934 },
    { latitude: 45.458505157538916, longitude: -73.64087462425232 },
    { latitude: 45.45874973512836, longitude: -73.64070296287537 },
    { latitude: 45.45887766759871, longitude: -73.64105165004729 },
    { latitude: 45.45849010657569, longitude: -73.64131987094879 },
  ],
  PY: [
    { latitude: 45.45880241323957, longitude: -73.64084780216217 },
    { latitude: 45.458648141489256, longitude: -73.64041328430176 },
    { latitude: 45.459050752243655, longitude: -73.64010751247406 },
    { latitude: 45.459220073664795, longitude: -73.64053666591644 },
    { latitude: 45.45880241323957, longitude: -73.64084780216217 },
  ],
  JR: [
    { latitude: 45.45839603796446, longitude: -73.64339053630829 },
    { latitude: 45.45829820644231, longitude: -73.64315986633301 },
    { latitude: 45.45850139479848, longitude: -73.64300966262817 },
    { latitude: 45.45854278492943, longitude: -73.64313840866089 },
    { latitude: 45.4584976320578, longitude: -73.6431759595871 },
    { latitude: 45.45852773397622, longitude: -73.64327251911163 },
    { latitude: 45.45839603796446, longitude: -73.64339053630829 },
  ],
  HC: [
    { latitude: 45.459633968331474, longitude: -73.642258644104 },
    { latitude: 45.45952485094153, longitude: -73.64201188087463 },
    { latitude: 45.4597016962604, longitude: -73.64187777042387 },
    { latitude: 45.459716746900206, longitude: -73.641899228096 },
    { latitude: 45.45983715187417, longitude: -73.6418080329895 },
    { latitude: 45.45990864220581, longitude: -73.6420065164566 },
    { latitude: 45.459776949419336, longitude: -73.64208698272705 },
    { latitude: 45.45980705065478, longitude: -73.64212989807129 },
    { latitude: 45.459633968331474, longitude: -73.642258644104 },
  ],
  SH: [
    { latitude: 45.4593367170147, longitude: -73.64265561103821 },
    { latitude: 45.4592351244332, longitude: -73.6426717042923 },
    { latitude: 45.45923888712465, longitude: -73.6424732208252 },
    { latitude: 45.45935176775193, longitude: -73.6424732208252 },
    { latitude: 45.4593367170147, longitude: -73.64265561103821 },
  ],
};

const styles = StyleSheet.create({
  marker: {
    backgroundColor: 'maroon',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nearbyMarker: {
    backgroundColor: 'green', 
    padding: 6,
    borderRadius: 10,
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
