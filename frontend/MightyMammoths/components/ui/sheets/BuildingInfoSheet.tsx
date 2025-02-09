import { View, Text, StyleSheet, Pressable } from 'react-native';
import {useState} from 'react';
import ActionSheet from 'react-native-actions-sheet';
import { ActionSheetProps } from 'react-native-actions-sheet';
import {ActionSheetRef} from "react-native-actions-sheet";
import { GeoJsonFeature } from '../BuildingMapping';

export type BuildingInfoSheetProps = ActionSheetProps & {
    actionsheetref: React.MutableRefObject<ActionSheetRef | null>;
    building: GeoJsonFeature;
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
    building
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
    <Text style={styles.header}>{building?.properties['Building Long Name']}</Text>
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
    <View style={styles.buttonsContainer}>
            <View style={styles.button}>
            <Pressable>
                <Text style={styles.buttonText}>Set As Destination</Text>
                </Pressable>
            </View>
            <View style={styles.button}>
            <Pressable>
                <Text style={styles.buttonText}>View Indoor Map</Text>
                </Pressable>
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
  
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        backgroundColor: '#1c1c1e',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    destinationButton: {
        backgroundColor: '#007AFF', 
    },
    indoorMapButton: {
        backgroundColor: '#800000', 
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
    },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
},
info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
},
});
  

export default BuildingInfoSheet;