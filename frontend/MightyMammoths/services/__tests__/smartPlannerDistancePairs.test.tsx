import axios from 'axios';
import { getDistanceAndDuration } from '../smartPlannerDistancePairs';

jest.mock('axios');
jest.mock('../assets/buildings/coordinates/campusbuildingcoords.json', () => ({
  type: 'FeatureCollection',
  name: 'Campus Buildings',
  features: [
    {
      type: 'Feature',
      properties: {
        Campus: 'SGW',
        Building: 'H',
        BuildingName: 'Hall Building',
        'Building Long Name': 'Henry F. Hall Building',
        Address: '1455 De Maisonneuve Blvd. W.',
        PlaceID: 'ChIJk5s9Do-QyUwRctzEuA6j8E0',
        Latitude: 45.497092,
        Longitude: -73.5788
      },
      geometry: {
        type: 'Point',
        coordinates: [-73.5788, 45.497092]
      }
    },
    {
      type: 'Feature',
      properties: {
        Campus: 'SGW',
        Building: 'LB',
        BuildingName: 'Library Building',
        'Building Long Name': 'J.W. McConnell Building',
        Address: '1400 De Maisonneuve Blvd. W.',
        PlaceID: 'ChIJmzuEX4-QyUwROoBHdpB7NQM',
        Latitude: 45.497285,
        Longitude: -73.577788
      },
      geometry: {
        type: 'Point',
        coordinates: [-73.577788, 45.497285]
      }
    }
  ]
}), { virtual: true });

describe('getDistanceAndDuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (axios.get as jest.Mock).mockReset();
  });

  test('should return distance and duration for valid places', async () => {
    const mockResponse = {
      data: {
        routes: [
          {
            legs: [
              {
                distance: { text: '500 m' },
                duration: { text: '6 mins', value: 360 }
              }
            ]
          },
          {
            legs: [
              {
                distance: { text: '600 m' },
                duration: { text: '8 mins', value: 480 }
              }
            ]
          }
        ]
      }
    };
    (axios.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await getDistanceAndDuration(
      'Hall Building',
      'ChIJk5s9Do-QyUwRctzEuA6j8E0',
      'Library Building',
      'ChIJmzuEX4-QyUwROoBHdpB7NQM'
    );

    expect(axios.get).toHaveBeenCalledTimes(1);

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('origin=' + encodeURIComponent('place_id:ChIJk5s9Do-QyUwRctzEuA6j8E0'))
    );
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('destination=' + encodeURIComponent('place_id:ChIJmzuEX4-QyUwROoBHdpB7NQM'))
    );
    expect(result).toEqual({
      from: 'Hall Building',
      fromPlaceID: 'ChIJk5s9Do-QyUwRctzEuA6j8E0',
      to: 'Library Building',
      toPlaceID: 'ChIJmzuEX4-QyUwROoBHdpB7NQM',
      distance: '500 m',
      duration: '6 mins'
    });
  });

  test('should use location name when placeID is empty', async () => {
    const mockResponse = {
      data: {
        routes: [
          {
            legs: [
              {
                distance: { text: '500 m' },
                duration: { text: '6 mins', value: 360 }
              }
            ]
          }
        ]
      }
    };
    (axios.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await getDistanceAndDuration(
      'Hall Building',
      '',
      'Library Building',
      'ChIJmzuEX4-QyUwROoBHdpB7NQM'
    );

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('origin=' + encodeURIComponent('Hall Building'))
    );
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('destination=' + encodeURIComponent('place_id:ChIJmzuEX4-QyUwROoBHdpB7NQM'))
    );
    expect(result).toEqual(expect.objectContaining({
      from: 'Hall Building',
      fromPlaceID: '',
      distance: '500 m'
    }));
  });

  test('should return null when no routes are found', async () => {
    const mockResponse = { data: { routes: [] } };
    (axios.get as jest.Mock).mockResolvedValue(mockResponse);

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await getDistanceAndDuration(
      'Hall Building',
      'ChIJk5s9Do-QyUwRctzEuA6j8E0',
      'Unknown Location',
      'unknown_place_id'
    );

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No routes found'));
    consoleSpy.mockRestore();
  });

  test('should handle API errors gracefully', async () => {
    const mockError = new Error('API error');
    (axios.get as jest.Mock).mockRejectedValue(mockError);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = await getDistanceAndDuration(
      'Hall Building',
      'ChIJk5s9Do-QyUwRctzEuA6j8E0',
      'Library Building',
      'ChIJmzuEX4-QyUwROoBHdpB7NQM'
    );

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching directions')
    );
    consoleErrorSpy.mockRestore();
  });

  test('should handle Axios-specific errors', async () => {
    const axiosError: any = new Error('API error');
    axiosError.isAxiosError = true;
    axiosError.response = { data: { error: 'Invalid API key' } };

    (axios.get as jest.Mock).mockRejectedValue(axiosError);
    jest.spyOn(axios, 'isAxiosError').mockImplementation(() => true);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = await getDistanceAndDuration(
      'Hall Building',
      'ChIJk5s9Do-QyUwRctzEuA6j8E0',
      'Library Building',
      'ChIJmzuEX4-QyUwROoBHdpB7NQM'
    );

    expect(result).toBeNull();
    const axiosErrorCall = consoleErrorSpy.mock.calls.find(call => call[0].includes('Axios error:'));
    expect(axiosErrorCall).toBeDefined();
    consoleErrorSpy.mockRestore();
  });
});


