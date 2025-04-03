const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
if (!apiKey) {
  console.log("failed loading google api key in building mapping");
}

export const fetchPlaceDetails = async (
  placeId: string,
  buildingName: string
) => {
  try {
    let apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (process.env.NODE_ENV === 'test' || apiKey === 'test-api-key') {
      apiKey = 'test-api-key';
    }
    if (!apiKey) {
      console.log("Failed loading Google API key in building mapping");
      return null;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&extra_computations=BUILDING_AND_ENTRANCES&key=${apiKey}`
    );
    const data = await response.json();

    // Extract the 1st buildings display polygon
    const displayPolygon =
      data.results?.[0]?.buildings?.[0]?.building_outlines?.[0]
        ?.display_polygon;
    if (!displayPolygon) {
      console.warn(
        `No display polygon found for PlaceID: ${placeId}, Building: ${buildingName}`
      );
      return null;
    }

    // Extracts and validate coordinates
    const coordinates = extractCoordinates(displayPolygon);
    if (coordinates.length > 0 && coordinates.every(isValidCoordinate)) {
      return coordinates;
    } else {
      console.warn(
        `Invalid coordinates for PlaceID: ${placeId}, Building: ${buildingName}`
      );
      return null;
    }
  } catch (error) {
    console.error(
      `Error fetching place details for PlaceID: ${placeId}, Building: ${buildingName}:`,
      error
    );
    return null;
  }
};

//to extracts coordinates from a polygon .
const extractCoordinates = (displayPolygon: any) => {
  if (displayPolygon.type === "Polygon") {
    return displayPolygon.coordinates[0]
      .filter((coord: number[]) => coord[0] !== null && coord[1] !== null)
      .map((coord: number[]) => ({
        latitude: coord[1],
        longitude: coord[0],
      }));
  } else if (displayPolygon.type === "MultiPolygon") {
    return displayPolygon.coordinates.flatMap((polygon: number[][]) =>
      polygon
        .filter((coord: number[]) => coord[0] !== null && coord[1] !== null)
        .map((coord: number[]) => ({
          latitude: coord[1],
          longitude: coord[0],
        }))
    );
  }
  return [];
};

const isValidCoordinate = (coord: { latitude: any; longitude: any }) => {
  return (
    typeof coord.latitude === "number" &&
    typeof coord.longitude === "number" &&
    !isNaN(coord.latitude) &&
    !isNaN(coord.longitude)
  );
};
