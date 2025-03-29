import axios from "axios";
import campusBuildingCoords from "../assets/buildings/coordinates/campusbuildingcoords.json";
import * as FileSystem from "expo-file-system";

type Tuple = [string, string];

const addTuple = (tuple: Tuple, tupleSet: Set<string>) => {
  tupleSet.add(JSON.stringify(tuple));
};

const hasTuple = (tuple: Tuple, tupleSet: Set<string>): boolean => {
  return tupleSet.has(JSON.stringify(tuple));
};

const buildingResults: DistanceResult[] = [];
const buildingSet = new Set<string>();

type Location = {
    id: number;
    location: string;
    locationPlaceID: string;
    name: string;
    time: string;
    type: string;
  };
  
export interface DistanceResult {
    from: string;
    fromPlaceID: string;
    to: string;
    toPlaceID: string;
    distance: string;
    duration: string;
};

interface CampusBuildingFeature {
  type: string;
  properties: {
    Campus: string;
    Building: string;
    BuildingName: string;
    "Building Long Name": string;
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

interface CampusBuildingCollection {
  type: string;
  name: string;
  features: CampusBuildingFeature[];
}

export async function getDistanceAndDuration(
    origin: string,
    originPlaceID: string,
    destination: string,
    destinationPlaceID: string
  ): Promise<DistanceResult | null> {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    let originParam = ``;
    let destinationParam = ``;

    if (origin === "Your Location"){
      originParam = originPlaceID;
    } else {
      originParam = originPlaceID.trim() ? `place_id:${originPlaceID}` : origin;
    }

    if (destination === "Your Location"){
      destinationParam = destinationPlaceID;
    } else {
      destinationParam = destinationPlaceID.trim() ? `place_id:${destinationPlaceID}` : destination;
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
      originParam
    )}&destination=${encodeURIComponent(
      destinationParam
    )}&mode=walking&alternatives=true&key=${apiKey}`;
  
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
        fromPlaceID: originPlaceID,
        to: destination,
        toPlaceID: destinationPlaceID,
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
    const tupleSet = new Set<string>();

    const results: DistanceResult[] = [];
    let isAllCampusBuildingsAppended = false;
  
    for (let i = 0; i < locations.length; i++) {
      for (let j = 0; j < locations.length; j++) {

        let pairTuple: Tuple = [locations[i].location, locations[j].location];

        if (i !== j && !hasTuple(pairTuple, tupleSet)) {

          const origin = locations[i].location;
          const originPlaceID = locations[i].locationPlaceID;
          const destination = locations[j].location;
          const destinationPlaceID = locations[j].locationPlaceID;
          
          if (destinationPlaceID.trim() === "" || originPlaceID.trim() === "" && isAllCampusBuildingsAppended === false) {
            console.warn(`Skipping distance calculation from ${origin} to ${destination} due to missing place's ID.`);
            isAllCampusBuildingsAppended = true;

          } else {
            try {
              const distanceResult = await getDistanceAndDuration(origin, originPlaceID, destination, destinationPlaceID);
              if (distanceResult !== null) {  
                results.push(distanceResult);
                addTuple(pairTuple, tupleSet);
              } else {
                console.warn(`No distance result found from ${origin} to ${destination}.`);
              }
            } catch (error) {
              console.error(`Error (${origin} → ${destination}): ${error}`);
            }
          }
        }
      }
    }
    return results;
  };