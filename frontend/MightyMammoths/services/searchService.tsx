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

}

export async function autoCompleteSearch(
    searchString: string
): Promise<suggestionResult[] | undefined> {

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    if(!apiKey){
        console.log('failed loading google api key')
    }
    const url = 'https://places.googleapis.com/v1/places:autocomplete'

    const data: suggestionRequest = {
        input: searchString,
        locationBias:{
            circle: {
                //hardcoded to EV building for debuggin purposes, should be switched to user location
                //when we manage to have the emulator location in Montreal
                center:{ 
                    latitude: 45.495376,
                    longitude: -73.577997
                },
                radius: 500
            }
        }
    }

    const config = {
        method: 'post',
        url: url,
        headers: {
            'Content-type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress',
        },
        data: data
    }

    try {
        const response = await axios(config)
        console.log(response)
    } catch (error) {
        console.log(`Error getting search suggestion: ${error}`)
    }
    return undefined
}