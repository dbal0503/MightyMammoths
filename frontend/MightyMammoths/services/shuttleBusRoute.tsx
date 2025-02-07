//import { GOOGLE_MAPS_API_KEY } from "@env";
import axios from "axios";
import { RouteData } from "@/services/directionsService";
import { findNextBusTime } from "@/utils/getNextShuttleBus";

export async function getShuttleBusRoute(
    origin: string,
    destination: string,
    direction: string
  ): Promise<RouteData[]> {

    // If no valid shuttle direction was set
    if (!direction) {
      return [];
    }
  
    let pickupLocation = "";
    if (direction === "SGW") {
        pickupLocation = "1455 De Maisonneuve Blvd W, Montreal, QC H3G 1M8";
    }else if (direction === "LOY") {
        pickupLocation = "7141 Sherbrooke St W, Montreal, QC H4B 1R6";
    }
  
    //const apiKey = GOOGLE_MAPS_API_KEY;
    const apiKey = ""
  
    try {
      // ─── STEP 1: WALKING LEG (Origin -> Pickup Location) ───────────────────────
      console.log("Step 1")
      const walkingUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(pickupLocation)}&mode=walking&key=${apiKey}`;
      console.log("Origin:", origin)
      console.log("Pickup Location:", pickupLocation)
  
      const walkingResponse = await axios.get<{ routes: any[] }>(walkingUrl);
      const walkingRoutes = walkingResponse.data.routes;
      if (walkingRoutes.length === 0) {
        throw new Error("No walking route found");
      }
      const walkingRoute = walkingRoutes[0];
      const walkingLeg = walkingRoute.legs[0];
      const walkingDurationSeconds = walkingLeg.duration.value;
      const walkingDurationText = walkingLeg.duration.text;
      const walkingDistanceText = walkingLeg.distance.text;
      const walkingPolyline = walkingRoute.overview_polyline.points;
      const walkingSteps = walkingLeg.steps;
      console.log("Walking text:", walkingDurationText)
      console.log("Walking polyline:", walkingPolyline)
  
      // Calculate arrival time at the pickup location.
      const now = new Date();
      const arrivalTime = new Date(now.getTime() + walkingDurationSeconds * 1000);
      const arrivalHours = arrivalTime.getHours().toString().padStart(2, "0");
      const arrivalMinutes = arrivalTime.getMinutes().toString().padStart(2, "0");
      const formattedArrivalTime = `${arrivalHours}:${arrivalMinutes}`;
      console.log("Arrival time:", formattedArrivalTime)
  
      // Determine the current day (e.g., "Monday") for schedule lookup.
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const currentDay = dayNames[now.getDay()];
  
      // Lookup the next bus departure time using your helper.
      const nextBusTime = findNextBusTime(currentDay, direction, formattedArrivalTime);
      console.log("Next bus time:", nextBusTime)
      let waitingTimeMinutes = 0;
      if (nextBusTime && nextBusTime !== "No more buses today") {
        const [busHours, busMinutes] = nextBusTime.split(":").map(Number);
        const busTimeInMinutes = busHours * 60 + busMinutes;
        const [arrivalH, arrivalM] = formattedArrivalTime.split(":").map(Number);
        const arrivalTimeInMinutes = arrivalH * 60 + arrivalM;
        waitingTimeMinutes = busTimeInMinutes - arrivalTimeInMinutes;
        if (waitingTimeMinutes < 0) waitingTimeMinutes = 0;
      }
      console.log("Step 2")
      // ─── STEP 2: BUS SHUTTLE LEG (Pickup Location -> Destination) ────────────────
      const busUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
        pickupLocation
      )}&destination=${encodeURIComponent(destination)}&mode=driving&key=${apiKey}`;
  
      const busResponse = await axios.get<{ routes: any[] }>(busUrl);
      const busRoutes = busResponse.data.routes;
      if (busRoutes.length === 0) {
        throw new Error("No bus route found");
      }
      const busRoute = busRoutes[0];
      const busLeg = busRoute.legs[0];
      const busDurationSeconds = busLeg.duration.value;
      const busDurationText = busLeg.duration.text;
      const busDistanceText = busLeg.distance.text;
      const busPolyline = busRoute.overview_polyline.points;
      const busSteps = busLeg.steps;
      console.log("Bus text:", busDurationText)
      console.log("Bus polyline:", busPolyline)
  
      // ─── STEP 3: COMBINE THE INFORMATION ─────────────────────────────────────────
      // Compute total duration (walking + waiting + bus) in minutes.
      console.log("Step 3")
      const totalDurationMinutes =
        Math.ceil(walkingDurationSeconds / 60) + waitingTimeMinutes + Math.ceil(busDurationSeconds / 60);
      const totalDurationText = `${totalDurationMinutes} mins`;
      console.log("Total duration:", totalDurationText)
      
      //TODO To combine the polyline, we need to decode both the walking and bus polylines,
      //TODO merge te coordinates arrays and then re-encode them

      const combinedPolyline = "";
  
      // Build a steps array that includes each step
      const combinedSteps = [
        {
          mode: "WALKING",
          polyline: walkingPolyline,
          duration: walkingDurationText,
          distance: walkingDistanceText,
          instructions: `Walk from ${origin} to shuttle pickup at ${pickupLocation}`,
          steps: walkingSteps,
        },
        {
          mode: "WAITING",
          polyline: null, // No polyline since user just waiting
          duration: waitingTimeMinutes > 0 ? `${waitingTimeMinutes} mins` : "0 mins",
          distance: "N/A",
          instructions: `Wait at ${pickupLocation} until shuttle departs (${nextBusTime})`,
        },
        {
          mode: "BUS",
          polyline: busPolyline,
          duration: busDurationText,
          distance: busDistanceText,
          instructions: `Take the shuttle from ${pickupLocation} to ${destination}`,
          steps: busSteps,
        },
      ];
      console.log("Combined steps:", combinedSteps)
  
      const shuttleRoute: RouteData = {
        polyline: combinedPolyline,
        duration: totalDurationText,
        distance: `${walkingDistanceText} + ${busDistanceText}`, // or sum numeric values if needed
        steps: combinedSteps,
      };
      console.log("Shuttle route:", shuttleRoute)
  
      return [shuttleRoute];
    } catch (error) {
      console.error("Error fetching shuttle bus route", error);
      throw error;
    }
  }