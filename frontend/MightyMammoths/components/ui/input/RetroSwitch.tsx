import React from "react";
import { Pressable, Animated, StyleSheet } from "react-native";

interface RetroSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const RetroSwitch: React.FC<RetroSwitchProps> = ({ value, onValueChange }) => {
  const translateX = new Animated.Value(value ? 1 : 0);

  const toggleSwitch = () => {
    Animated.timing(translateX, {
      toValue: value ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
    onValueChange(!value);
  };

  return (
    <Pressable style={styles.switchContainer} onPress={toggleSwitch}>
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [
              {
                translateX: translateX.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 18],
                }),
              },
            ],
          },
        ]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    width: 50,
    height: 30,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "white",
    backgroundColor: "transparent",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
  },
});

export default RetroSwitch;
