import { View, Text, StyleSheet, Pressable } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import { ActionSheetProps } from 'react-native-actions-sheet';
import {ActionSheetRef} from "react-native-actions-sheet";
import { GeoJsonFeature } from '../BuildingMapping';


export type BuildingInfoSheetProps = ActionSheetProps & {
  actionsheetref: React.MutableRefObject<ActionSheetRef | null>;
  building: GeoJsonFeature;
  navigate: (destination: string) => void;
  onClose: () => void; 
}


function BuildingInfoSheet({
    isModal = false,
    snapPoints = [65],
    backgroundInteractionEnabled = false,
    closable = true,
    gestureEnabled = true,
    initialSnapIndex = 0,
    overdrawEnabled = false,
    overdrawSize = 200,
    actionsheetref,
    building,
    navigate,
    onClose,
}: BuildingInfoSheetProps) {
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
        onClose={onClose}
        >
      <View style={styles.container}>
    <Text style={styles.header}>{building?.properties['Building Long Name']}</Text>
    <View style={styles.buttonsContainer}>
            <View style={[
                styles.button, styles.destinationButton
                ]}>
            <Pressable onPress={navigate}>
                <Text style={styles.buttonText}>Set As Destination</Text>
            </Pressable>
            

            </View>
            <View style={
                [styles.button, styles.indoorMapButton]
                }>
            <Pressable>
                <Text style={styles.buttonText}>View Indoor Map</Text>
                </Pressable>
            </View>
    </View>

    <Text style={styles.header}>Information:</Text>
    <View style={styles.buttonsContainer}>
        <View style={styles.button}>
            <Text style={styles.buttonText}>{building.properties.BuildingName}</Text>
        </View>
        <View style={styles.button}>
            <Text style={styles.buttonText}>{building.properties.Campus}</Text>
        </View>
    </View>

    <View style={styles.buttonsContainer}>
        <View style={styles.button}>
            <Text style={styles.buttonText}>{building.properties.Address}</Text>
        </View>
    </View>
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
  button: {
    backgroundColor: '#1c1c1e',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
},
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingBlock: 8
  },
  indoorMapButton: {
    backgroundColor: '#800000', 
    fontWeight: 'bold',
    fontSize: 20
},
buttonText: {
  color: 'white',
  fontSize: 16,
},
destinationButton: {
  backgroundColor: '#007AFF', 
  fontWeight: 'bold',
  fontSize: 20
  
},
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  }
});

export default BuildingInfoSheet;