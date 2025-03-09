import { haversineDistance } from "../haversineDistance"; // adjust the path as needed

describe("haversineDistance", () => {
  it("returns 0 when both coordinates are identical", () => {
    const coord = { latitude: 40.7128, longitude: -74.0060 };
    expect(haversineDistance(coord, coord)).toBe(0);
  });

  it("calculates correct east-west distance along the equator", () => {
    const coord1 = { latitude: 0, longitude: 0 };
    const coord2 = { latitude: 0, longitude: 1 };
    // Expected: 6371000 * (π/180) ≈ 111194.93 m, which rounds to 111195 m.
    const distance = haversineDistance(coord1, coord2);
    expect(distance).toBeCloseTo(111195, 0);
  });

  it("calculates correct north-south distance along the same meridian", () => {
    const coord1 = { latitude: 0, longitude: 0 };
    const coord2 = { latitude: 1, longitude: 0 };
    const distance = haversineDistance(coord1, coord2);
    expect(distance).toBeCloseTo(111195, 0);
  });

  it("calculates the distance between New York City and Los Angeles", () => {
    const newYork = { latitude: 40.7128, longitude: -74.0060 };
    const losAngeles = { latitude: 34.0522, longitude: -118.2437 };
    // Expected distance computed using the function's formula is roughly 3,935,746 m.
    const distance = haversineDistance(newYork, losAngeles);
    expect(distance).toBeCloseTo(3935746, 0);
  });
});
