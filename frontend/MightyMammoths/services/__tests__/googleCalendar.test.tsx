import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import GoogleCalendarButton from "../../components/ui/input/GoogleCalendarButton";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import axios from "axios";

// Mock Google Sign-In
jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    hasPlayServices: jest.fn().mockResolvedValue(true),
    configure: jest.fn(),
    signIn: jest.fn(),
    getTokens: jest.fn(),
  },
}));

// Mock axios
jest.mock("axios");

describe("GoogleCalendarButton", () => {
  const mockNavigateToRoutes = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({}); // Always resolve signIn
  });

  it("renders the connect button when no event is available", () => {
    const { getByText } = render(
      <GoogleCalendarButton navigateToRoutes={mockNavigateToRoutes} />
    );
    expect(getByText("Connect to Google Calendar")).toBeTruthy();
  });

  it("handles calendar fetch errors gracefully", async () => {
    (GoogleSignin.getTokens as jest.Mock).mockResolvedValue({ accessToken: "token" });
    (axios.get as jest.Mock).mockRejectedValue(new Error("Calendar Fetch Error"));

    const { getByText } = render(
      <GoogleCalendarButton navigateToRoutes={mockNavigateToRoutes} />
    );

    fireEvent.press(getByText("Connect to Google Calendar"));
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  });

  it("fetches the event SOEN345 with location MB and description S2.330", async () => {
    (GoogleSignin.getTokens as jest.Mock).mockResolvedValue({ accessToken: "token" });
    (axios.get as jest.Mock)
      .mockResolvedValueOnce({
        data: {
          items: [{ id: "calendar_1", summary: "Calendar 1" }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              summary: "SOEN345",
              location: "MB",
              description: "S2.330",
              start: { dateTime: new Date().toISOString() },
              end: { dateTime: new Date().toISOString() },
            },
          ],
        },
      });

    const { getByText, queryByText } = render(
      <GoogleCalendarButton navigateToRoutes={mockNavigateToRoutes} />
    );

    fireEvent.press(getByText("Connect to Google Calendar"));
    await waitFor(() => getByText("Calendar 1"));
    fireEvent.press(getByText("Calendar 1"));
    await waitFor(() => expect(queryByText("Next Class")).toBeTruthy());
    expect(queryByText("SOEN345 at S2.330")).toBeTruthy();
  });

  it("selects calendar and fetches events successfully", async () => {
    (GoogleSignin.getTokens as jest.Mock).mockResolvedValue({ accessToken: "token" });
    (axios.get as jest.Mock)
      .mockResolvedValueOnce({
        data: { items: [{ id: "calendar_1", summary: "Calendar 1" }] },
      })
      .mockResolvedValueOnce({
        data: {
          items: [{ summary: "Test Event", start: { dateTime: new Date().toISOString() } }],
        },
      });
  
    const { getByText } = render(
      <GoogleCalendarButton navigateToRoutes={mockNavigateToRoutes} />
    );
  
    fireEvent.press(getByText("Connect to Google Calendar"));
    await waitFor(() => getByText("Calendar 1"));
    fireEvent.press(getByText("Calendar 1"));
  
    await waitFor(() => expect(getByText("Test Event at")).toBeTruthy());
  });
  
  it("handles events without description or location gracefully", async () => {
    (GoogleSignin.getTokens as jest.Mock).mockResolvedValue({ accessToken: "token" });
    (axios.get as jest.Mock)
      .mockResolvedValueOnce({
        data: { items: [{ id: "calendar_1", summary: "Calendar 1" }] },
      })
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              summary: "Event Without Location",
              start: { dateTime: new Date().toISOString() },
              end: { dateTime: new Date().toISOString() },
            },
          ],
        },
      });
  
    const { getByText } = render(
      <GoogleCalendarButton navigateToRoutes={mockNavigateToRoutes} />
    );
  
    fireEvent.press(getByText("Connect to Google Calendar"));
    await waitFor(() => getByText("Calendar 1"));
    fireEvent.press(getByText("Calendar 1"));
  
    await waitFor(() =>
      expect(getByText("Event Without Location at")).toBeTruthy()
    );
  });
  
  it("calls navigateToRoutes when directions button is pressed", async () => {
    (GoogleSignin.getTokens as jest.Mock).mockResolvedValue({ accessToken: "token" });
    (axios.get as jest.Mock)
      .mockResolvedValueOnce({
        data: { items: [{ id: "calendar_1", summary: "Calendar 1" }] },
      })
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              summary: "SOEN345",
              location: "MB",
              description: "S2.330",
              start: { dateTime: new Date().toISOString() },
              end: { dateTime: new Date().toISOString() },
            },
          ],
        },
      });
  
    const { getByText } = render(
      <GoogleCalendarButton navigateToRoutes={mockNavigateToRoutes} />
    );
  
    fireEvent.press(getByText("Connect to Google Calendar"));
    await waitFor(() => getByText("Calendar 1"));
    fireEvent.press(getByText("Calendar 1"));
  
    await waitFor(() => getByText("Show Directions"));
    fireEvent.press(getByText("Show Directions"));
  
    expect(mockNavigateToRoutes).toHaveBeenCalledWith("MB");
  });  

});
