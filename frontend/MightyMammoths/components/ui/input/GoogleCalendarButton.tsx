import React from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";

const GoogleCalendarButton: React.FC = () => {


    function handleGoogleCalendarConnect() {
        console.log("To implement later: Connect to Google Calendar....");
    }


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
            source={{ uri: "https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-03-512.png" }}
            style={styles.icon}
          />
          <Text style={styles.buttonText}>Connect to Google Calendar</Text>
        </Pressable>
      </View>
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
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "black",
  },
});

export default GoogleCalendarButton;
