import axios from "axios";

export interface RouteData {
  polyline: string;
  duration: string;
  distance: string;
  steps: any[];
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
