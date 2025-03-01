import axios from "axios";
import { getShuttleBusRoute } from "../shuttleBusRoute";
import { RouteData } from "../directionsService";
import { findNextBusTime } from "@/utils/getNextShuttleBus";

jest.mock("axios");
jest.mock("@/utils/getNextShuttleBus", () => ({
  findNextBusTime: jest.fn(),
}));

describe("getShuttleBusRoute", () => {
  const walkingMockResponse = {
    data: {
      routes: [
        {
          overview_polyline: { points: "mocked_walking_polyline" },
          legs: [
            {
              duration: { text: "5 mins", value: 300 },
              distance: { text: "0.5 km", value: 500 },
              steps: [{ instruction: "Walk to pickup location" }],
            },
          ],
        },
      ],
    },
  };

  const busMockResponse = {
    data: {
      routes: [
        {
          overview_polyline: { points: "mocked_bus_polyline" },
          legs: [
            {
              duration: { text: "15 mins", value: 900 },
              distance: { text: "5 km", value: 5000 },
              steps: [{ instruction: "Take the bus" }],
            },
          ],
        },
      ],
    },
  };

  it("should return shuttle route data successfully", async () => {
    (axios.get as jest.MockedFunction<typeof axios.get>)
      .mockResolvedValueOnce(walkingMockResponse) 
      .mockResolvedValueOnce(busMockResponse) 
      .mockResolvedValueOnce(walkingMockResponse); 

    (findNextBusTime as jest.MockedFunction<typeof findNextBusTime>).mockReturnValue("10:30");

    const result: RouteData[] = await getShuttleBusRoute("Montreal", "Toronto", "SGW");

    expect(result).toEqual(expect.any(Array));
    expect(result.length).toBeGreaterThan(0);
    expect(axios.get).toHaveBeenCalledTimes(3);
  });

  it("should return an empty array when no bus route is found", async () => {
    (axios.get as jest.MockedFunction<typeof axios.get>)
      .mockResolvedValueOnce(walkingMockResponse) 
      .mockResolvedValueOnce({ data: { routes: [] } }); 
  
    const result = await getShuttleBusRoute("Montreal", "Toronto", "SGW");
    expect(result).toEqual([]); 
  });
  

  it("should return an empty array when no walking route is found", async () => {
    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce({
      data: { routes: [] },
    });

    const result = await getShuttleBusRoute("Montreal", "Toronto", "SGW");
    expect(result).toEqual([]); 
  });


  it("should return an empty array when the API request fails", async () => {
    (axios.get as jest.MockedFunction<typeof axios.get>).mockRejectedValue(new Error("API Error"));

    const result = await getShuttleBusRoute("Montreal", "Toronto", "SGW");
    expect(result).toEqual([]); 
  });

  it("should return an empty array if duration values are missing", async () => {
    const missingDurationResponse = {
      data: {
        routes: [
          {
            overview_polyline: { points: "mocked_walking_polyline" },
            legs: [
              {
                duration: { text: "5 mins" }, 
                distance: { text: "0.5 km", value: 500 },
                steps: [{ instruction: "Walk to pickup location" }],
              },
            ],
          },
        ],
      },
    };

    (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValueOnce(missingDurationResponse);

    const result = await getShuttleBusRoute("Montreal", "Toronto", "SGW");
    expect(result).toEqual([]); 
  });

  it("should correctly assign dropOffLocation based on direction", async () => {
    const mockedAxiosGet = axios.get as jest.Mock;
  
    // For SGW
    mockedAxiosGet
      .mockResolvedValueOnce(walkingMockResponse) 
      .mockResolvedValueOnce(busMockResponse)    
      .mockResolvedValueOnce(walkingMockResponse);  
  
    (findNextBusTime as jest.Mock).mockReturnValue("10:30");
  
    await getShuttleBusRoute("Montreal", "Toronto", "SGW");

    expect(
      mockedAxiosGet.mock.calls.some((call) =>
        call[0].includes(encodeURIComponent("45.458424,-73.638369"))
      )
    ).toBe(true);
  
    mockedAxiosGet.mockClear();

    mockedAxiosGet
      .mockResolvedValueOnce(walkingMockResponse) 
      .mockResolvedValueOnce(busMockResponse)     
      .mockResolvedValueOnce(walkingMockResponse);  
  
    await getShuttleBusRoute("Montreal", "Toronto", "LOY");
    expect(
      mockedAxiosGet.mock.calls.some((call) =>
        call[0].includes(encodeURIComponent("45.497163,-73.578535"))
      )
    ).toBe(true);
  });
  
  
});
