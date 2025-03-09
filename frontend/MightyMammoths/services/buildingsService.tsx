const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!apiKey) {
  console.log('failed loading google api key in building mapping')
}

export const fetchPlaceDetails = async (placeId: string, buildingName: string) => {
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
              //console.log(`Valid coordinates for PlaceID: ${placeId}, Building: ${buildingName}`);
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
              //console.log(`Valid coordinates for PlaceID: ${placeId}, Building: ${buildingName}`);
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




const isValidCoordinate = (coord: { latitude: any; longitude: any }) => {
  return (
    typeof coord.latitude === 'number' &&
    typeof coord.longitude === 'number' &&
    !isNaN(coord.latitude) &&
    !isNaN(coord.longitude)
  );
};