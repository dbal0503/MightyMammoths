import React, { useCallback, useRef, useMemo, useState } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

import ToggleSwitch from "@/components/ui/input/ToggleSwitch";
import GoogleCalendarButton from "@/components/ui/input/GoogleCalendarButton";
import RetroSwitch from "@/components/ui/input/RetroSwitch";
import BuildingDropdown from "@/components/ui/input/BuildingDropdown";
import RoundButton from "@/components/ui/buttons/RoundButton";

export default function HomeScreen() {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["17%", "70%"], []);
  const [selectedCampus, setSelectedCampus] = useState("SGW");
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
 

  //TODO: fetch list of buildings from backend
  const buildingList = ["EV","Hall", "JMSB", "CL Building", "Learning Square"];

//TODO: settings button onclick -> either nav to settings screen or have a modal slide down
//TODO: recenter map onclick -> should re-center map on location
  return (
    <>
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.topElements}>
          <RoundButton imageSrc={require('@/assets/images/gear.png')} /> 
          <View style={styles.dropdownWrapper}>
            <BuildingDropdown options={buildingList} onSelect={(selected) => console.log(selected)} />
          </View>
        </View>
        <View style={styles.bottomElements}>
          <RoundButton imageSrc={require('@/assets/images/recenter-map.png')} /> 
        </View>
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
    paddingTop: 70,
    backgroundColor: 'white',
  },
  dropdownWrapper: {
    top: '-28%',
    height: '10%'
  },
  bottomElements: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    position: 'absolute',
    width: '100%',
    bottom: '22%',
    paddingRight: 20
  },
  topElements: {
    gap: '6%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '10%'
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