//import { GOOGLE_MAPS_API_KEY } from "@env";
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
): Promise<RouteData[]> {
  const apiKey = GOOGLE_MAPS_API_KEY; //REPLACE WITH YOUR OWN API KEY
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
    origin
  )}&destination=${encodeURIComponent(
    destination
  )}&mode=${mode.toLowerCase()}&alternatives=true&key=${apiKey}`;

  try {
    const response = await axios.get<{ routes: any[] }>(url);
    const routes = response.data.routes;
    const result: RouteData[] = routes.map((route: any) => ({
      polyline: route.overview_polyline.points,
      duration: route.legs[0].duration.text,
      distance: route.legs[0].distance.text,
      steps: route.legs[0].steps,
    }));
    return result;
  } catch (error) {
    console.error("Error fetching directions", error);
    throw error;
  }
}
