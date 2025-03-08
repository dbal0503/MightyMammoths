import axios from "axios";
import { RouteData } from "@/services/directionsService";
import { findNextBusTime } from "@/utils/getNextShuttleBus";

export async function getShuttleBusRoute(
    origin: string,
    destination: string,
    direction: string
  ): Promise<RouteData[]> {
  
    let pickupLocation = "";
    if (direction === "SGW") {
        pickupLocation = "45.497163,-73.578535";
    }else if (direction === "LOY") {
        pickupLocation = "45.458424,-73.638369";
    }
  
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  
    try {
      // ─── STEP 1: WALKING LEG (Origin -> Pickup Location) ───────────────────────
      const walkingUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(pickupLocation)}&mode=walking&key=${apiKey}`;
  
      const walkingResponse = await axios.get<{ routes: any[] }>(walkingUrl);
      const walkingRoutes = walkingResponse.data.routes;
      if (walkingRoutes.length === 0) {
        return [];
      }
      const walkingRoute = walkingRoutes[0];
      const walkingLeg = walkingRoute.legs[0];
      const walkingDurationSeconds = walkingLeg.duration.value;
      const walkingDurationText = walkingLeg.duration.text;
      const walkingDistanceMeters: number = walkingLeg.distance.value;
      const walkingDistanceKm: number = walkingDistanceMeters / 1000;
      const walkingDistanceText: string = `${walkingDistanceKm.toFixed(2)} km`;
      const walkingPolyline = walkingRoute.overview_polyline.points;
      const walkingSteps = walkingLeg.steps;
  
      // Calculate arrival time at the pickup location.
      const now = new Date();
      const arrivalTime = new Date(now.getTime() + walkingDurationSeconds * 1000);
      const arrivalHours = arrivalTime.getHours().toString().padStart(2, "0");
      const arrivalMinutes = arrivalTime.getMinutes().toString().padStart(2, "0");
      const formattedArrivalTime = `${arrivalHours}:${arrivalMinutes}`;
  
      // Determine the current day (e.g., "Monday") for schedule lookup.
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const currentDay = dayNames[now.getDay()];
  
      // Lookup the next bus departure time using your helper.
      const nextBusTime = findNextBusTime(currentDay, direction, formattedArrivalTime);

      if (nextBusTime === "No more buses today" || nextBusTime === null) {
        return [];
      }

      let waitingTimeMinutes = 0;
      if (nextBusTime && nextBusTime !== "No more buses today") {
        const [busHours, busMinutes] = nextBusTime.split(":").map(Number);
        const busTimeInMinutes = busHours * 60 + busMinutes;
        const [arrivalH, arrivalM] = formattedArrivalTime.split(":").map(Number);
        const arrivalTimeInMinutes = arrivalH * 60 + arrivalM;
        waitingTimeMinutes = busTimeInMinutes - arrivalTimeInMinutes;

        if (waitingTimeMinutes < 0) waitingTimeMinutes = 0;
      }

      // ─── STEP 2: BUS SHUTTLE LEG (Pickup Location -> Destination) ────────────────
      const busUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
        pickupLocation
      )}&destination=${encodeURIComponent(destination)}&mode=driving&key=${apiKey}`;
  
      const busResponse = await axios.get<{ routes: any[] }>(busUrl);
      const busRoutes = busResponse.data.routes;
      if (busRoutes.length === 0) {
        return [];
      }
      const busRoute = busRoutes[0];
      const busLeg = busRoute.legs[0];
      const busDurationSeconds = busLeg.duration.value;
      const busDurationText = busLeg.duration.text;
      const busDistanceMeters: number = busLeg.distance.value;
      const busDistanceKm: number = busDistanceMeters / 1000;
      const busDistanceText: string = `${busDistanceKm.toFixed(2)} km`;
      const busPolyline = busRoute.overview_polyline.points;
      const busSteps = busLeg.steps;
    
        // ─── STEP 3: WALKING LEG (Dropoff Location -> Destination) ───────────────────
      let dropOffLocation = "";
      if (direction === "SGW") {
        dropOffLocation = "45.458424,-73.638369";
      }else  {
        dropOffLocation = "45.497163,-73.578535";
      }
        
        const walkingUrlDropOff = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
            dropOffLocation
          )}&destination=${encodeURIComponent(destination)}&mode=walking&key=${apiKey}`;
      
          const walkingResponseDropOff = await axios.get<{ routes: any[] }>(walkingUrlDropOff);
          const walkingRoutesDropOff = walkingResponseDropOff.data.routes;
          if (walkingRoutesDropOff.length === 0) {
            return [];
          }
          const walkingRouteDropOff = walkingRoutesDropOff[0];
          const walkingLegDropOff = walkingRouteDropOff.legs[0];
          const walkingDurationSecondsDropOff = walkingLegDropOff.duration.value;
          const walkingDurationTextDropOff = walkingLegDropOff.duration.text;
          const walkingDistanceMetersDropOff: number = walkingLegDropOff.distance.value;
          const walkingDistanceKmDropOff: number = walkingDistanceMetersDropOff / 1000;
          const walkingDistanceTextDropOff: string = `${walkingDistanceKmDropOff.toFixed(2)} km`;
          const walkingPolylineDropOff = walkingRouteDropOff.overview_polyline.points;
          const walkingStepsDropOff = walkingLegDropOff.steps;
  
      // ─── STEP 4: COMBINE THE INFORMATION ─────────────────────────────────────────
      // Compute total duration (walking + waiting + bus + walking) in minutes.
      const totalDurationMinutes =
        Math.ceil(walkingDurationSeconds / 60) + waitingTimeMinutes + Math.ceil(busDurationSeconds / 60) + Math.ceil(walkingDurationSecondsDropOff / 60);
      const totalDurationText = `${totalDurationMinutes} mins`;

      const totalDistanceKm: number = walkingDistanceKm + busDistanceKm + walkingDistanceKmDropOff;
      const totalDistanceText: string = `${totalDistanceKm.toFixed(2)} km`;

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
        {
          mode: "WALKING",
          polyline: walkingPolylineDropOff,
          duration: walkingDurationTextDropOff,
          distance: walkingDistanceTextDropOff,
          instructions: `Walk from shuttle drop-off at ${dropOffLocation} to ${destination}`,
          steps: walkingStepsDropOff,
        },
      ];
  
      const shuttleRoute: RouteData = {
        polyline: combinedPolyline,
        duration: totalDurationText,
        distance: totalDistanceText, // or sum numeric values if needed
        steps: combinedSteps,
      };
      return [shuttleRoute];
    } catch (error) {
      console.error("Error fetching shuttle bus route", error);
      return [];
    }
  }
