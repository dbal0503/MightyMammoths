export function getBuildingAddress(abbreviation: string): string {
  const mapping: { [key: string]: string } = {
    EV: "Concordia University, EV Building, Montreal, QC",
    Hall: "Concordia University, Hall Building, Montreal, QC",
    JMSB: "Concordia University, John Molson School of Business, Montreal, QC",
    "CL Building": "Concordia University, CL Building, Montreal, QC",
    "Learning Square": "Concordia University, Learning Square, Montreal, QC",
    "Smith Building":
      "Concordia University Smith Building, Loyola Campus, Montreal, QC, Canada",
    "Hingston Hall":
      "Concordia University, Hingston Hall, Montreal, QC, Canada",
  };

  return mapping[abbreviation] || abbreviation;
}

// Determine the closest building for start location

export interface Building {
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export const buildingCoordinates: Building[] = [
  {
    name: "EV",
    address: "Concordia University, EV Building, Montreal, QC, Canada",
    coordinates: { latitude: 45.49465577566852, longitude: -73.57763385380554 },
  },
  {
    name: "Hall",
    address: "Concordia University, Hall Building, Montreal, QC, Canada",
    coordinates: { latitude: 45.493227, longitude: -73.575118 }, // Example coordinates; adjust as needed.
  },
  {
    name: "JMSB",
    address:
      "Concordia University, John Molson School of Business, Montreal, QC, Canada",
    coordinates: { latitude: 45.492345, longitude: -73.576456 }, // Example
  },
  {
    name: "CL Building",
    address: "Concordia University, CL Building, Montreal, QC, Canada",
    coordinates: { latitude: 45.49, longitude: -73.577 }, // Example
  },
  {
    name: "Learning Square",
    address: "Concordia University, Learning Square, Montreal, QC, Canada",
    coordinates: { latitude: 45.491234, longitude: -73.578765 }, // Example
  },
  {
    name: "Smith Building",
    address:
      "Concordia University Smith Building, Loyola Campus, Montreal, QC, Canada",
    coordinates: { latitude: 45.456789, longitude: -73.640123 }, // Example
  },
  {
    name: "Hingston Hall",
    address: "Concordia University, Hingston Hall, Montreal, QC, Canada",
    coordinates: { latitude: 45.492111, longitude: -73.576222 }, // Example
  },
];

function getDistance(
  loc1: { latitude: number; longitude: number },
  loc2: { latitude: number; longitude: number }
): number {
  const R = 6371e3; // Earth's radius in meters
  const lat1 = loc1.latitude * (Math.PI / 180);
  const lat2 = loc2.latitude * (Math.PI / 180);
  const deltaLat = (loc2.latitude - loc1.latitude) * (Math.PI / 180);
  const deltaLon = (loc2.longitude - loc1.longitude) * (Math.PI / 180);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

export function getClosestBuilding(currentLocation: {
  latitude: number;
  longitude: number;
}): Building | null {
  if (!currentLocation) return null;
  let closest: Building | null = null;
  let minDistance = Infinity;
  for (const building of buildingCoordinates) {
    const d = getDistance(currentLocation, building.coordinates);
    if (d < minDistance) {
      minDistance = d;
      closest = building;
    }
  }
  return closest;
}
