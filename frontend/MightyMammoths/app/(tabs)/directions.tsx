import React, {useRef, useMemo, useEffect,useState} from 'react';
import {StyleSheet, View, Text } from 'react-native';
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams } from "expo-router";

import { LiveNavigation } from '@/components/LiveInformation';
import { NavigationInformation } from '@/components/NavigationInformation';

export default function NavigationScreen () {
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["20%", "60%"], []);
    const [showStartNavigation, setShowStartNavigation] = useState(false);
    const { destination } = useLocalSearchParams();
    
    return (
    <>
      <GestureHandlerRootView style={styles.container}>
        <NavigationInformation
          destinationBuilding={destination as string}
        >
        </NavigationInformation>
        <BottomSheet
            ref={sheetRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            backgroundStyle={{backgroundColor: '#010213'}}
            handleIndicatorStyle={{backgroundColor: 'white'}}
            >
            <LiveNavigation></LiveNavigation>
        </BottomSheet>
      </GestureHandlerRootView>
    </>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      paddingTop:25,
      padding: 0,

    },

    
  });