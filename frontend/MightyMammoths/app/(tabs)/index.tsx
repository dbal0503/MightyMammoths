import React, { useCallback, useRef, useMemo, useState, useEffect } from "react";
import { StyleSheet, View, Text, Button, KeyboardAvoidingView, Keyboard  } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import LoyolaSGWToggleSheet from "@/components/ui/sheet/LoyolaSGWToggleSheet";

import '@/components/Sheets'

import BuildingDropdown from "@/components/ui/input/BuildingDropdown";
import RoundButton from "@/components/ui/buttons/RoundButton";

export default function HomeScreen() {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["17%", "70%"], []);
  const [selectedCampus, setSelectedCampus] = useState("SGW");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
 
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
      sheetRef.current?.close();
    });

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
      sheetRef.current?.snapToPosition("20%");
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
          <RoundButton imageSrc={require('@/assets/images/recenter-map.png')} onPress={()=>{
            
          }} /> 
        </View>
        <LoyolaSGWToggleSheet
          setSelectedCampus={setSelectedCampus}
        />
      </GestureHandlerRootView>
    </>
  );
};

const styles = StyleSheet.create({
  root:{
    backgroundColor: '#010213',
    borderRadius: 10
  },
  container: {
    flex: 1,
    paddingTop: 70,
    backgroundColor: 'white',
  },
  dropdownWrapper: {
    top: '-29%',
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