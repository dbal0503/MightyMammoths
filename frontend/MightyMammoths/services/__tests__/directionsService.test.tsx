import axios from "axios";
import { getRoutes, RouteData } from "../directionsService";

/*
Test Case -> What It Ensures
- Fetch route data successfully -> Function parses API response correctly, returns expected format
- Handles API errors gracefully -> Throws error when API fails
- Encodes URL parameters properly ->Avoids API errors from bad URLs
*/ 

// Mock axios to prevent real API calls
jest.mock("axios");

describe("getRoutes", () => {
  const mockResponse = {
    data: {
      routes: [
        {
          overview_polyline: { points: "mocked_polyline" },
          legs: [
            {
              duration: { text: "15 mins" },
              distance: { text: "5 km" },
              steps: [{ instruction: "Turn left on Main St." }],
            },
          ],
        },
      ],
    },
  };

  it("should fetch route data successfully", async () => {
    // Mock axios response
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue(mockResponse);

    const origin = "Montreal";
    const destination = "Toronto";
    const mode = "driving";

    const result: RouteData[] = await getRoutes(origin, destination, mode);

    expect(result).toEqual([
      {
        polyline: "mocked_polyline",
        duration: "15 mins",
        distance: "5 km",
        steps: [{ instruction: "Turn left on Main St." }],
      },
    ]);

    // Ensure axios was called with the correct URL
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
          origin
        )}&destination=${encodeURIComponent(
          destination
        )}&mode=driving&alternatives=true&key=`
      )
    );
  });

  it("should handle API errors", async () => {
    (axios.get as jest.MockedFunction<typeof axios.get>).mockRejectedValue(new Error("API Error"));

    await expect(getRoutes("Montreal", "Toronto", "driving")).rejects.toThrow("API Error");
  });

  it("should correctly encode URL parameters", async () => {
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue(mockResponse);

    const origin = "New York, NY";
    const destination = "Los Angeles, CA";
    const mode = "walking";

    await getRoutes(origin, destination, mode);

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(
        `origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=walking`
      )
    );
  });
});
