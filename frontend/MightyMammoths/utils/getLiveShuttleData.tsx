import axios from 'axios';

const GET_URL = "https://shuttle.concordia.ca/concordiabusmap/Map.aspx";
const POST_URL = "https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject";
const REQUEST_INTERVAL = 15000;

/*
justinsciortino@Justins-MBP-7 ~ % curl -X POST "https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject" \
     -H "Host: shuttle.concordia.ca" \
     -H "Content-Length: 0" \
     -H "Content-Type: application/json; charset=UTF-8" \
     -H "Cookie: ASP.NET_SessionId=sssry3wrey3dinzzcsmkc1mp" \
     -d "{}"
*/

let cachedCookies: string | null = null;

async function getSessionCookies(): Promise<string | null> {
  try {
    const response = await axios.get(GET_URL, {
      headers: {
        'Host': 'shuttle.concordia.ca',
      },
    });
    console.log('GET response headers:', response.headers);

    const cookies = response.headers['set-cookie'];
    if (cookies && Array.isArray(cookies)) {
      const cookieString = cookies
        .map(cookie => cookie.split(';')[0])
        .join('; ');
      console.log('Extracted cookies:', cookieString);
      return cookieString;
    } else {
      console.warn('No cookies found in GET response.');
    }
  } catch (error) {
    console.error('Error fetching session cookies:', error);
  }
  return null;
}

async function makePostRequest(cookies: string) {
    try {
      const response = await fetch(POST_URL, {
        method: 'POST',
        headers: {
          'Host': 'shuttle.concordia.ca',
          'Content-Type': 'application/json; charset=UTF-8',
          'Accept': '*/*',
          'Cookie': cookies,
          'Origin': 'null', 
        },
        body: null, 
      });
  
      const data = await response.json();
      console.log('POST response:', data);
      return data;
    } catch (error) {
      console.error('Error making POST request:', error);
    }
  }
  
  

export async function fetchShuttleData() {
  while (true) {
    if (!cachedCookies) {
      console.log('Fetching session cookies...');
      const cookies = await getSessionCookies();
      if (cookies) {
        cachedCookies = cookies;
      } else {
        console.warn('Could not retrieve cookies, retrying...');
        await new Promise(resolve => setTimeout(resolve, REQUEST_INTERVAL));
        continue; 
      }
    } else {
      console.log('Using cached cookies');
    }
    console.log("Cookies:", cachedCookies);
    console.log('Making POST request...');
    const data = await makePostRequest(cachedCookies);
    if (data?.d?.Points?.length > 0) {
      console.log('Shuttle data:', data.d);
      console.log('Valid shuttle data received:', data.d.Points);
      return data.d.Points;
    } else {
      console.warn('POST response did not contain valid Points data, retrying...');
    }
    await new Promise(resolve => setTimeout(resolve, REQUEST_INTERVAL));
  }
}
