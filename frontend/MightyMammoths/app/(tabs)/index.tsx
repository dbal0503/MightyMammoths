import React, { useCallback, useRef, useMemo } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

export default function HomeScreen() {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["20%", "70%"], []);

 
  return (
    <>
      <GestureHandlerRootView style={styles.container}>
        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          backgroundStyle={{backgroundColor: '#010213'}}
          handleIndicatorStyle={{backgroundColor: 'white'}}
        >
            <View style={styles.outerRectangle}/>   
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

  outerRectangle: {
      height: '10%',
      marginTop: '10%',
      marginLeft: '14%',
      width: '70%',
      backgroundColor: '#ACACAC',
      borderRadius: 22,
  },
});