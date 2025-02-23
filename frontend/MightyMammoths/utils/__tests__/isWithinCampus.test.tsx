import { isWithinRadius } from "../isWithinCampus";

describe("isWithinRadius", () => {
  test("should return 'SGW' when user is inside SGW campus radius", async () => {
    const userLat = 45.4959; 
    const userLong = -73.5780; 

    const result = await isWithinRadius(userLat, userLong);
    expect(result).toBe("SGW");
  });

  test("should return 'LOY' when user is inside LOY campus radius", async () => {
    const userLat = 45.4590; 
    const userLong = -73.6400; 

    const result = await isWithinRadius(userLat, userLong);
    expect(result).toBe("LOY");
  });

  test("should return '' when user is outside both campus radii", async () => {
    const userLat = 45.4000; 
    const userLong = -73.7000;

    const result = await isWithinRadius(userLat, userLong);
    expect(result).toBe("");
  });
});
