import { fetchPlaceDetails } from '../buildingsService';

describe('fetchPlaceDetails', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });
  
    afterEach(() => {
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