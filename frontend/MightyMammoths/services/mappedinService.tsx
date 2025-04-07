// Define types to match our usage without needing the actual SDK
export interface MappedinLocation {
  id: string;
  name: string;
  type: string;
}

export interface MappedinData {
  locations: MappedinLocation[];
  getDirections: (from: MappedinLocation, to: MappedinLocation) => any;
}

export interface Position {
  lat: number;
  lng: number;
}

export interface Polygon {
  points: Position[];
}

// Cache for map data
let mapDataCache: Record<string, MappedinData> = {};

// Building IDs mapping
const BUILDING_MAP_IDS: Record<string, string> = {
  "SGW": "677d8a736e2f5c000b8f3fa6",
  "LOY": "67f019943060f8000b749624",
  // Add other buildings here
};

/**
 * Gets the map ID for a building
 */
export function getMapId(campusName: string): string | null {
  return BUILDING_MAP_IDS[campusName] || null;
}

/**
 * Stub for fetching map data that returns a mock object
 * This is used because we're no longer using the actual SDK
 */
export async function fetchMapData(buildingName: string): Promise<MappedinData | null> {
  try {
    const mapId = BUILDING_MAP_IDS[buildingName];
    if (!mapId) {
      console.error(`No map ID found for building: ${buildingName}`);
      return null;
    }

    // Check cache first
    if (mapDataCache[mapId]) {
      return mapDataCache[mapId];
    }

    // Create a mock object rather than calling the actual SDK
    const mockData: MappedinData = {
      locations: [
        // Mock locations for the building
        { id: "entrance-main", name: "Main Entrance", type: "Entrance" },
        { id: "entrance-side", name: "Side Entrance", type: "Entrance" },
        { id: "h920", name: "H920", type: "Room" },
        { id: "h817", name: "H817", type: "Room" },
        { id: "h651", name: "H651", type: "Room" },
      ],
      getDirections: () => null,
    };

    // Cache the result
    mapDataCache[mapId] = mockData;
    return mockData;
  } catch (error) {
    console.error('Error creating mock Mappedin data:', error);
    return null;
  }
}

/**
 * Gets all locations in a building
 */
export async function getLocations(buildingName: string): Promise<MappedinLocation[]> {
  try {
    const mapData = await fetchMapData(buildingName);
    if (!mapData) return [];
    
    return mapData.locations;
  } catch (error) {
    console.error('Error getting locations:', error);
    return [];
  }
}

/**
 * Gets all entrances for a building
 */
export async function getEntrances(buildingName: string): Promise<MappedinLocation[]> {
  try {
    const locations = await getLocations(buildingName);
    return locations.filter(location => location.type === 'Entrance');
  } catch (error) {
    console.error('Error getting entrances:', error);
    return [];
  }
}

/**
 * Gets a specific room by number
 */
export async function getRoom(buildingName: string, roomNumber: string): Promise<MappedinLocation | null> {
  try {
    const locations = await getLocations(buildingName);
    return locations.find(location => 
      location.name.includes(`${roomNumber}`) || 
      location.id.includes(`${roomNumber}`)
    ) || null;
  } catch (error) {
    console.error(`Error getting room ${roomNumber}:`, error);
    return null;
  }
}

/**
 * Gets the nearest entrance to a user's position
 */
export async function getNearestEntrance(
  buildingName: string, 
  userPosition: { latitude: number; longitude: number }
): Promise<MappedinLocation | null> {
  try {
    const entrances = await getEntrances(buildingName);
    if (entrances.length === 0) return null;
    
    // For now, return the first entrance
    // In the future, implement actual distance calculation
    return entrances[0];
  } catch (error) {
    console.error('Error finding nearest entrance:', error);
    return null;
  }
}

/**
 * Generates directions between two locations
 */
export async function getDirections(
  buildingName: string,
  fromId: string,
  toId: string
): Promise<any | null> {
  try {
    const mapData = await fetchMapData(buildingName);
    if (!mapData) return null;
    
    const from = mapData.locations.find((loc: { id: string; }) => loc.id === fromId);
    const to = mapData.locations.find((loc: { id: string; }) => loc.id === toId);
    
    if (!from || !to) {
      console.warn('Could not find specified locations for directions');
      return null;
    }
    
    return mapData.getDirections(from, to);
  } catch (error) {
    console.error('Error getting directions:', error);
    return null;
  }
}