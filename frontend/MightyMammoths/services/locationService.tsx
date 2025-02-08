import * as Location from "expo-location";

export async function subscribeToLocationUpdates(
  callback: (coords: { latitude: number; longitude: number }) => void
) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permission to access location was denied");
  }
  const subscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Highest,
      timeInterval: 3000, // Update every 3 seconds
      distanceInterval: 1, // Update every 1 meter
    },
    (location) => {
      callback(location.coords);
    }
  );
  return subscription;
}