describe('calculateAllPairsDistances', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('should skip pairs with missing placeIDs and append campus buildings', async () => {
    jest.resetModules();
    const distanceModule = require('../smartPlannerDistancePairs');
    const { calculateAllPairsDistances } = distanceModule;

    const locations = [
      {
        id: 1,
        location: 'Hall Building',
        locationPlaceID: 'ChIJk5s9Do-QyUwRctzEuA6j8E0',
        name: 'Hall',
        time: '9:00',
        type: 'Start'
      },
      {
        id: 2,
        location: 'Any SGW campus building',
        locationPlaceID: '',
        name: 'Campus',
        time: '10:00',
        type: 'Class'
      }
    ];

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    distanceModule.getDistanceAndDuration = jest.fn().mockResolvedValue({
      from: 'Hall Building',
      fromPlaceID: 'ChIJk5s9Do-QyUwRctzEuA6j8E0',
      to: 'Library Building',
      toPlaceID: 'ChIJmzuEX4-QyUwROoBHdpB7NQM',
      distance: '500 m',
      duration: '6 mins'
    });

    const results = await calculateAllPairsDistances(locations);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Skipping distance calculation')
    );
    expect(results.length).toBe(0);

    consoleSpy.mockRestore();
  });

  test('should handle case when getDistanceAndDuration returns null', async () => {
    jest.resetModules();
    const distanceModule = require('../smartPlannerDistancePairs');
    const { calculateAllPairsDistances } = distanceModule;

    const locations = [
      {
        id: 1,
        location: 'Hall Building',
        locationPlaceID: 'ChIJk5s9Do-QyUwRctzEuA6j8E0',
        name: 'Hall',
        time: '9:00',
        type: 'Start'
      },
      {
        id: 2,
        location: 'Library Building',
        locationPlaceID: 'ChIJmzuEX4-QyUwROoBHdpB7NQM',
        name: 'Library',
        time: '10:00',
        type: 'Class'
      }
    ];

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    distanceModule.getDistanceAndDuration = jest.fn().mockResolvedValue(null);

    const results = await calculateAllPairsDistances(locations);
    expect(results.length).toBe(0);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('No distance result found')
    );
    consoleSpy.mockRestore();
  });

  test('should handle errors during distance calculation', async () => {
    jest.resetModules();
    const distanceModule = require('../smartPlannerDistancePairs');
    const { calculateAllPairsDistances } = distanceModule;

    const locations = [
      {
        id: 1,
        location: 'Hall Building',
        locationPlaceID: 'ChIJk5s9Do-QyUwRctzEuA6j8E0',
        name: 'Hall',
        time: '9:00',
        type: 'Start'
      },
      {
        id: 2,
        location: 'Library Building',
        locationPlaceID: 'ChIJmzuEX4-QyUwROoBHdpB7NQM',
        name: 'Library',
        time: '10:00',
        type: 'Class'
      }
    ];

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    distanceModule.getDistanceAndDuration = jest.fn().mockRejectedValue(new Error('API error'));

    const results = await calculateAllPairsDistances(locations);
    expect(results.length).toBe(0);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error fetching directions from Hall Building to Library Building')
    );
    consoleErrorSpy.mockRestore();
  });
});
