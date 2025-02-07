import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState, useRef } from 'react';

import GoogleCalendarButton from '../input/GoogleCalendarButton';
import ActionSheet from 'react-native-actions-sheet';
import ToggleSwitch from '../input/ToggleSwitch';
import RetroSwitch from '../input/RetroSwitch';
import { ActionSheetProps } from 'react-native-actions-sheet';
import {ActionSheetRef, useSheetRef} from "react-native-actions-sheet";

export type LoyolaSGWToggleSheetProps = ActionSheetProps & {
    setSelectedCampus: React.Dispatch<React.SetStateAction<string>>;
    actionsheetref: React.MutableRefObject<ActionSheetRef | null>;
}

function LoyolaSGWToggleSheet({
    isModal = false,
    snapPoints = [17, 70],
    setSelectedCampus,
    backgroundInteractionEnabled = true,
    closable = false,
    gestureEnabled = true,
    initialSnapIndex = 0,
    overdrawEnabled = false,
    overdrawSize = 200,
    actionsheetref
}: LoyolaSGWToggleSheetProps) {
    // const actionSheetRef = useRef<ActionSheetRef>(null);
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    // useEffect(()=>{
    //     actionSheetRef.current?.show();
    // },[]);

    return (
      <ActionSheet
        ref={actionsheetref}
        isModal={isModal} 
        snapPoints={snapPoints} 
        backgroundInteractionEnabled={backgroundInteractionEnabled}
        closable={closable}
        gestureEnabled={gestureEnabled}
        initialSnapIndex={initialSnapIndex}
        containerStyle={styles.root}
        overdrawEnabled={overdrawEnabled}
        overdrawSize={overdrawSize}
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
            <RetroSwitch value={isEnabled} onValueChange={(value)=>{
                setIsEnabled(value)        
            }} />
          </View>
      </ActionSheet>
    );
  }

  const styles = StyleSheet.create({
    root:{
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
   
  export default LoyolaSGWToggleSheet;