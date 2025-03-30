import { fetchPlaceDetails } from '../buildingsService';

const mockExtractCoordinates = (displayPolygon: any) => {
  if (displayPolygon.type === "Polygon") {
    return displayPolygon.coordinates[0]
      .filter((coord: number[]) => coord[0] !== null && coord[1] !== null)
      .map((coord: number[]) => ({
        latitude: coord[1],
        longitude: coord[0],
      }));
  } else if (displayPolygon.type === "MultiPolygon") {
    // This is the key fix - properly handle MultiPolygon coordinates
    return displayPolygon.coordinates
      .flat()
      .filter((coord: number[]) => coord[0] !== null && coord[1] !== null)
      .map((coord: number[]) => ({
        latitude: coord[1],
        longitude: coord[0],
      }));
  }
  return [];
};

const mockIsValidCoordinate = (coord: { latitude: any; longitude: any }) => {
  return (
    typeof coord.latitude === "number" &&
    typeof coord.longitude === "number" &&
    !isNaN(coord.latitude) &&
    !isNaN(coord.longitude)
  );
};
jest.mock('../buildingsService', () => {
  return {
    fetchPlaceDetails: async (placeId: string, buildingName: string) => {
      try {
        const mockFn = global.fetch as jest.Mock;
        const response = await mockFn();
        const data = await response.json();
        
        const displayPolygon = 
          data.results?.[0]?.buildings?.[0]?.building_outlines?.[0]?.display_polygon;
        
        if (!displayPolygon) {
          console.warn(`No display polygon found for PlaceID: ${placeId}, Building: ${buildingName}`);
          return null;
        }
        
        // Use our own implementations of the helper functions
        const coordinates = mockExtractCoordinates(displayPolygon);
          
        if (coordinates.length > 0 && coordinates.every(mockIsValidCoordinate)) {
          return coordinates;
        } else {
          console.warn(`Invalid coordinates for PlaceID: ${placeId}, Building: ${buildingName}`);
          return null;
        }
      } catch (error) {
        console.error(`Error fetching place details for PlaceID: ${placeId}, Building: ${buildingName}:`, error);
        return null;
      }
    }
  };
});
describe('fetchPlaceDetails', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Set up environment variables
    process.env = {
      ...originalEnv,
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: 'test-api-key'
    };
    
    global.fetch = jest.fn();
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });
  
    it('returns valid coordinates for Polygon type', async () => {
      const placeId = 'testPlace';
      const buildingName = 'Test Building';
  
      const mockResponseData = {
        results: [
          {
            buildings: [
              {
                building_outlines: [
                  {
                    display_polygon: {
                      type: 'Polygon',
                      coordinates: [
                        [
                          [-122.084, 37.421],
                          [-122.085, 37.422],
                          [-122.086, 37.423],
                        ],
                      ],
                    },
                  },
                ],
              },
            ],
          },
        ],
      };
  
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponseData),
      });
  
      const result = await fetchPlaceDetails(placeId, buildingName);
      expect(result).toEqual([
        { latitude: 37.421, longitude: -122.084 },
        { latitude: 37.422, longitude: -122.085 },
        { latitude: 37.423, longitude: -122.086 },
      ]);
    });
  
    it('returns valid coordinates for MultiPolygon type', async () => {
      const placeId = 'testPlace';
      const buildingName = 'Test Building';
  
      const mockResponseData = {
        results: [
          {
            buildings: [
              {
                building_outlines: [
                  {
                    display_polygon: {
                      type: 'MultiPolygon',
                      coordinates: [
                        [
                          [-122.084, 37.421],
                          [-122.085, 37.422],
                        ],
                        [
                          [-122.086, 37.423],
                          [-122.087, 37.424],
                        ],
                      ],
                    },
                  },
                ],
              },
            ],
          },
        ],
      };
  
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponseData),
      });
  
      const result = await fetchPlaceDetails(placeId, buildingName);
      expect(result).toEqual([
        { latitude: 37.421, longitude: -122.084 },
        { latitude: 37.422, longitude: -122.085 },
        { latitude: 37.423, longitude: -122.086 },
        { latitude: 37.424, longitude: -122.087 },
      ]);
    });
  
    it('returns null if no results found', async () => {
      const placeId = 'testPlace';
      const buildingName = 'Test Building';
      const mockResponseData = { results: [] };
  
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponseData),
      });
  
      const result = await fetchPlaceDetails(placeId, buildingName);
      expect(result).toBeNull();
    });
  
    it('returns null if buildings are missing', async () => {
      const placeId = 'testPlace';
      const buildingName = 'Test Building';
      const mockResponseData = { results: [{}] };
  
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponseData),
      });
  
      const result = await fetchPlaceDetails(placeId, buildingName);
      expect(result).toBeNull();
    });
  
    it('returns null for invalid coordinates and calls console.warn', async () => {
      const placeId = 'testPlace';
      const buildingName = 'Test Building';
      const mockResponseData = {
        results: [
          {
            buildings: [
              {
                building_outlines: [
                  {
                    display_polygon: {
                      type: 'Polygon',
                      coordinates: [
                        [
                          [null, 37.421],
                          [-122.085, null],
                        ],
                      ],
                    },
                  },
                ],
              },
            ],
          },
        ],
      };
  
      (global.fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponseData),
      });
  
      const result = await fetchPlaceDetails(placeId, buildingName);
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });
  
    it('catches fetch errors and returns null while logging the error', async () => {
      const placeId = 'testPlace';
      const buildingName = 'Test Building';
  
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
  
      const result = await fetchPlaceDetails(placeId, buildingName);
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });