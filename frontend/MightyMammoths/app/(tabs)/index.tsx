import React, { useCallback, useRef, useMemo, useState } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import ToggleSwitch from "@/components/ui/input/ToggleSwitch";
import GoogleCalendarButton from "@/components/ui/input/GoogleCalendarButton";
import RetroSwitch from "@/components/ui/input/RetroSwitch";
import BuildingDropdown from "@/components/ui/input/BuildingDropdown";

export default function HomeScreen() {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["20%", "70%"], []);
  const [selectedCampus, setSelectedCampus] = useState("SGW");
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
 

  //TODO: fetch list of buildings from backend
  const buildingList = ["EV","Hall", "JMSB", "CL Building", "Learning Square"];


  return (
    <>
      <GestureHandlerRootView style={styles.container}>
        <BuildingDropdown options={buildingList} onSelect={(selected) => console.log(selected)} />
        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          backgroundStyle={{backgroundColor: '#010213'}}
          handleIndicatorStyle={{backgroundColor: 'white'}}
        >
        <View style={styles.centeredView}>
          <ToggleSwitch
            options={["SGW", "LOY"]}
            onToggle={(selected) => setSelectedCampus(selected)}
          />
        </View>
          <Text style={styles.subTitleText}>Calendar</Text>
          <GoogleCalendarButton />
          <Text style={styles.subTitleText}>Accessibility</Text>
          <View style={styles.accessibilityContainer}>
            <Text style={styles.accessibilityLabel}>Accessibility mode</Text>
            <RetroSwitch value={isEnabled} onValueChange={setIsEnabled} />
          </View>
        </BottomSheet>
      </GestureHandlerRootView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
    backgroundColor: 'white',
  },

  centeredView: {
    marginTop: "10%",
    alignItems: "center",
    justifyContent: "center",
  },
  subTitleText : {
    color: "#b2b3b8",
    fontSize: 16,
    marginLeft: 40,
    marginTop: 30,
  },
  accessibilityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 40,
    marginRight: 40,
    marginTop: 20,
  },
  accessibilityLabel: {
    color: "white",
    fontSize: 22,
  },
});