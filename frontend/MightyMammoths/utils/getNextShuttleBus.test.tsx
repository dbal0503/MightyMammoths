import { findNextBusTime } from "../utils/getNextShuttleBus";

jest.mock("../utils/shuttleBusSchedule.json", () => ({
  Monday: {
    SGW: ["08:00", "09:30", "11:00", "13:30", "15:00", "17:30"],
    LOY: ["08:15", "09:45", "11:15", "13:45", "15:15", "17:45"],
  },
  Saturday: {},
  Sunday: {},
}));

describe("findNextBusTime", () => {
  it("returns the next bus time when there are buses available", () => {
    expect(findNextBusTime("Monday", "SGW", "08:15")).toBe("09:30");
    expect(findNextBusTime("Monday", "LOY", "08:30")).toBe("09:45");
  });

  it("returns the first bus if the current time is before the first bus", () => {
    expect(findNextBusTime("Monday", "SGW", "07:30")).toBe("08:00");
  });

  it("returns 'No more buses today' if the current time is after the last bus", () => {
    expect(findNextBusTime("Monday", "SGW", "18:00")).toBe("No more buses today");
  });

  it("returns 'No more buses today' when all buses have passed", () => {
    expect(findNextBusTime("Monday", "LOY", "18:00")).toBe("No more buses today");
  });

  it("returns null for invalid days (weekends)", () => {
    expect(findNextBusTime("Saturday", "SGW", "10:00")).toBeNull();
    expect(findNextBusTime("Sunday", "LOY", "10:00")).toBeNull();
  });

  it("returns null for invalid campuses", () => {
    expect(findNextBusTime("Monday", "UNKNOWN", "10:00")).toBeNull();
  });
});
