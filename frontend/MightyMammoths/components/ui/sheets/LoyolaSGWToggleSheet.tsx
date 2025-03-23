import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';
import GoogleCalendarButton from '../input/GoogleCalendarButton';
import ToggleSwitch from '../input/ToggleSwitch';
import RetroSwitch from '../input/RetroSwitch';
import ActionSheet, { ActionSheetProps, ActionSheetRef } from 'react-native-actions-sheet';
import SmartPlannerModal from '../SmartPlannerModal';

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
  closable = true,
  gestureEnabled = true,
  initialSnapIndex = 0,
  overdrawEnabled = false,
  overdrawSize = 200,
  actionsheetref,
  zIndex = 300,
  navigateToRoutes,
}: LoyolaSGWToggleSheetProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [smartPlannerVisible, setSmartPlannerVisible] = useState(false);
  const [nextEvent, setNextEvent] = useState<any | null>(null);

  const openSmartPlanner = () => {
    actionsheetref.current?.hide();
    setTimeout(() => setSmartPlannerVisible(true), 300);
  };
  

  const closeSmartPlanner = () => {
    setSmartPlannerVisible(false);
    actionsheetref.current?.show();
  };

  return (
    <>
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
        keyboardHandlerEnabled={false}
        closeOnTouchBackdrop={false}
        closeOnPressBack={false}
      >
        <View style={styles.centeredView}>
          <ToggleSwitch
            options={[
              { label: "SGW", testID: "campus-option-sgw" },
              { label: "LOY", testID: "campus-option-loy" }
            ]}
            onToggle={(selected) => setSelectedCampus(selected)}
          />
        </View>
        <Text testID="calendar-text" style={styles.subTitleText}>Calendar</Text>
        <GoogleCalendarButton
          testID="google-calendar-button"
          onNextEvent={(eventData) => setNextEvent(eventData)}
          navigateToRoutes={(destination: string) => navigateToRoutes(destination)}
        />
        <TouchableOpacity testID="smart-planner-button" style={styles.smartPlannerButton} onPress={openSmartPlanner}>
          <Image source={require('../../../assets/images/smart-planner-logo.png')} />
          <Text style={styles.smartPlannerButtonText}>Smart Planner</Text>
        </TouchableOpacity>
        <Text style={styles.subTitleText}>Accessibility</Text>
        <View style={styles.accessibilityContainer}>
          <Text testID="accessibility-mode-text" style={styles.accessibilityLabel}>Accessibility mode</Text>
          <RetroSwitch value={isEnabled} onValueChange={setIsEnabled} />
        </View>
      </ActionSheet>
      <SmartPlannerModal
        visible={smartPlannerVisible}
        onClose={closeSmartPlanner}
        nextEvent={nextEvent}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#010213',
    borderRadius: 10,
  },
  centeredView: {
    marginTop: "10%",
    alignItems: "center",
    justifyContent: 'flex-start',
  },
  subTitleText: {
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
    paddingBottom: 45,
  },
  smartPlannerButton: {
    marginLeft: 40,
    marginTop: 20,
    padding: 10,
    backgroundColor: '#122F92',
    borderRadius: 8,
    width: '80%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  smartPlannerButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default LoyolaSGWToggleSheet;
