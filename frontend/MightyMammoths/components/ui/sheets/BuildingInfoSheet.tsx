import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState, useRef } from 'react';

import GoogleCalendarButton from '../input/GoogleCalendarButton';
import ActionSheet from 'react-native-actions-sheet';
import ToggleSwitch from '../input/ToggleSwitch';
import RetroSwitch from '../input/RetroSwitch';
import { ActionSheetProps } from 'react-native-actions-sheet';
import {ActionSheetRef, useSheetRef} from "react-native-actions-sheet";

export type BuildingInfoSheetProps = ActionSheetProps & {
    actionsheetref: React.MutableRefObject<ActionSheetRef | null>;
}

function BuildingInfoSheet({
    isModal = false,
    snapPoints = [80],
    backgroundInteractionEnabled = true,
    closable = true,
    gestureEnabled = true,
    initialSnapIndex = 0,
    overdrawEnabled = false,
    overdrawSize = 200,
    actionsheetref
}: BuildingInfoSheetProps) {
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
  
    return (
      <ActionSheet
        ref={actionsheetref}
        isModal={isModal} 
        snapPoints={snapPoints} 
        backgroundInteractionEnabled={backgroundInteractionEnabled}
        closable={closable}
        gestureEnabled={gestureEnabled}
        initialSnapIndex={initialSnapIndex}
        overdrawEnabled={overdrawEnabled}
        overdrawSize={overdrawSize}
        containerStyle={styles.root}
        >
          <View style={styles.centeredView}>

          </View>
      </ActionSheet>
    );
  }

   
  const styles = StyleSheet.create({
    root:{
        height: '70%',
        backgroundColor: '#010213',
        borderRadius: 10
    },
    centeredView: {
        marginTop: "10%",
        alignItems: "center",
        justifyContent: 'flex-start',
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


  export default BuildingInfoSheet;