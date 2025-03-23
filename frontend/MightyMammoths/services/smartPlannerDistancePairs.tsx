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
  
    const originParam = originPlaceID.trim() ? `place_id:${originPlaceID}` : origin;
    const destinationParam = destinationPlaceID.trim() ? `place_id:${destinationPlaceID}` : destination;

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


  export const calculateAllCampusPairsDistances = async (): Promise<DistanceResult[]> => {
    // Assuming each building in campusBuildingCoords has "buildingName" and "placeID" properties.
    const campusData = campusBuildingCoords as CampusBuildingCollection;
    const campusBuildings = campusData.features.map((feature) => ({
      buildingName: feature.properties.BuildingName,
      placeID: feature.properties.PlaceID,
    }));
    let count = 0;
  
    for (let i = 0; i < campusBuildings.length; i++) {
      for (let j = 0; j < campusBuildings.length; j++) {
        //if (count >= 5) {
        //  break;
        //}
        if (i !== j) {
          const buildingA = campusBuildings[i];
          const buildingB = campusBuildings[j];
  
          const pairTuple: Tuple = [buildingA.buildingName, buildingB.buildingName];
  
          if (!hasTuple(pairTuple, buildingSet)) {
            try {
              const distanceResult = await getDistanceAndDuration(
                buildingA.buildingName,
                buildingA.placeID,
                buildingB.buildingName,
                buildingB.placeID
              );
  
              if (distanceResult !== null) {
                buildingResults.push(distanceResult);
                addTuple(pairTuple, buildingSet);
                count++;
                console.log(`Origin: ${buildingA.buildingName}, Destination: ${buildingB.buildingName}`);
              } else {
                console.warn(`No distance result for ${buildingA.buildingName} → ${buildingB.buildingName}`);
              }
            } catch (error) {
              console.error(`Error processing ${buildingA.buildingName} → ${buildingB.buildingName}: ${error}`);
            }
          }
        }
      }
    }
    console.log('Building Set:', buildingSet);
    console.log("Distance Results:", buildingResults);
    try {
      await FileSystem.writeAsStringAsync(
        FileSystem.documentDirectory + "buildingSet.json",
        JSON.stringify(Array.from(buildingSet), null, 2)
      );
      await FileSystem.writeAsStringAsync(
        FileSystem.documentDirectory + "buildingResults.json",
        JSON.stringify(buildingResults, null, 2)
      );
      console.log("Files saved to:", FileSystem.documentDirectory);
    } catch (e) {
      console.error("Error saving files:", e);
    }
    return buildingResults;
  };

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
  