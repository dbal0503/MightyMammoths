import { getBuildingAddress } from "../utils/buildingMapping";

describe("getBuildingAddress", () => {
  it("should return the correct address for a valid abbreviation", () => {
    expect(getBuildingAddress("EV")).toBe("Concordia University, EV Building, Montreal, QC");
    expect(getBuildingAddress("Hall")).toBe("Concordia University, Hall Building, Montreal, QC");
    expect(getBuildingAddress("JMSB")).toBe("Concordia University, John Molson School of Business, Montreal, QC");
  });

  it("should return the correct address for a valid full building name", () => {
    expect(getBuildingAddress("CL Building")).toBe("Concordia University, CL Building, Montreal, QC");
    expect(getBuildingAddress("Learning Square")).toBe("Concordia University, Learning Square, Montreal, QC");
    expect(getBuildingAddress("Smith Building")).toBe("Concordia University Smith Building, Loyola Campus, Montreal, QC, Canada");
  });

  it("should return the same input if the abbreviation is not in the mapping", () => {
    expect(getBuildingAddress("Unknown")).toBe("Unknown");
    expect(getBuildingAddress("XYZ")).toBe("XYZ");
  });

  it("should be case-sensitive and not recognize lowercase inputs", () => {
    expect(getBuildingAddress("ev")).toBe("ev"); // Should return the input since "ev" isn't in the mapping
    expect(getBuildingAddress("hall")).toBe("hall");
  });

  it("should handle empty input", () => {
    expect(getBuildingAddress("")).toBe("");
  });
});
