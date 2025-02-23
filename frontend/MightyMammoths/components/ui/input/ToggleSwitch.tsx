import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";

interface ToggleOption {
  label: string;
  testID: string; 
}

interface ToggleSwitchProps {
  options: ToggleOption[];
  onToggle: (selected: string) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ options, onToggle }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const translateX = new Animated.Value(selectedIndex === 0 ? 0 : 1);

  const handleToggle = (index: number) => {
    setSelectedIndex(index);
    Animated.timing(translateX, {
      toValue: index,
      duration: 250,
      useNativeDriver: false,
    }).start();
    onToggle(options[index].label);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.slider,
          {
            width: "48%",
            transform: [
              {
                translateX: translateX.interpolate({
                  inputRange: [0, 1],
                  outputRange: [5, 150],
                }),
              },
            ],
          },
        ]}
      />
      {options.map((option, index) => (
        <Pressable
          key={option.label}
          testID={option.testID}
          style={styles.option}
          onPress={() => handleToggle(index)}
        >
          <Text style={[styles.text, selectedIndex === index && styles.selectedText]}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: 300,
    height: 60,
    backgroundColor: "#ACACAC",
    borderRadius: 30,
    alignItems: "center",
    position: "relative",
    padding: 2,
  },
  slider: {
    position: "absolute",
    height: 50,
    backgroundColor: "white",
    borderRadius: 25,
   
    justifyContent: "center",
    alignItems: "center",
  },
  option: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  text: {
    fontSize: 20,
    color: "black",
  },
  selectedText: {
    fontWeight: "bold",
  },
});

export default ToggleSwitch;
