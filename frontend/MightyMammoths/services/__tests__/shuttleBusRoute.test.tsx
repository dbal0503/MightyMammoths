import axios from "axios";
import { getShuttleBusRoute } from "../shuttleBusRoute";
import { RouteData } from "../directionsService";
import { findNextBusTime } from "@/utils/getNextShuttleBus";

/*
Test Case -> What It Ensures
- Fetch shuttle route data successfully	-> API responses are parsed correctly, findNextBusTime is used
- Handles missing direction	-> Function returns an empty array instead of crashing
- Throws an error when no walking route is found -> Ensures proper error handling for invalid routes
- Throws an error when no bus route is found -> Ensures correct handling of missing bus routes
*/



// Mock axios and findNextBusTime to prevent real API calls
jest.mock("axios");
jest.mock("@/utils/getNextShuttleBus", () => ({
  findNextBusTime: jest.fn(),
}));

describe("getShuttleBusRoute", () => {
  const walkingMockResponse = {
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
    data: {
      routes: [
        {
          overview_polyline: { points: "mocked_walking_polyline" },
          legs: [
            {
              duration: { text: "5 mins", value: 300 },
              distance: { text: "0.5 km", value: 500 },
              steps: [{ instruction: "Walk to pickup location" }],
            },
          ],
        },
      ],
    },
  };

  const busMockResponse = {
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
    data: {
      routes: [
        {
          overview_polyline: { points: "mocked_bus_polyline" },
          legs: [
            {
              duration: { text: "15 mins", value: 900 },
              distance: { text: "5 km", value: 5000 },
              steps: [{ instruction: "Take the bus" }],
            },
          ],
        },
      ],
    },
  };

  it("should return shuttle route data successfully", async () => {
    // Mock API responses
    (axios.get as jest.MockedFunction<typeof axios.get>)
      .mockResolvedValueOnce(walkingMockResponse) // First walking leg
      .mockResolvedValueOnce(busMockResponse) // Bus leg
      .mockResolvedValueOnce(walkingMockResponse); // Second walking leg

    // Mock findNextBusTime to return a valid bus time
    (findNextBusTime as jest.MockedFunction<typeof findNextBusTime>).mockReturnValue("10:30");

    const origin = "Montreal";
    const destination = "Toronto";
    const direction = "SGW";

    const result: RouteData[] = await getShuttleBusRoute(origin, destination, direction);

    expect(result).toEqual([
      {
        polyline: "",
        duration: expect.stringContaining("mins"),
        distance: expect.stringContaining("km"),
        steps: expect.any(Array),
      },
    ]);

    // Ensure axios was called for walking and bus routes
    expect(axios.get).toHaveBeenCalledTimes(3);
  });

  it("should return an empty array if direction is not provided", async () => {
    const result = await getShuttleBusRoute("Montreal", "Toronto", "");
    expect(result).toEqual([]);
  });

  it("should throw an error when no walking route is found", async () => {
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce({
      ...walkingMockResponse,
      data: { routes: [] },
    });

    await expect(getShuttleBusRoute("Montreal", "Toronto", "SGW")).rejects.toThrow("No walking route found");
  });

  it("should throw an error when no bus route is found", async () => {
    (axios.get as jest.MockedFunction<typeof axios.get>)
      .mockResolvedValueOnce(walkingMockResponse)
      .mockResolvedValueOnce({
        ...busMockResponse,
        data: { routes: [] },
      });

    await expect(getShuttleBusRoute("Montreal", "Toronto", "SGW")).rejects.toThrow("No bus route found");
  });
});
