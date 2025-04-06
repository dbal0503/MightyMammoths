import data from "./hallRoomMapping.json";

interface Room {
  roomNumber: string;
  encodedId: string;
  floor: string;
}

interface RoomsData {
  rooms: Room[];
}

const roomsData: RoomsData = {
  rooms: data.rooms,
};

/**
 * Find a room by its room number
 * @param roomNumber The room number to search for
 * @returns The room object if found, undefined otherwise
 */
export const findRoomByNumber = (roomNumber: string): Room | undefined => {
  return roomsData.rooms.find((room) => room.roomNumber === roomNumber);
};

/**
 * Get the encoded ID for a room by its room number
 * @param roomNumber The room number to search for
 * @returns The encoded ID if found, undefined otherwise
 */
export const getRoomEncodedId = (roomNumber: string): string | undefined => {
  const room = findRoomByNumber(roomNumber);
  return room?.encodedId;
};

/**
 * Get the floor for a room by its room number
 * @param roomNumber The room number to search for
 * @returns The floor if found, undefined otherwise
 */
export const getRoomFloor = (roomNumber: string): string | undefined => {
  const room = findRoomByNumber(roomNumber);
  return room?.floor;
};
