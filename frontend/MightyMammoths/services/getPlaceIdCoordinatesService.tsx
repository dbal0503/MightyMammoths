import axios from 'axios';

export async function getPlaceIdCoordinates(placeId: string){
    const match = placeId.match(/place_id:(.*)/);
    const cleanedPlaceId = match ? match[1].trim() : placeId.trim();
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    const url = "https://maps.googleapis.com/maps/api/place/details/json";
    try {
        const response = await axios.get(url, {
          params: {
            place_id: cleanedPlaceId,
            key: apiKey,
          },
        });
        
        if (response.data.status === "OK") {
          const { lat, lng } = response.data.result.geometry.location;
          return { latitude: lat, longitude: lng };
        } else {
          throw new Error(response.data.error_message || "Error fetching place details");
        }
      } catch (error) {
        console.error("Error getting coordinates:", error);
        throw error;
      }
}