import hallBuildingRooms from '../assets/hall-building-rooms.json';

export interface RoomInfo {
  roomNumber: string;
  encodedId: string;
  floor: string;
}

/**
 * Get room information by room number
 * @param roomNumber The room number to search for
 * @returns Room information if found, undefined otherwise
 */
export const getRoomInfoByNumber = (roomNumber: string): RoomInfo | undefined => {
  // Normalize the room number (remove leading 'H-' if present)
  const normalizedRoomNumber = roomNumber.replace(/^H-/i, '');
  
  return hallBuildingRooms.rooms.find(
    (room) => room.roomNumber === normalizedRoomNumber
  );
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
 * Check if a room number is valid in Hall Building
 * @param roomNumber The room number to check
 * @returns True if the room exists, false otherwise
 */
export const isValidHallBuildingRoom = (roomNumber: string): boolean => {
  return getRoomInfoByNumber(roomNumber) !== undefined;
}; 