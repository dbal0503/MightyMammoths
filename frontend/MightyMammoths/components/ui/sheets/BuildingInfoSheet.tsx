import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState, useRef } from 'react';

import GoogleCalendarButton from '../input/GoogleCalendarButton';
import ActionSheet from 'react-native-actions-sheet';
import ToggleSwitch from '../input/ToggleSwitch';
import RetroSwitch from '../input/RetroSwitch';
import { ActionSheetProps } from 'react-native-actions-sheet';
import {ActionSheetRef, useSheetRef} from "react-native-actions-sheet";

export type BuildingInfoSheetProps = ActionSheetProps & {
    setSelectedCampus: React.Dispatch<React.SetStateAction<string>>;
}

function BuildingInfoSheet({
    isModal = false,
    snapPoints = [70],
    setSelectedCampus,
    backgroundInteractionEnabled = true,
    closable = true,
    gestureEnabled = true,
    initialSnapIndex = 0,
    overdrawEnabled = false,
    overdrawSize = 200,
}: BuildingInfoSheetProps) {
    const actionSheetRef = useRef<ActionSheetRef>(null);
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    useEffect(()=>{
        actionSheetRef.current?.show();
    },[]);

    return (
      <ActionSheet
        ref={actionSheetRef}
        isModal={isModal} 
        snapPoints={snapPoints} 
        backgroundInteractionEnabled={backgroundInteractionEnabled}
        closable={closable}
        gestureEnabled={gestureEnabled}
        initialSnapIndex={initialSnapIndex}
        overdrawEnabled={overdrawEnabled}
        overdrawSize={overdrawSize}
        >

      </ActionSheet>
    );
  }

   
  export default BuildingInfoSheet;