import { View, Text, StyleSheet, Pressable } from 'react-native';
import {useState} from 'react';
import ActionSheet from 'react-native-actions-sheet';
import { ActionSheetProps } from 'react-native-actions-sheet';
import {ActionSheetRef} from "react-native-actions-sheet";
import { GeoJsonFeature } from '../BuildingMapping';
import { navigate } from 'expo-router/build/global-state/routing';

export type BuildingInfoSheetProps = ActionSheetProps & {
    actionsheetref: React.MutableRefObject<ActionSheetRef | null>;
    building: GeoJsonFeature;
    navigate: () => void;
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
    actionsheetref,
    building,
    navigate
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
      <View style={styles.container}>
        <Text style={styles.header}> {building?.properties['Building Long Name']} </Text>
        <Text style={styles.header}> to fill </Text>
        {/* Temporary button for navigation to navigation screen*/}
        <Pressable onPress={navigate}> 
          <Text style={styles.header}>
            Select as Destination
          </Text>
        </Pressable>
      </View>
    </ActionSheet>
    );
  }

const styles = StyleSheet.create({
  root:{
    height: '60%',
    backgroundColor: '#010213',
    borderRadius: 10
  },
  container: {
    backgroundColor: '#0f0f17',
    padding: 20,
    borderRadius: 15,
    maxWidth: 400,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  }
});

export default BuildingInfoSheet;