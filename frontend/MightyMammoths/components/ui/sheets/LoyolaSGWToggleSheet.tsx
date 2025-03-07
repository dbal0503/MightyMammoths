import { View, Text, StyleSheet } from 'react-native';
import { useState } from 'react';

import GoogleCalendarButton from '../input/GoogleCalendarButton';
import ActionSheet from 'react-native-actions-sheet';
import ToggleSwitch from '../input/ToggleSwitch';
import RetroSwitch from '../input/RetroSwitch';
import { ActionSheetProps } from 'react-native-actions-sheet';
import {ActionSheetRef } from "react-native-actions-sheet";

export type LoyolaSGWToggleSheetProps = ActionSheetProps & {
  setSelectedCampus: (selected: string) => void;
  actionsheetref: React.MutableRefObject<ActionSheetRef | null>;
  navigateToRoutes: (destination: string) => void;
};


function LoyolaSGWToggleSheet({
    isModal = false,
    snapPoints = [30, 100],
    setSelectedCampus,
    backgroundInteractionEnabled = true,
    closable = false,
    gestureEnabled = true,
    initialSnapIndex = 0,
    overdrawEnabled = false,
    overdrawSize = 200,
    actionsheetref,
    zIndex = 300,
    navigateToRoutes,
}: LoyolaSGWToggleSheetProps) {
    const [isEnabled, setIsEnabled] = useState(false);


    return (
      <ActionSheet
        ref={actionsheetref}
        testID="home-page-sheet"
        isModal={isModal} 
        snapPoints={snapPoints} 
        backgroundInteractionEnabled={backgroundInteractionEnabled}
        closable={closable}
        gestureEnabled={gestureEnabled}
        initialSnapIndex={initialSnapIndex}
        containerStyle={styles.root}
        overdrawEnabled={overdrawEnabled}
        overdrawSize={overdrawSize}
        zIndex={zIndex}
        >
          <View style={styles.centeredView}>
            <ToggleSwitch
              options={[
                { label: "SGW", testID: "campus-option-sgw" },
                { label: "LOY", testID: "campus-option-loy" }
              ]}
              onToggle={(selected) => {
                if (selected === "SGW") setSelectedCampus(selected);
                else setSelectedCampus(selected)
                }
              }
            />
          </View>
          <Text testID="calendar-text" style={styles.subTitleText}>Calendar</Text>
          <GoogleCalendarButton navigateToRoutes={(destination: string) => navigateToRoutes(destination)} />
          <Text style={styles.subTitleText}>Accessibility</Text>
          <View style={styles.accessibilityContainer}>
            <Text testID="accessbility-mode-text" style={styles.accessibilityLabel}>Accessibility mode</Text>
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
        paddingBottom: 40,
      },
  });
   
  export default LoyolaSGWToggleSheet;