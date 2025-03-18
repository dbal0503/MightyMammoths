import axios from "axios";

export interface suggestionRequest {
    input: string; //string to be autocompleted
    locationBias: { //search around this location with specified radius
        circle: {
            center:{
                latitude: number
                longitude: number
            };
            radius: number;
        }
    }
}
export interface placesSearch {
    includedTypes: [string],
    maxResultCount: number,
    locationRestriction: {
        circle:{
            center:{
                latitude: number
                longitude: number}
            radius: number;
        }
    }
}
    


export interface suggestionResult {
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

export async function autoCompleteSearch(
    searchString: string,
    apiKeyOverride?: string
): Promise<suggestionResult[] | undefined> {

    let suggestionResults: suggestionResult[] = [];

    const apiKey = apiKeyOverride || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    if(!apiKey){
        console.log('failed loading google api key')
        return undefined;
    }
    const url = 'https://places.googleapis.com/v1/places:autocomplete'

    const data: suggestionRequest = {
        "input": searchString,
        "locationBias":{
            "circle": {
                //hardcoded to EV building for debuggin purposes, should be switched to user location
                //when we manage to have the emulator location in Montreal
                "center":{ 
                    "latitude": 45.495376,
                    "longitude": -73.577997
                },
                "radius": 500
            }
        }
    }

    const config = {
        method: 'post',
        url: url,
        headers: {
            'Content-type': 'application/json',
            'X-Goog-Api-Key': apiKey
        },
        data: JSON.stringify(data)
    }

    try {
        const response = await axios(config)
        return response.data.suggestions
    } catch (error) {
        console.log(`Error getting search suggestion: ${error}`)
        return undefined;
    }
}

export async function nearbyPlacesSearch(
    searchString: string,
    radius: number,
    apiKeyOverride?: string
): Promise<suggestionResult[]> {
    console.log("radius", radius)
    if(radius> 50000){
        radius = 50000;
    }
    let maxresultcount = 10
    if(radius > 1000){
        maxresultcount = 20}
    

    let suggestionResults: suggestionResult[] = [];

    const apiKey = apiKeyOverride || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    if(!apiKey){
        console.log('failed loading google api key')
        return suggestionResults;
    }
    const url = 'https://places.googleapis.com/v1/places:searchNearby'

    const data: placesSearch = {
        "includedTypes": [searchString],
    "maxResultCount": maxresultcount,
    "locationRestriction":{
        "circle":{
            "center":{
                "latitude":  45.495376,
                "longitude": -73.577997
            },           
            "radius": radius}
    }
}
    

        

    const config = {
        method: 'post',
        url: url,
        headers: {
            'Content-type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.location,places.formattedAddress',

                    },
        data: JSON.stringify(data)
    }

    try {
        const response = await axios(config);
        const places = response.data?.places;
      
        if (places) {
          suggestionResults = places.map((p: any) => ({
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
            location: p.location // { latitude: number; longitude: number }
          }));
        }
    } catch (error) {
        console.log(`Error getting search suggestion: ${error}`);
     //   console.log(`${error.response?.data}`);

    } finally {
        //console.log(suggestionResults);
        return suggestionResults;
    }
}

export interface placeDetails {
    location: {
        latitude: number,
        longitude: number
    },
    shortFormattedAddress: string
}

export async function getPlaceDetails(
    placeID: string,
    apiKeyOverride?: string
): Promise<placeDetails | undefined> {




    const apiKey = apiKeyOverride || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    if(!apiKey){
        console.log('failed loading google api key')
        return undefined;
    }
    const url = `https://places.googleapis.com/v1/places/${placeID}`
    const config = {
        method: 'get',
        url: url,
        headers: {
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask' : 'location,shortFormattedAddress'
        },
    }

    try {
        const response = await axios(config)
        return response.data;
    } catch (error) {
        console.log(`Error getting place location: ${error}`)
        return undefined;
    }
}