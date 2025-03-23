import axios from "axios";

type Location = {
    id: number;
    location: string;
    name: string;
    time: string;
    type: string;
  };
  
export interface DistanceResult {
    from: string;
    to: string;
    distance: string;
    duration: string;
};

export async function getDistanceAndDuration(
    origin: string,
    destination: string
  ): Promise<DistanceResult | null> {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}&mode=walking&alternatives=true&key=${apiKey}`;
  
    try {
      const response = await axios.get(url);
      const routes = response.data.routes;
  
      if (!routes || routes.length === 0) {
        console.warn(`No routes found for walking mode from ${origin} to ${destination}.`);
        return null;
      }
  
      const shortestRoute = routes
        .map((route: any) => ({
          distance: route.legs[0].distance.text,
          duration: route.legs[0].duration.text,
          durationValue: route.legs[0].duration.value,
        }))
        .sort((a: { durationValue: number }, b: { durationValue: number }) => a.durationValue - b.durationValue)[0];
  
      return {
        from: origin,
        to: destination,
        distance: shortestRoute.distance,
        duration: shortestRoute.duration,
      };
    } catch (error) {
      console.error(`Error fetching directions from ${origin} to ${destination}.`);
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data);
      } else {
        console.error("Unexpected error:", error);
      }
      return null;
    }
  }


  //TODO Cover the case when the user puts 'Any SGW campus building' or 'LOY campus building' or 'Any campus building' as the location, need to calculate for all buildings within the campus
export const calculateAllPairsDistances = async (
    locations: Location[]
  ): Promise<DistanceResult[]> => {
    const results: DistanceResult[] = [];
  
    for (let i = 0; i < locations.length; i++) {
      for (let j = 0; j < locations.length; j++) {
        if (i !== j) {
          const origin = locations[i].location;
          const destination = locations[j].location;
  
          try {
            const distanceResult = await getDistanceAndDuration(origin, destination);
            if (distanceResult !== null) {  
              results.push(distanceResult);
            } else {
              console.warn(`No distance result found from ${origin} to ${destination}.`);
            }
          } catch (error) {
            console.error(`Error (${origin} → ${destination}): ${error}`);
          }
        }
      }
    }
    return results;
  };
  