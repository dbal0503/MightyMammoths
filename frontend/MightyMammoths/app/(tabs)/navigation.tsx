//screen for choosing start and end destination
import React, {useRef, useMemo} from 'react';
import {StyleSheet, View, Text } from 'react-native';
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {TransportChoice} from "@/components/RoutesSheet";

export default function NavigationScreen () {
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
        <TransportChoice/>
        </BottomSheet>
      </GestureHandlerRootView>
    </>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
  });
