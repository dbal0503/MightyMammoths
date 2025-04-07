import hallBuildingRooms from '../assets/hall-building-rooms.json';
import vlBuildingRooms from '../assets/loyolaBuildingRooms.json';
import campusBuildingInfo from '../assets/buildings/coordinates/campusbuildingcoords.json';

export interface RoomInfo {
  roomNumber: string;
  encodedId: string;
  floor: string;
}

/**
 * Get room information by room number
 * @param roomNumber The room number to search for
 * @returns Room information or undefined if not found
 */
export const getBuildingNameByRoomNumber = (roomNumber: string): string => {
  if (hallBuildingRooms.rooms.find(room => room.roomNumber === roomNumber) !== null) {
    return 'H';
  } else if (vlBuildingRooms.rooms.find(room => room.roomNumber === roomNumber) !== null) {
    return 'VL';
  }
  return '';
};

export const getRoomInfoByNumber = (roomNumber: string, campus:string): RoomInfo | undefined => {
  try {
    // Normalize the room number by removing "H-" prefix if present
    const normalizedRoomNumber = roomNumber.replace(/^H-/i, '');
    if (campus === 'LOY') {
      return vlBuildingRooms.rooms.find(
        (room) => room.roomNumber === normalizedRoomNumber
      );
    }
    if (campus === 'SGW') {
      return hallBuildingRooms.rooms.find(
        (room) => room.roomNumber === normalizedRoomNumber
      );
    }
  } catch (error) {
    console.error("Error getting room info:", error);
    return undefined;
  }
};

/**
 * Get all floor IDs from Hall Building
 * @returns Array of unique floor IDs
 */
export const getHallBuildingFloors = (): string[] => {
  const floorSet = new Set<string>();
  
  hallBuildingRooms.rooms.forEach((room) => {
    floorSet.add(room.floor);
  });
  
  return Array.from(floorSet);
};

/**
 * Get all rooms on a specific floor
 * @param floorId The floor ID to filter by
 * @returns Array of rooms on the specified floor
 */
export const getRoomsByFloor = (floorId: string): RoomInfo[] => {
  return hallBuildingRooms.rooms.filter((room) => room.floor === floorId);
};

/**
 * Get the floor name based on the floor ID
 * @param floorId The floor ID
 * @returns The floor name (e.g., "1st Floor", "8th Floor")
 */
export const getFloorName = (floorId: string): string => {
  // Map floor IDs to floor names
  const floorMap: Record<string, string> = {
    'm_2b2365d2f44ba4a0': '1st Floor',
    'm_f06f42e4dd43b7a3': '2nd Floor',
    'm_0eb314b313d85ced': '8th Floor'
  };
  
  return floorMap[floorId] || 'Unknown Floor';
};

/**
 * Generate a Mappedin URL for indoor navigation to a specific room
 * @param roomId The encoded room ID
 * @param floorId The floor ID
 * @returns A complete Mappedin URL for navigation
 */
export const getMappedinUrl = (roomId: string, floorId: string): string => {
  // Base map ID for Hall Building
  const mapId = "677d8a736e2f5c000b8f3fa6";
  
  // Default entrance IDs - these are the IDs for all possible entrances
  const entranceIdsList = [
    "e_a6d56acd8c7128f9", "e_49ea4cec0d60fc53", "e_823c13b48c7d7535", 
    "e_766d70498983ac55", "e_4ada9ddb34466065", "e_2bac326896ceb47c", 
    "e_b0b0fdb3f80b8d3b", "e_d6c18d77bf0edd71", "e_c4b0c10524716958", 
    "e_8c0d903a739d8b4c", "e_ac9c98cd67f127b0", "e_77086adeb3630af8", 
    "e_6837c7ba1963b2e0", "e_2d2b69303c8da8a8", "e_ed4cf2425c3acb41", 
    "e_68407775901d72b7", "e_7d7a551d207d7ff7", "e_5ba356e194baf98c", 
    "e_f6c4cd06031bfcc4", "e_49bbdf7d3822b2f0", "e_55b8bca4c727d96d", 
    "e_2fff074511aa43da", "e_ec733df862eeed50", "e_1f81e73cf49ef139", 
    "e_a835788d35cf96cb"
  ];
  
  const entrances = entranceIdsList.join('+');
  
  // Return the complete URL for directions to the room from all entrances
  return `https://app.mappedin.com/map/${mapId}/directions?location=${roomId}&departure=${entrances}&floor=${floorId}`;
};

/**
 * Check if a room number is valid in Hall Building
 * @param roomNumber The room number to check
 * @returns True if the room exists, false otherwise
 */
// export const isValidHallBuildingRoom = (roomNumber: string): boolean => {
//   return getRoomInfoByNumber(roomNumber) !== undefined;
// }; 

export function findBuildingCampus(destination?: string | null): string {
  if (!destination) {
    return '';
  }
  const building = (campusBuildingInfo as BuildingList).features.find((feature: BuildingFeature) => {
    return feature.properties.Building.toLowerCase() === destination.toLowerCase();
  });

  if (building) {
    return building.properties.Campus;
  }
  return '';
}

export function isValidRoom(roomNumber: string, destinationCampus:string): boolean {
  if (destinationCampus === 'LOY') {
    return vlBuildingRooms.rooms.some((room: RoomInfo) => room.roomNumber === roomNumber);
  } else if (destinationCampus === 'SGW') {
    return hallBuildingRooms.rooms.some((room: RoomInfo) => room.roomNumber === roomNumber);
  }
  return false;
}

export interface BuildingProperties {
  Campus: string;
  Building: string;
  BuildingName: string;
  "Building Long Name": string;
  Address: string;
  PlaceID: string;
  Latitude: number;
  Longitude: number;
}

export interface BuildingFeature {
  type: string;
  properties: BuildingProperties;
  geometry: {
    type: string;
    coordinates: number[];
  };
}

export interface BuildingList {
  type: string;
  name: string;
  features: BuildingFeature[];
}

export const getFloorIdbyRoomID = (roomId: string): string => {
  if (hallBuildingRooms.rooms.find(room => room.encodedId === roomId) !== null) {
    return hallBuildingRooms.rooms.find(room => room.encodedId === roomId)?.floor || '';
  } else if (vlBuildingRooms.rooms.find(room => room.encodedId === roomId) !== null) {
    return vlBuildingRooms.rooms.find(room => room.encodedId === roomId)?.floor || '';
  }
  return '';
};

export const getRoomInfoByNumberString = (roomNumber: string, campus:string): string => {
  try {
    // Normalize the room number by removing "H-" prefix if present
    const normalizedRoomNumber = roomNumber.replace(/^H-/i, '');
    if (campus === 'LOY') {
      return vlBuildingRooms.rooms.find(
        (room) => room.roomNumber === normalizedRoomNumber
      )?.encodedId || '';
    }
    if (campus === 'SGW') {
    
    return hallBuildingRooms.rooms.find(
      (room) => room.roomNumber === normalizedRoomNumber
    )?.encodedId || '';}
  } catch (error) {
    console.error("Error getting room info:", error);
    return '';
  }
  return '';
};