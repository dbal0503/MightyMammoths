import axios from "axios";

export interface RouteData {
  polyline: string;
  duration: string;
  distance: string;
  steps: any[];
}

export interface DistanceResult {
  isNearby: boolean;
  distanceValue: number;
  distanceText: string;
}

export async function getRoutes(
  origin: string,
  destination: string,
  mode: string
): Promise<RouteData | null> {

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
    origin
  )}&destination=${encodeURIComponent(
    destination
  )}&mode=${mode.toLowerCase()}&alternatives=true&key=${apiKey}`;

  try {
    const response = await axios.get<{ routes: any[] }>(url);
    const routes = response.data.routes;

    if (routes.length === 0) {
      console.warn(`No routes found for mode: ${mode}`);
      return null;
    }

    const shortestRoute = routes
      .map((route: any) => ({
        polyline: route.overview_polyline.points,
        duration: route.legs[0].duration.text,
        durationValue: route.legs[0].duration.value, 
        distance: route.legs[0].distance.text,
        steps: route.legs[0].steps,
      }))
      .sort((a, b) => a.durationValue - b.durationValue)[0]; // Only getting the shortest route

    return shortestRoute;
  } catch (error) {
    console.error("Error fetching directions,")
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}

/**
 * Checks if the user is within a certain threshold distance of a destination
 * @param userLocation Current user location (latitude,longitude)
 * @param destination Destination location or place ID (latitude,longitude or place_id:XXXXX)
 * @param thresholdInMeters Threshold distance in meters to consider "nearby" (default: 50)
 * @param mode Travel mode (default: walking)
 * @returns Promise with nearby status and distance information
 */
export async function checkProximityToDestination(
  userLocation: string,
  destination: string,
  thresholdInMeters: number = 50,
  mode: string = "walking"
): Promise<DistanceResult> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
      userLocation
    )}&destination=${encodeURIComponent(
      destination
    )}&mode=${mode.toLowerCase()}&key=${apiKey}`;

    const response = await axios.get<{ routes: any[] }>(url);
    const routes = response.data.routes;

    if (routes.length === 0) {
      console.warn(`No routes found for proximity check`);
      return { isNearby: false, distanceValue: Infinity, distanceText: "Unknown" };
    }

    // Get the distance value in meters
    const distanceValue = routes[0].legs[0].distance.value;
    const distanceText = routes[0].legs[0].distance.text;
    
    // Check if distance is less than threshold
    const isNearby = distanceValue <= thresholdInMeters;

    return {
      isNearby,
      distanceValue,
      distanceText
    };
  } catch (error) {
    console.error("Error checking proximity:", error);
    // Return default values on error
    return { isNearby: false, distanceValue: Infinity, distanceText: "Error" };
  }
}

// Add the Hall Building coordinates constant
const HALL_BUILDING_COORDS = {
  latitude: 45.497092, 
  longitude: -73.5788
};

// Add a threshold distance constant (in meters)
const HALL_BUILDING_PROXIMITY_THRESHOLD = 50;

/**
 * Checks if the user is near Hall Building
 * @param userLocation User's current location as latitude,longitude string
 * @returns Promise with a boolean indicating if user is near Hall Building
 */
export async function isNearHallBuilding(userLocation: string): Promise<boolean> {
  try {
    const result = await checkProximityToDestination(
      userLocation,
      `${HALL_BUILDING_COORDS.latitude},${HALL_BUILDING_COORDS.longitude}`,
      HALL_BUILDING_PROXIMITY_THRESHOLD
    );
    
    console.log(`User is ${result.isNearby ? 'near' : 'not near'} Hall Building. Distance: ${result.distanceText}`);
    return result.isNearby;
  } catch (error) {
    console.error("Error checking proximity to Hall Building:", error);
    return false;
  }
}
