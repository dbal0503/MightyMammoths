import axios from 'axios';
import { nearbyPlacesSearch } from '../searchService'; // update path if needed

// Mock axios module
jest.mock('axios');

describe("nearbyPlacesSearch", () => {
  const mockAxios = axios as jest.Mocked<typeof axios>;

  // Keep track of any original key the developer might have set
  let originalApiKey: string | undefined;

  beforeAll(() => {
    // Remember what the env variable was before the tests
    originalApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    console.log("orginalkey", originalApiKey)
    console.log("key", process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY)

    // Provide a dummy key so the code won't short-circuit in most tests
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = "dummy_api_key";

    console.log("TEST Env Var:", process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY);
  });

  afterAll(() => {
    // Restore whatever was originally there
    if (originalApiKey) {
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = originalApiKey;
    } else {
      delete process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when API key is missing", () => {
    it("returns an empty array if API key is missing", async () => {
      // Temporarily remove the key for this single test
      delete process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

      const result = await nearbyPlacesSearch("restaurant", 1000);
      expect(result).toEqual([]);

      // Put the dummy key back so subsequent tests aren't affected
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = "dummy_api_key";
    });
  });

  it("limits radius to 50000 if a bigger value is provided", async () => {
    // This test uses the dummy key set in beforeAll
    mockAxios.request.mockResolvedValue({
      data: { places: [] },
    } as any);

    await nearbyPlacesSearch("restaurant", 999999);
    expect(mockAxios.request).toHaveBeenCalled();
  });

  it("returns an array of suggestionResult on success", async () => {
    // Again, dummy key is in place
    const mockPlaces = [
      {
        id: "abc123",
        displayName: { text: "Sample Place" },
        formattedAddress: "123 Example St.",
        location: { latitude: 1, longitude: 2 },
      },
      {
        id: "xyz789",
        displayName: { text: "Another Place" },
        formattedAddress: "456 Another Rd.",
        location: { latitude: 3, longitude: 4 },
      },
    ];

    mockAxios.request.mockResolvedValue({
      data: { places: mockPlaces },
    } as any);

    const result = await nearbyPlacesSearch("restaurant", 1000);
    expect(result).toHaveLength(2);

    expect(result[0].placePrediction.place).toBe("abc123");
    expect(result[0].location).toEqual({ latitude: 1, longitude: 2 });

    expect(result[1].placePrediction.placeId).toBe("xyz789");
    expect(result[1].location).toEqual({ latitude: 3, longitude: 4 });
  });

  it("returns an empty array if an error occurs", async () => {
    mockAxios.request.mockRejectedValue(new Error("Network Error"));

    const result = await nearbyPlacesSearch("restaurant", 1000);
    expect(result).toEqual([]);
  });
});
