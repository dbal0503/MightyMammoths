import axios from "axios";
import { getRoutes, RouteData } from "../directionsService";

jest.mock("axios");


describe("getRoutes", () => {
  beforeEach(() => {
    // Silence console errors during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore original console behavior
    jest.restoreAllMocks();
  });
  const mockResponse = {
    data: {
      routes: [
        {
          overview_polyline: { points: "mocked_polyline" },
          legs: [
            {
              duration: { text: "15 mins", value: 900 },
              distance: { text: "5 km" },
              steps: [{ instruction: "Turn left on Main St." }],
            },
          ],
        },
      ],
    },
  };

  it("should fetch route data successfully", async () => {
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue(mockResponse);

    const result: RouteData | null = await getRoutes("Montreal", "Toronto", "driving");

    expect(result).toEqual({
      polyline: "mocked_polyline",
      duration: "15 mins",
      durationValue: 900,
      distance: "5 km",
      steps: [{ instruction: "Turn left on Main St." }],
    });

    expect(axios.get).toHaveBeenCalled();
  });

  it("should handle API errors", async () => {
    (axios.get as jest.MockedFunction<typeof axios.get>).mockRejectedValue(new Error("API Error"));

    await expect(getRoutes("Montreal", "Toronto", "driving")).rejects.toThrow("API Error");
  });

  it("should correctly encode URL parameters", async () => {
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue(mockResponse);

    await getRoutes("New York, NY", "Los Angeles, CA", "walking");

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining(
        `origin=${encodeURIComponent("New York, NY")}&destination=${encodeURIComponent("Los Angeles, CA")}&mode=walking`
      )
    );
  });

  it("should return null when no routes are found", async () => {
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue({ data: { routes: [] } });

    const result = await getRoutes("Montreal", "Toronto", "driving");

    expect(result).toBeNull();
  });

  it("should return the shortest route when multiple routes are available", async () => {
    const multiRouteResponse = {
      data: {
        routes: [
          {
            overview_polyline: { points: "route_1" },
            legs: [{ duration: { text: "20 mins", value: 1200 }, distance: { text: "8 km" }, steps: [] }],
          },
          {
            overview_polyline: { points: "route_2" },
            legs: [{ duration: { text: "15 mins", value: 900 }, distance: { text: "5 km" }, steps: [] }],
          },
        ],
      },
    };

    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue(multiRouteResponse);

    const result = await getRoutes("Montreal", "Toronto", "driving");

    expect(result).toEqual({
      polyline: "route_2",
      duration: "15 mins",
      durationValue: 900,
      distance: "5 km",
      steps: [],
    });
  });

  it("should handle missing duration value gracefully", async () => {
    const missingDurationResponse = {
      data: {
        routes: [
          {
            overview_polyline: { points: "mocked_polyline" },
            legs: [
              {
                duration: { text: "15 mins" }, 
                distance: { text: "5 km" },
                steps: [],
              },
            ],
          },
        ],
      },
    };

    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue(missingDurationResponse);

    const result = await getRoutes("Montreal", "Toronto", "driving");

    expect(result).toEqual({
      polyline: "mocked_polyline",
      duration: "15 mins",
      distance: "5 km",
      steps: [],
    });
  });

  it("should handle missing legs array", async () => {
    const missingLegsResponse = {
      data: {
        routes: [{ overview_polyline: { points: "mocked_polyline" }, legs: [] }],
      },
    };

    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue(missingLegsResponse);

    await expect(getRoutes("Montreal", "Toronto", "driving")).rejects.toThrow();
  });

  it("should handle invalid input (empty origin or destination)", async () => {
    await expect(getRoutes("", "Toronto", "driving")).rejects.toThrow();
    await expect(getRoutes("Montreal", "", "driving")).rejects.toThrow();
  });
});
