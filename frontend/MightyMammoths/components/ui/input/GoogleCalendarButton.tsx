import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import axios from "axios";

GoogleSignin.configure({
  webClientId:
    "1069237773869-m1q5nruuve50ee7a9enku70vr1f057fj.apps.googleusercontent.com",
});

const GoogleCalendarButton: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nextEvent, setNextEvent] = useState<any | null>(null);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.configure({
        scopes: [
          "https://www.googleapis.com/auth/calendar.readonly",
          "https://www.googleapis.com/auth/calendar.events.readonly",
        ],
      });
      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      setAccessToken(tokens.accessToken);
      return tokens.accessToken;
    } catch (error: any) {
      Alert.alert("Google Sign-In Error", error.message);
      return null;
    }
  };

  const fetchCalendars = async (token: string) => {
    try {
      const res = await axios.get(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const items = res.data.items;
      if (items && items.length > 0) {
        setCalendars(items);
        setModalVisible(true);
      } else {
        Alert.alert("No calendars found.");
      }
    } catch {
      Alert.alert("Error fetching calendars");
    }
  };

  const fetchEvents = async (calendarId: string, token: string) => {
    try {
      const res = await axios.get(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
          calendarId
        )}/events`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            orderBy: "startTime",
            singleEvents: true,
            timeMin: new Date().toISOString(),
          },
        }
      );
      const events = res.data.items;
      if (events && events.length > 0) {
        const event = events[0];
        const eventName = event.summary || "No Title";
        const description = event.description || "";
        const location = event.location || "";
        const startDateTime = event.start?.dateTime
          ? new Date(event.start.dateTime)
          : null;
        const endDateTime = event.end?.dateTime
          ? new Date(event.end.dateTime)
          : null;

        let timeRange = "";
        if (startDateTime && endDateTime) {
          const startStr = startDateTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const endStr = endDateTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          timeRange = `${startStr} - ${endStr}`;
        }

        // Take the class from description only
        setNextEvent({
          name: eventName,
          description: description,
          location: location,
          time: timeRange,
        });
      } else {
        setNextEvent(null);
      }
    } catch {
      Alert.alert("Error fetching events");
    }
  };

  const handleGoogleCalendarConnect = async () => {
    let token = accessToken;
    if (!token) {
      token = await signInWithGoogle();
    }
    if (token) {
      fetchCalendars(token);
    }
  };

  const selectCalendar = (calendar: any) => {
    setModalVisible(false);
    if (accessToken) {
      fetchEvents(calendar.id, accessToken);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={handleGoogleCalendarConnect}>
          <Image
            source={{
              uri: "https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-03-512.png",
            }}
            style={styles.icon}
          />
          {nextEvent ? (
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.nextClassLabel}>Next Class</Text>
              <Text style={styles.eventText}>
                {nextEvent.name} at {nextEvent.description}
              </Text>
              <Text style={styles.timeText}>{nextEvent.time}</Text>
              <Pressable
                style={styles.showDirectionsButton}
                onPress={() =>
                  console.log(`Address/Directions: ${nextEvent.description}, `+ `${nextEvent.location}` + `, Time: ${nextEvent.time}`)
                }
              >
                <Text style={styles.showDirectionsText}>Show Directions</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.buttonText}>Connect to Google Calendar</Text>
          )}
        </Pressable>
      </View>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Calendar</Text>
            <FlatList
              data={calendars}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selectCalendar(item)}
                >
                  <Text style={styles.modalItemText}>{item.summary}</Text>
                </TouchableOpacity>
              )}
            />
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 20,
  },
  dateContainer: {
    backgroundColor: "#4E312E",
    padding: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    width: 280,
  },
  dateText: {
    color: "white",
    fontSize: 16,
    marginLeft: 5,
  },
  buttonContainer: {
    backgroundColor: "#ACACAC",
    width: 280,
    padding: 15,
    alignItems: "center",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "white",
    width: "95%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  icon: {
    width: 60,
    height: 60,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "black",
    marginLeft: 10,
  },
  nextClassLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  eventText: {
    fontSize: 14,
  },
  timeText: {
    fontSize: 14,
    marginTop: 2,
  },
  showDirectionsButton: {
    backgroundColor: "#452525",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  showDirectionsText: {
    color: "#fff",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: 300,
    maxHeight: 400,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalItemText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 10,
    alignSelf: "flex-end",
  },
  modalCloseButtonText: {
    color: "blue",
    fontSize: 16,
  },
});

export default GoogleCalendarButton;
