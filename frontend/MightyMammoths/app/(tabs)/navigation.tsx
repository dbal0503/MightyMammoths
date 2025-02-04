//screen for choosing start and end destination
import React, {useRef, useMemo} from 'react';
import {StyleSheet, View, Text } from 'react-native';
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {TransportChoice} from "@/components/RoutesSheet";
import { DestinationChoices } from '@/components/Destinations';


export default function NavigationScreen () {
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["20%", "60%"], []);
    return (
    <>
      <GestureHandlerRootView style={styles.container}>
        <DestinationChoices>
        </DestinationChoices>
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
      alignItems: 'center',
      paddingTop:25,
      padding: 0,

    },

    
  });
