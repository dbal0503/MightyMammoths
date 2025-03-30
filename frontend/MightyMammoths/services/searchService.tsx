import axios from "axios";

// Interfaces for API requests
export interface SuggestionRequest {
    input: string;
    locationBias: {
        circle: {
            center: {
                latitude: number
                longitude: number
            };
            radius: number;
        }
    }
}

export interface PlacesSearch {
    includedTypes: [string],
    maxResultCount: number,
    locationRestriction: {
        circle: {
            center: {
                latitude: number
                longitude: number
            }
            radius: number;
        }
    }
}

// Interface for location
export interface Location {
    latitude: number;
    longitude: number;
}

// Result interfaces
export interface SuggestionResult {
    placePrediction: {
        place: string,
        placeId: string,
        text: {
            text: string,
            matches: {
                startOffset: number,
                endOffset: number
            }[]
        },
        structuredFormat: {
            mainText: {
                text: string,
                matches: {
                    startOffset: number,
                    endOffset: number
                }[]
            },
            secondaryText: {
                text: string
            }
        },
        types: string[]
    },
    location?: {
        latitude: number,
        longitude: number
    }
}

export interface PlaceDetails {
    location: {
        latitude: number,
        longitude: number
    },
    shortFormattedAddress: string
}

// Custom error classes
class APIError extends Error {
    constructor(message: string, public originalError: any) {
        super(message);
        this.name = 'APIError';
    }
}

// API Client Adapter - Handles direct communication with Google Places API
class GooglePlacesAPIClient {
    private readonly baseURL: string = 'https://places.googleapis.com/v1';
    private readonly defaultLocation: Location = { latitude: 45.495376, longitude: -73.577997 }; // EV Building

    constructor(private apiKey: string) {
        if (!apiKey) {
            throw new Error('API key is required');
        }
    }

    async autoComplete(input: string, location: Location = this.defaultLocation, radius: number = 500): Promise<any> {
        const data: SuggestionRequest = {
            input,
            locationBias: {
                circle: {
                    center: location,
                    radius
                }
            }
        };

        return this.makeRequest('post', '/places:autocomplete', data);
    }

    async searchNearby(type: string, radius: number, location: Location = this.defaultLocation, maxResults: number = 10): Promise<any> {
        const data: PlacesSearch = {
            includedTypes: [type],
            maxResultCount: maxResults,
            locationRestriction: {
                circle: {
                    center: location,
                    radius
                }
            }
        };

        return this.makeRequest(
            'post',
            '/places:searchNearby',
            data,
            'places.id,places.displayName,places.location,places.formattedAddress'
        );
    }

    async getPlaceDetails(placeId: string): Promise<any> {
        return this.makeRequest(
            'get',
            `/places/${placeId}`,
            null,
            'location,shortFormattedAddress'
        );
    }

    private async makeRequest(method: string, endpoint: string, data?: any, fieldMask?: string): Promise<any> {
        const config: any = {
            method,
            url: `${this.baseURL}${endpoint}`,
            headers: {
                'Content-type': 'application/json',
                'X-Goog-Api-Key': this.apiKey
            }
        };

        if (fieldMask) {
            config.headers['X-Goog-FieldMask'] = fieldMask;
        }

        if (data) {
            config.data = JSON.stringify(data);
        }

        try {
            const response = await axios(config);
            return response.data;
        } catch (error) {
            console.log(`API Error: ${error}`);
            throw new APIError('Google Places API request failed', error);
        }
    }
}

// Repository - Handles business logic and data transformation
class PlacesRepository {
    private client: GooglePlacesAPIClient;
    private defaultLocation: Location = { latitude: 45.495376, longitude: -73.577997 };

    constructor(apiKey: string) {
        this.client = new GooglePlacesAPIClient(apiKey);
    }

    async getAutoCompleteSuggestions(searchString: string): Promise<SuggestionResult[] | undefined> {
        try {
            const data = await this.client.autoComplete(searchString);
            return data.suggestions;
        } catch (error) {
            console.log(`Error getting search suggestions: ${error}`);
            return undefined;
        }
    }

    async getNearbyPlaces(searchString: string, radius: number): Promise<SuggestionResult[]> {
        try {
            // Apply business rules
            const cappedRadius = Math.min(radius, 50000);
            const maxResults = radius > 1000 ? 20 : 10;

            const data = await this.client.searchNearby(searchString, cappedRadius, this.defaultLocation, maxResults);
            return this.transformPlacesToSuggestions(data.places || []);
        } catch (error) {
            console.log(`Error getting nearby places: ${error}`);
            return [];
        }
    }

    async getPlaceDetails(placeId: string): Promise<PlaceDetails | undefined> {
        try {
            return await this.client.getPlaceDetails(placeId);
        } catch (error) {
            console.log(`Error getting place details: ${error}`);
            return undefined;
        }
    }

    private transformPlacesToSuggestions(places: any[]): SuggestionResult[] {
        return places.map((p: any) => ({
            placePrediction: {
                place: p.id,
                placeId: p.id,
                text: { text: p.displayName, matches: [] },
                structuredFormat: {
                    mainText: { text: p.displayName?.text, matches: [] },
                    secondaryText: { text: p.formattedAddress ?? '' }
                },
                types: p.types ?? []
            },
            location: p.location
        }));
    }
}

// Service layer - maintains the original API surface
export async function autoCompleteSearch(
    searchString: string,
    apiKeyOverride?: string
): Promise<SuggestionResult[] | undefined> {
    const apiKey = apiKeyOverride || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
        console.log('failed loading google api key');
        return undefined;
    }

    try {
        const repository = new PlacesRepository(apiKey);
        return await repository.getAutoCompleteSuggestions(searchString);
    } catch (error) {
        console.log(`Error in autoCompleteSearch: ${error}`);
        return undefined;
    }
}

export async function nearbyPlacesSearch(
    searchString: string,
    radius: number,
    apiKeyOverride?: string
): Promise<SuggestionResult[]> {
    console.log("radius", radius);
    
    const apiKey = apiKeyOverride || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
        console.log('failed loading google api key');
        return [];
    }

    try {
        const repository = new PlacesRepository(apiKey);
        return await repository.getNearbyPlaces(searchString, radius);
    } catch (error) {
        console.log(`Error in nearbyPlacesSearch: ${error}`);
        return [];
    }
}

export async function getPlaceDetails(
    placeID: string,
    apiKeyOverride?: string
): Promise<PlaceDetails | undefined> {




    const apiKey = apiKeyOverride || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
        console.log('failed loading google api key');
        return undefined;
    }

    try {
        const repository = new PlacesRepository(apiKey);
        return await repository.getPlaceDetails(placeID);
    } catch (error) {
        console.log(`Error in getPlaceDetails: ${error}`);
        return undefined;
    }
}