import axios from 'axios';
import { nearbyPlacesSearch, autoCompleteSearch, getPlaceDetails } from '../searchService';

// Mock axios
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe('searchService', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('nearbyPlacesSearch', () => {
        it('should successfully fetch nearby places', async () => {
            // Mock successful API response
            const mockResponse = {
                data: {
                    places: [
                        {
                            id: 'place1',
                            displayName: { text: 'Test Place 1' },
                            formattedAddress: '123 Test St',
                            location: { latitude: 45.495376, longitude: -73.577997 },
                            types: ['restaurant']
                        }
                    ]
                }
            };

            mockedAxios.mockResolvedValueOnce(mockResponse);

            const result = await nearbyPlacesSearch('restaurant', 1000, 'test-api-key');

            expect(result).toHaveLength(1);
            expect(result[0].placePrediction.place).toBe('place1');
            expect(result[0].placePrediction.text.text).toEqual({ text: 'Test Place 1' });
            expect(result[0].location).toEqual({ latitude: 45.495376, longitude: -73.577997 });
            expect(mockedAxios).toHaveBeenCalledTimes(1);
            
            // Verify the API call
            const requestConfig = mockedAxios.mock.calls[0][0] as any;
            expect(requestConfig.method).toBe('post');
            expect(requestConfig.url).toBe('https://places.googleapis.com/v1/places:searchNearby');
            expect(requestConfig.headers['X-Goog-Api-Key']).toBe('test-api-key');
            
            // Parse the request data
            const requestData = JSON.parse(requestConfig.data);
            expect(requestData.includedTypes).toEqual(['restaurant']);
            expect(requestData.maxResultCount).toBe(10);
            expect(requestData.locationRestriction.circle.radius).toBe(1000);
        });

        it('should handle API errors gracefully', async () => {
            // Mock API error
            mockedAxios.mockRejectedValueOnce(new Error('API Error'));

            const result = await nearbyPlacesSearch('restaurant', 1000, 'test-api-key');

            expect(result).toEqual([]);
            expect(mockedAxios).toHaveBeenCalledTimes(1);
        });

        it('should cap radius at 50000 meters', async () => {
            mockedAxios.mockResolvedValueOnce({ data: { places: [] } });

            await nearbyPlacesSearch('restaurant', 60000, 'test-api-key');

            expect(mockedAxios).toHaveBeenCalledTimes(1);
            
            // Parse the request data
            const requestConfig = mockedAxios.mock.calls[0][0] as any;
            const requestData = JSON.parse(requestConfig.data);
            expect(requestData.locationRestriction.circle.radius).toBe(50000);
        });

        it('should increase maxResultCount for larger radius', async () => {
            mockedAxios.mockResolvedValueOnce({ data: { places: [] } });

            await nearbyPlacesSearch('restaurant', 2000, 'test-api-key');

            expect(mockedAxios).toHaveBeenCalledTimes(1);
            
            // Parse the request data
            const requestConfig = mockedAxios.mock.calls[0][0] as any;
            const requestData = JSON.parse(requestConfig.data);
            expect(requestData.maxResultCount).toBe(20);
        });

        it('should return empty array when API key is missing', async () => {
            // Pass null as API key override
            const result = await nearbyPlacesSearch('restaurant', 1000, null as unknown as string);

            expect(result).toEqual([]);
            expect(mockedAxios).not.toHaveBeenCalled();
        });

        it('should handle empty places array in response', async () => {
            mockedAxios.mockResolvedValueOnce({ data: { places: [] } });

            const result = await nearbyPlacesSearch('restaurant', 1000, 'test-api-key');

            expect(result).toEqual([]);
            expect(mockedAxios).toHaveBeenCalledTimes(1);
        });

        it('should handle missing fields in place data', async () => {
            const mockResponse = {
                data: {
                    places: [
                        {
                            id: 'place1',
                            displayName: { text: 'Test Place 1' },
                            // Missing formattedAddress and types
                            location: { latitude: 45.495376, longitude: -73.577997 }
                        }
                    ]
                }
            };

            mockedAxios.mockResolvedValueOnce(mockResponse);

            const result = await nearbyPlacesSearch('restaurant', 1000, 'test-api-key');

            expect(result).toHaveLength(1);
            expect(result[0].placePrediction.place).toBe('place1');
            expect(result[0].placePrediction.text.text).toEqual({ text: 'Test Place 1' });
            expect(result[0].placePrediction.structuredFormat.secondaryText.text).toBe('');
            expect(result[0].placePrediction.types).toEqual([]);
        });

        it('should handle undefined places in response', async () => {
            mockedAxios.mockResolvedValueOnce({ data: {} });

            const result = await nearbyPlacesSearch('restaurant', 1000, 'test-api-key');

            expect(result).toEqual([]);
            expect(mockedAxios).toHaveBeenCalledTimes(1);
        });

        it('should handle undefined response data', async () => {
            mockedAxios.mockResolvedValueOnce({});

            const result = await nearbyPlacesSearch('restaurant', 1000, 'test-api-key');

            expect(result).toEqual([]);
            expect(mockedAxios).toHaveBeenCalledTimes(1);
        });

        it('should handle place with missing displayName', async () => {
            const mockResponse = {
                data: {
                    places: [
                        {
                            id: 'place1',
                            // Missing displayName
                            location: { latitude: 45.495376, longitude: -73.577997 }
                        }
                    ]
                }
            };

            mockedAxios.mockResolvedValueOnce(mockResponse);

            const result = await nearbyPlacesSearch('restaurant', 1000, 'test-api-key');

            expect(result).toHaveLength(1);
            expect(result[0].placePrediction.place).toBe('place1');
            expect(result[0].placePrediction.text.text).toBeUndefined();
            expect(result[0].placePrediction.structuredFormat.mainText.text).toBeUndefined();
        });
    });

    describe('autoCompleteSearch', () => {
        it('should successfully fetch search suggestions', async () => {
            const mockResponse = {
                data: {
                    suggestions: [
                        {
                            placePrediction: {
                                place: 'place1',
                                placeId: 'place1',
                                text: { text: 'Test Place 1', matches: [] },
                                structuredFormat: {
                                    mainText: { text: 'Test Place 1', matches: [] },
                                    secondaryText: { text: '123 Test St' }
                                },
                                types: ['restaurant']
                            }
                        }
                    ]
                }
            };

            mockedAxios.mockResolvedValueOnce(mockResponse);

            const result = await autoCompleteSearch('test', 'test-api-key');

            expect(result).toHaveLength(1);
            expect(result?.[0].placePrediction.place).toBe('place1');
            expect(result?.[0].placePrediction.text.text).toBe('Test Place 1');
            expect(mockedAxios).toHaveBeenCalledTimes(1);
            
            // Verify the API call
            const requestConfig = mockedAxios.mock.calls[0][0] as any;
            expect(requestConfig.method).toBe('post');
            expect(requestConfig.url).toBe('https://places.googleapis.com/v1/places:autocomplete');
            expect(requestConfig.headers['X-Goog-Api-Key']).toBe('test-api-key');
            
            // Parse the request data
            const requestData = JSON.parse(requestConfig.data);
            expect(requestData.input).toBe('test');
        });

        it('should handle API errors gracefully', async () => {
            mockedAxios.mockRejectedValueOnce(new Error('API Error'));

            const result = await autoCompleteSearch('test', 'test-api-key');

            expect(result).toBeUndefined();
            expect(mockedAxios).toHaveBeenCalledTimes(1);
        });

        it('should return undefined when API key is missing', async () => {
            // Pass null as API key override
            const result = await autoCompleteSearch('test', null as unknown as string);

            expect(result).toBeUndefined();
            expect(mockedAxios).not.toHaveBeenCalled();
        });

        it('should handle empty suggestions array in response', async () => {
            mockedAxios.mockResolvedValueOnce({ data: { suggestions: [] } });

            const result = await autoCompleteSearch('test', 'test-api-key');

            expect(result).toEqual([]);
            expect(mockedAxios).toHaveBeenCalledTimes(1);
        });

        it('should handle missing fields in suggestion data', async () => {
            const mockResponse = {
                data: {
                    suggestions: [
                        {
                            placePrediction: {
                                place: 'place1',
                                placeId: 'place1',
                                text: { text: 'Test Place 1', matches: [] }
                                // Missing structuredFormat and types
                            }
                        }
                    ]
                }
            };

            mockedAxios.mockResolvedValueOnce(mockResponse);

            const result = await autoCompleteSearch('test', 'test-api-key');

            expect(result).toHaveLength(1);
            expect(result?.[0].placePrediction.place).toBe('place1');
            expect(result?.[0].placePrediction.text.text).toBe('Test Place 1');
        });

        it('should handle undefined suggestions in response', async () => {
            mockedAxios.mockResolvedValueOnce({ data: {} });

            const result = await autoCompleteSearch('test', 'test-api-key');

            expect(result).toBeUndefined();
            expect(mockedAxios).toHaveBeenCalledTimes(1);
        });

        it('should handle undefined response data', async () => {
            mockedAxios.mockResolvedValueOnce({});

            const result = await autoCompleteSearch('test', 'test-api-key');

            expect(result).toBeUndefined();
            expect(mockedAxios).toHaveBeenCalledTimes(1);
        });
    });

    describe('getPlaceDetails', () => {
        it('should successfully fetch place details', async () => {
            const mockResponse = {
                data: {
                    location: {
                        latitude: 45.495376,
                        longitude: -73.577997
                    },
                    shortFormattedAddress: '123 Test St'
                }
            };

            mockedAxios.mockResolvedValueOnce(mockResponse);

            const result = await getPlaceDetails('place1', 'test-api-key');

            expect(result).toEqual({
                location: {
                    latitude: 45.495376,
                    longitude: -73.577997
                },
                shortFormattedAddress: '123 Test St'
            });
            expect(mockedAxios).toHaveBeenCalledTimes(1);
            
            // Verify the API call
            const requestConfig = mockedAxios.mock.calls[0][0] as any;
            expect(requestConfig.method).toBe('get');
            expect(requestConfig.url).toBe('https://places.googleapis.com/v1/places/place1');
            expect(requestConfig.headers['X-Goog-Api-Key']).toBe('test-api-key');
        });

        it('should handle API errors gracefully', async () => {
            mockedAxios.mockRejectedValueOnce(new Error('API Error'));

            const result = await getPlaceDetails('place1', 'test-api-key');

            expect(result).toBeUndefined();
            expect(mockedAxios).toHaveBeenCalledTimes(1);
        });

        it('should return undefined when API key is missing', async () => {
            // Pass null as API key override
            const result = await getPlaceDetails('place1', null as unknown as string);

            expect(result).toBeUndefined();
            expect(mockedAxios).not.toHaveBeenCalled();
        });

        it('should handle missing fields in place details response', async () => {
            const mockResponse = {
                data: {
                    location: {
                        latitude: 45.495376,
                        longitude: -73.577997
                    }
                    // Missing shortFormattedAddress
                }
            };

            mockedAxios.mockResolvedValueOnce(mockResponse);

            const result = await getPlaceDetails('place1', 'test-api-key');

            expect(result).toEqual({
                location: {
                    latitude: 45.495376,
                    longitude: -73.577997
                }
            });
        });

        it('should handle undefined response data', async () => {
            mockedAxios.mockResolvedValueOnce({});

            const result = await getPlaceDetails('place1', 'test-api-key');

            expect(result).toBeUndefined();
            expect(mockedAxios).toHaveBeenCalledTimes(1);
        });
    });
});
