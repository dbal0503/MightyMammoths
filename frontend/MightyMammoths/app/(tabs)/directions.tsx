import React, {useRef, useMemo, useEffect,useState} from 'react';
import {StyleSheet, View, Text } from 'react-native';
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {TransportChoice} from "@/components/RoutesSheet";
import { DestinationChoices } from '@/components/Destinations';



export default function DirectionsScreen () {
    

    return (
    <>
      <GestureHandlerRootView style={styles.container}>
            <DestinationChoices>
            </DestinationChoices>
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
