//import { GOOGLE_MAPS_API_KEY } from "@env";
import axios from "axios";
import { RouteData } from "@/services/directionsService";
import { findNextBusTime } from "@/utils/getNextShuttleBus";

export async function getShuttleBusRoute(
  origin: string,
  destination: string,
  direction: string
): Promise<RouteData[]> {
  // if not traveling to a different campus, then return empty array
  if (!direction) {
    return [];
  }


  let pickupLocation = "";
  if (direction === "SGW") {
    pickupLocation = "Loyola Chapel, 7137 Sherbrooke St. W.";
  }else{
    pickupLocation = "Henry F. Hall Building front doors, 1455 De Maisonneuve Blvd. W.";
  }

  // Call Google Directions API to get the walking route from the origin to the pickup location.
  //const apiKey = GOOGLE_MAPS_API_KEY;
  const apiKey = ""
  const walkingUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
    origin
  )}&destination=${encodeURIComponent(pickupLocation)}&mode=walking&key=${apiKey}`;

  try {
    const response = await axios.get<{ routes: any[] }>(walkingUrl);
    const routes = response.data.routes;
    if (routes.length === 0) {
      throw new Error("No walking route found");
    }
    const walkingRoute = routes[0]; // choose the first route
    const leg = walkingRoute.legs[0];

    // Extract walking details.
    const walkingDurationText = leg.duration.text; // e.g., "12 mins"
    const walkingDurationSeconds = leg.duration.value; // in seconds
    const walkingDistanceText = leg.distance.text;
    const polyline = walkingRoute.overview_polyline.points;
    const steps = leg.steps;

    // Compute expected arrival time at the bus pickup location.
    const now = new Date();
    const arrivalTime = new Date(now.getTime() + walkingDurationSeconds * 1000);
    const hours = arrivalTime.getHours().toString().padStart(2, "0");
    const minutes = arrivalTime.getMinutes().toString().padStart(2, "0");
    const formattedArrivalTime = `${hours}:${minutes}`;

    // Get the current day
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = dayNames[now.getDay()];

    // Look up the next bus time
    const nextBusTime = findNextBusTime(dayOfWeek, direction, formattedArrivalTime);

    // Compute waiting time in minutes (if a valid next bus was found).
    let waitingTimeMinutes = 0;
    if (nextBusTime && nextBusTime !== "No more buses today") {
      const [busHours, busMinutes] = nextBusTime.split(":").map(Number);
      const busTimeInMinutes = busHours * 60 + busMinutes;
      const [arrivalHours, arrivalMinutes] = formattedArrivalTime.split(":").map(Number);
      const arrivalTimeInMinutes = arrivalHours * 60 + arrivalMinutes;
      waitingTimeMinutes = busTimeInMinutes - arrivalTimeInMinutes;
      if (waitingTimeMinutes < 0) {
        waitingTimeMinutes = 0;
      }
    }

    // Create a combined duration value (walking plus waiting)
    const totalDurationMinutes = Math.ceil(walkingDurationSeconds / 60) + waitingTimeMinutes;
    const combinedDurationText = `${totalDurationMinutes} mins`;

    // Append a “waiting” step to the walking steps.
    const updatedSteps = [
      ...steps,
      {
        // Using the same field names as returned by the Directions API.
        html_instructions: `Wait at ${pickupLocation}. Next shuttle: ${nextBusTime}`,
        travel_mode: "TRANSIT",
        duration: { text: waitingTimeMinutes > 0 ? `${waitingTimeMinutes} mins` : "0 mins" },
        distance: { text: "N/A" },
      },
    ];

    const shuttleRoute: RouteData = {
      polyline, // the walking polyline (you might later want to combine this with a bus leg)
      duration: combinedDurationText,
      distance: walkingDistanceText,
      steps: updatedSteps,
    };

    return [shuttleRoute];
  } catch (error) {
    console.error("Error fetching shuttle bus route", error);
    throw error;
  }
}
