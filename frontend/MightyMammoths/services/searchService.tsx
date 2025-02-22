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

export interface suggestionResult {
    placePrediction: {
        place: string,
        placeId: string,
        text: {
          text: string,
          matches: [
            {
              startOffset: number,
              endOffset: number
            }
          ]
        },
        structuredFormat: {
          mainText: {
            text: string,
            matches: [
              {
                startOffset: number,
                endOffset: number
              }
            ]
          },
          secondaryText: {
            text: string
          }
        },
        types: string[]
    }
  }

export async function autoCompleteSearch(
    searchString: string
): Promise<suggestionResult[]> {

    let suggestionResults: suggestionResult[] = [];

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    if(!apiKey){
        console.log('failed loading google api key')
        return suggestionResults;
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
        //console.log(response.data.suggestions)
        suggestionResults = response.data.suggestions
    } catch (error) {
        console.log(`Error getting search suggestion: ${error}`)
    }finally {
        return suggestionResults;
    }
}

export interface Location {
    latitude: number,
    longitude: number
}

export async function placeIDtoLocation(
    placeID: string
): Promise<Location | undefined> {

    let location;

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
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
            'X-Goog-FieldMask' : 'location'
        },
    }

    try {
        const response = await axios(config)
        location = response.data.location
        //console.log(response.data)
    } catch (error) {
        console.log(`Error getting place location: ${error}`)
    }finally {
        return location;
    }
}